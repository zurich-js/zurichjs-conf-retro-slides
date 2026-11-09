import { createRoot } from 'react-dom/client'
import { ensureFonts } from './brand/fonts'
import { ASSETS } from './brand/tokens'
import { preloadImages } from './painters/kit'
import { VISUALS } from './content/visuals'
import type { Visual } from './engine/types'
import App from './App'
import './index.css'

// Canvas text measured before fonts load uses fallback metrics, so wait.
const srcs = new Set<string>(ASSETS)
for (const v of Object.values(VISUALS) as Visual[]) {
  if (v.kind === 'image') srcs.add(v.src)
  if (v.kind === 'moments') for (const m of v.moments) srcs.add(m.src)
  if (v.kind === 'journey') for (const person of Object.values(v.journey.people)) srcs.add(person.src)
}

Promise.all([ensureFonts(), preloadImages(srcs)]).then(() => {
  createRoot(document.getElementById('root')!).render(<App />)
})
