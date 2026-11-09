import { CAMERA_CUES, type Slide, type Visual } from './types'

/**
 * Validate the deck once, at module load. Runtime code can then trust every
 * slide; a bad id or a dangling visual fails the dev server immediately
 * instead of on stage.
 */
export function defineSlides(
  catalog: Readonly<Record<string, Visual>>,
  slides: readonly Slide[],
): readonly Slide[] {
  if (slides.length === 0) throw new Error('The deck needs at least one slide')
  const ids = new Set<string>()
  for (const s of slides) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.id)) throw new Error(`Slide id "${s.id}" must be kebab-case`)
    if (ids.has(s.id)) throw new Error(`Duplicate slide id "${s.id}"`)
    ids.add(s.id)
    // Arrows only (Faris, 2026-11-08): one visual per slide, no Enter builds.
    if (s.steps.length !== 1) throw new Error(`Slide "${s.id}" has ${s.steps.length} steps: one visual per slide; make each build its own slide`)
    for (const v of s.steps) {
      if (!catalog[v]) throw new Error(`Slide "${s.id}" references unknown visual "${v}"`)
    }
    if (s.camera !== undefined && !CAMERA_CUES.includes(s.camera)) {
      throw new Error(`Slide "${s.id}" camera "${s.camera}" is not one of ${CAMERA_CUES.join(', ')}`)
    }
    for (const id of s.steps) {
      const v = catalog[id]
      if (v?.kind === 'heatmap') {
        for (const row of v.rows) {
          if (row.values.length !== v.columns.length) throw new Error(`Visual "${id}": row "${row.label}" has ${row.values.length} values for ${v.columns.length} columns`)
        }
      }
      if (v?.kind === 'matrix') {
        for (const row of v.rows) {
          if (row.values.length !== v.columns.length) throw new Error(`Visual "${id}": row "${row.label}" has ${row.values.length} values for ${v.columns.length} columns`)
        }
        if (v.highlight !== undefined && !(v.highlight >= 0 && v.highlight < v.columns.length)) throw new Error(`Visual "${id}": highlight ${v.highlight} is not a column`)
      }
      if (v?.kind === 'moments') {
        if (v.moments.length === 0) throw new Error(`Visual "${id}": no moments`)
        let prev = ''
        for (const m of v.moments) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(m.date)) throw new Error(`Visual "${id}": moment ${m.src} date "${m.date}" is not YYYY-MM-DD`)
          if (m.date < prev) throw new Error(`Visual "${id}": moment ${m.src} is out of date order`)
          if (m.date.slice(0, 7) < v.from || m.date.slice(0, 7) > v.to) throw new Error(`Visual "${id}": moment ${m.src} is outside ${v.from} to ${v.to}`)
          prev = m.date
        }
      }
      if (v?.kind === 'growth') {
        for (const series of v.series) {
          if (series.values.length !== v.x.length) throw new Error(`Visual "${id}": series "${series.label}" has ${series.values.length} values for ${v.x.length} x labels`)
        }
      }
    }
    if (s.effect !== undefined && !(s.effect >= 0 && s.effect <= 1)) {
      throw new Error(`Slide "${s.id}" effect must be between 0 and 1`)
    }
  }
  return Object.freeze(slides.map((s) => Object.freeze(s)))
}
