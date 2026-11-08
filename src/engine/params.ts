const params = new URLSearchParams(window.location.search)

/** ?flat — paint the canvas straight to the page. No WebGL. Authoring + fallback. */
export const FLAT = params.has('flat')
/** ?index — grid of every slide, settled. Presenter tooling. */
export const INDEX = params.has('index')
/** ?presenter — notes, current/next slide and timer; synced to the audience window. */
export const PRESENTER = params.has('presenter')
/** ?cue=<name> — force one camera cue for every slide. Authoring/screenshots of the set. */
export const CUE = params.get('cue')
/** ?still — skip draw-in animation; every step lands settled. For screenshots. */
export const STILL = params.has('still') || matchMedia('(prefers-reduced-motion: reduce)').matches
