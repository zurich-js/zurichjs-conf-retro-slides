import '@fontsource-variable/geist-mono'
import { TYPE } from './tokens'

/**
 * Figtree is the conference's own variable TTF (public/fonts), self-hosted so
 * the deck renders identically with no network. Canvas text measured before a
 * face loads uses fallback metrics, so the first paint waits on this.
 */
const style = document.createElement('style')
style.textContent = `
@font-face { font-family: "Figtree"; src: url("/fonts/Figtree-VariableFont_wght.ttf") format("truetype"); font-weight: 300 900; font-style: normal; font-display: block; }
@font-face { font-family: "Figtree"; src: url("/fonts/Figtree-Italic-VariableFont_wght.ttf") format("truetype"); font-weight: 300 900; font-style: italic; font-display: block; }
`
document.head.appendChild(style)

export function ensureFonts(): Promise<unknown> {
  const w = TYPE.weight
  return Promise.all([
    document.fonts.load(`${w.regular} 64px ${TYPE.sans}`),
    document.fonts.load(`${w.bold} 64px ${TYPE.sans}`),
    document.fonts.load(`${w.black} 64px ${TYPE.sans}`),
    document.fonts.load(`400 64px ${TYPE.mono}`),
  ]).then(() => document.fonts.ready)
}
