/**
 * ZurichJS Conf 2026 sponsors, as listed on conf.zurichjs.com (fetched
 * 2026-11-08). Logos are local copies in public/sponsors/: `<slug>.png` is
 * the white mono logo (for dark grounds), `<slug>-color.png` the colour one.
 * Tiers follow the printed backdrop: headline logos big in the side
 * columns, partners along the bottom, supporters in the middle cluster.
 */

export type SponsorTier = 'headline' | 'partner' | 'supporter'

export interface Sponsor {
  slug: string
  name: string
  tier: SponsorTier
  /** Some sponsors only supplied one logo. */
  color?: boolean
}

export const SPONSORS: readonly Sponsor[] = [
  { slug: 'namespace', name: 'namespace', tier: 'headline', color: true },
  { slug: 'vercel', name: 'Vercel', tier: 'headline', color: true },
  { slug: 'tiptap', name: 'Tiptap', tier: 'headline', color: true },
  { slug: 'ag-grid', name: 'AG Grid', tier: 'headline', color: true },
  { slug: 'smallpdf', name: 'Smallpdf', tier: 'headline', color: true },
  { slug: 'proton', name: 'Proton', tier: 'headline', color: true },
  { slug: 'primeui', name: 'PrimeUI', tier: 'partner', color: true },
  { slug: 'copilotkit', name: 'CopilotKit', tier: 'partner', color: true },
  { slug: 'typesense', name: 'Typesense', tier: 'partner', color: true },
  { slug: 'sae', name: 'SAE Institute', tier: 'partner' },
  { slug: 'cloudflare', name: 'Cloudflare', tier: 'supporter', color: true },
  { slug: 'coderabbit', name: 'CodeRabbit', tier: 'supporter', color: true },
  { slug: 'mittwald', name: 'mittwald', tier: 'supporter', color: true },
  { slug: 'sentry', name: 'Sentry', tier: 'supporter', color: true },
  { slug: 'stickermule', name: 'StickerMule', tier: 'supporter', color: true },
  { slug: 'peaq', name: 'PEAQ', tier: 'supporter', color: true },
  { slug: 'livingdocs', name: 'Livingdocs', tier: 'supporter', color: true },
  { slug: '7druck', name: '7druck', tier: 'supporter', color: true },
  { slug: 'stormkit', name: 'Stormkit', tier: 'supporter', color: true },
  { slug: 'fin', name: 'fin', tier: 'supporter', color: true },
  { slug: 'juranosaurus', name: 'Juranosaurus Techs', tier: 'supporter' },
  { slug: 'six', name: 'SIX', tier: 'supporter', color: true },
  { slug: 'remotion', name: 'Remotion', tier: 'supporter', color: true },
  { slug: 'novu', name: 'novu', tier: 'supporter', color: true },
]

export const sponsorLogo = (slug: string, color = false) =>
  `/sponsors/${slug}${color ? '-color' : ''}.png`

/** Every logo file the set uses, for preloading. */
export const SPONSOR_ASSETS: readonly string[] = SPONSORS.flatMap((s) =>
  s.color ? [sponsorLogo(s.slug), sponsorLogo(s.slug, true)] : [sponsorLogo(s.slug)],
)
