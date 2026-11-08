// Record the deck to an MP4 through a real (headless) Chromium: CDP screencast
// frames, encoded with ffmpeg at a constant frame rate. For PR recordings.
//
//   pnpm build && pnpm preview --port 5181 &
//   pnpm record "http://localhost:5181/?slide=cover" out.mp4 --keys "ArrowRight:3000,ArrowRight:4000" --tail 3000
//
//   --keys   comma list of KEY:waitMs, pressed in order after the page settles
//            (ArrowRight, ArrowLeft, Enter, Backspace)
//   --tail   ms to keep recording after the last key (default 3000)
//   --size   WxH (default 1280x720)
// CHROME=/path/to/chromium overrides the browser binary. Needs ffmpeg on PATH.
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const args = process.argv.slice(2)
const flag = (name, fallback) => { const i = args.indexOf(name); return i === -1 ? fallback : args[i + 1] }
const [url, out = 'recording.mp4'] = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'))
if (!url) throw new Error('usage: pnpm record <url> [out.mp4] [--keys KEY:ms,...] [--tail ms] [--size WxH]')
const keys = (flag('--keys', '') || '').split(',').filter(Boolean).map((k) => { const [key, ms] = k.split(':'); return { key, ms: Number(ms ?? 1500) } })
const tail = Number(flag('--tail', 3000))
const [W, H] = flag('--size', '1280x720').split('x').map(Number)
const FPS = 30
const CODES = { ArrowRight: 39, ArrowLeft: 37, Enter: 13, Backspace: 8 }

const candidates = [
  process.env.CHROME,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
].filter(Boolean)
const browser = candidates.find((p) => existsSync(p))
if (!browser) throw new Error('No Chromium-based browser found; set CHROME=')
if (spawnSync('ffmpeg', ['-version']).status !== 0) throw new Error('ffmpeg not found on PATH')

const port = 9334
const proc = spawn(browser, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'deck-rec-'))}`,
  // Window taller than the page: headless window size includes browser chrome.
  `--window-size=${W},${H + 200}`, '--hide-scrollbars', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const frames = []
const dir = mkdtempSync(join(tmpdir(), 'deck-frames-'))
try {
  let tabs
  for (let i = 0; i < 40 && !tabs; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json() } catch { await sleep(250) } }
  const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl)
  await new Promise((r) => ws.addEventListener('open', r))
  let id = 0
  const pending = new Map()
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id) }
    else if (m.method === 'Page.screencastFrame') {
      frames.push({ t: m.params.metadata.timestamp, data: m.params.data })
      send('Page.screencastFrameAck', { sessionId: m.params.sessionId })
    }
  })
  await send('Page.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false })
  await send('Page.navigate', { url })
  await sleep(4000)
  // Capture the whole window at 1:1, then crop to the page (top-left W × H) in ffmpeg.
  await send('Page.startScreencast', { format: 'jpeg', quality: 85, maxWidth: W, maxHeight: H + 400, everyNthFrame: 1 })
  await sleep(800)
  for (const { key, ms } of keys) {
    const code = CODES[key]
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key, windowsVirtualKeyCode: code })
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, windowsVirtualKeyCode: code })
    await sleep(ms)
  }
  await sleep(tail)
  await send('Page.stopScreencast')
} finally {
  proc.kill()
}
if (frames.length < 2) throw new Error('No frames captured')
// Resample variable-rate screencast frames onto a constant FPS timeline.
const t0 = frames[0].t
const dur = frames[frames.length - 1].t - t0
let k = 0
for (let f = 0; f <= Math.floor(dur * FPS); f++) {
  const t = t0 + f / FPS
  while (k + 1 < frames.length && frames[k + 1].t <= t) k++
  writeFileSync(join(dir, `f${String(f).padStart(6, '0')}.jpg`), Buffer.from(frames[k].data, 'base64'))
}
const enc = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(dir, 'f%06d.jpg'),
  '-vf', `crop=${W}:${H}:0:0,scale=trunc(iw/2)*2:trunc(ih/2)*2`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-movflags', '+faststart', out], { stdio: 'inherit' })
rmSync(dir, { recursive: true, force: true })
if (enc.status !== 0) throw new Error('ffmpeg failed')
console.log(`wrote ${out} (${dur.toFixed(1)}s, ${frames.length} frames)`)
