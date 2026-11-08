// Screenshot one slide through a real (headless) Chromium over CDP, and print
// console output + exceptions. Use this rather than `--screenshot` on the CLI:
// virtual-time headless never runs the WebGL frame loop and gives a blank 3D frame.
//
//   pnpm build && pnpm preview --port 5181 &
//   node scripts/shot.mjs "http://localhost:5181/?still&slide=idea" out.png
//
// CHROME=/path/to/chromium overrides the browser binary.
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const [url, out = 'shot.png', size = '1920,1080'] = process.argv.slice(2)
if (!url) throw new Error('usage: node scripts/shot.mjs <url> [out.png] [w,h]')

const candidates = [
  process.env.CHROME,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
].filter(Boolean)
const browser = candidates.find((p) => existsSync(p))
if (!browser) throw new Error('No Chromium-based browser found; set CHROME=')

const port = 9333
const profile = mkdtempSync(join(tmpdir(), 'deck-shot-'))
const proc = spawn(browser, [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  `--window-size=${size}`, '--hide-scrollbars', '--enable-unsafe-swiftshader', 'about:blank',
], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

try {
  let tabs
  for (let i = 0; i < 40 && !tabs; i++) {
    try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json() } catch { await sleep(250) }
  }
  const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl)
  await new Promise((r) => ws.addEventListener('open', r))
  let id = 0
  const pending = new Map()
  const logs = []
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m.error); pending.delete(m.id) }
    else if (m.method === 'Runtime.consoleAPICalled') logs.push(`${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`)
    else if (m.method === 'Runtime.exceptionThrown') logs.push(`EXCEPTION: ${m.params.exceptionDetails.exception?.description}`)
  })
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
  await send('Runtime.enable')
  await send('Page.enable')
  // Exact viewport: --window-size includes browser chrome, so pin the page size.
  const [vw, vh] = size.split(',').map(Number)
  await send('Emulation.setDeviceMetricsOverride', { width: vw, height: vh, deviceScaleFactor: 1, mobile: false })
  await send('Page.navigate', { url })
  await sleep(4000)
  const shot = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(out, Buffer.from(shot.data, 'base64'))
  if (logs.length) console.log(logs.join('\n'))
  console.log(`wrote ${out}`)
} finally {
  proc.kill()
}
