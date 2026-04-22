// Diccionario editable para sobrescribir cómo se muestran los nombres.
// Permite al administrador corregir casos ambiguos (primer/segundo nombre,
// primer/segundo apellido) sin tocar el script Python.
// Archivo fuente: `public/display_names.json`.

export interface DisplayNamesFile {
  names: Record<string, string>
}

const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

export async function fetchDisplayNames(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${base}/display_names.json`, { cache: 'no-cache' })
    if (!res.ok) return {}
    const data = (await res.json()) as DisplayNamesFile
    return data.names ?? {}
  } catch {
    return {}
  }
}

export type NameResolver = (raw: string) => string

export function buildResolver(dict: Record<string, string>): NameResolver {
  return (raw: string) => {
    if (!raw) return raw
    const k1 = raw.trim()
    const k2 = k1.toUpperCase()
    return dict[k1] ?? dict[k2] ?? titleCase(k1)
  }
}

// Fallback cuando no hay override: pasa a Title Case para que
// ONPE-style "JUAN PEREZ GARCIA" quede "Juan Perez Garcia".
function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase())
}
