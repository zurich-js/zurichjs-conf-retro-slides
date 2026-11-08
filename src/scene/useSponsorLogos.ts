import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import { SPONSOR_ASSETS, SPONSORS, sponsorLogo } from './sponsors'
import type { Logos } from './textures'

/**
 * Every sponsor logo as a loaded image, keyed by slug (white mono) and
 * `<slug>-color`. Suspends until all are loaded; preloaded in Set.tsx.
 */
export function useSponsorLogos(): Logos {
  const textures = useTexture(SPONSOR_ASSETS as string[])
  return useMemo(() => {
    const byUrl = new Map(SPONSOR_ASSETS.map((url, i) => [url, textures[i]!.image as HTMLImageElement]))
    const out: Record<string, HTMLImageElement> = {}
    for (const s of SPONSORS) {
      out[s.slug] = byUrl.get(sponsorLogo(s.slug))!
      if (s.color) out[`${s.slug}-color`] = byUrl.get(sponsorLogo(s.slug, true))!
    }
    return out
  }, [textures])
}
