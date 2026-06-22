// Config editable por el administrador. Archivo fuente:
// `public/display_config.json`. Determina qué dos posiciones del ranking
// comparar en el hero (útil cuando el foco no son el 1ro y 2do).

export interface HeroComparisonConfig {
  candidate_a_position: number  // 1-indexed
  candidate_b_position: number  // 1-indexed
}

export interface DisplayConfig {
  hero_comparison:   HeroComparisonConfig
  candidate_colors:  Record<string, string>   // nombre ONPE exacto → color CSS
  candidate_photos:  Record<string, string>   // nombre ONPE exacto → URL imagen
  candidate_icons:   Record<string, string>   // nombre ONPE exacto → URL ícono partido (mapa)
}

const DEFAULT_CONFIG: DisplayConfig = {
  hero_comparison:  { candidate_a_position: 1, candidate_b_position: 2 },
  candidate_colors: {},
  candidate_photos: {},
  candidate_icons:  {},
}

const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

export async function fetchDisplayConfig(): Promise<DisplayConfig> {
  try {
    const res = await fetch(`${base}/display_config.json`, { cache: 'no-cache' })
    if (!res.ok) return DEFAULT_CONFIG
    const data = (await res.json()) as Partial<DisplayConfig>
    return {
      hero_comparison: {
        ...DEFAULT_CONFIG.hero_comparison,
        ...(data.hero_comparison ?? {}),
      },
      candidate_colors: { ...(data.candidate_colors ?? {}) },
      candidate_photos: { ...(data.candidate_photos ?? {}) },
      candidate_icons:  { ...(data.candidate_icons  ?? {}) },
    }
  } catch {
    return DEFAULT_CONFIG
  }
}
