// Formateadores en español-PE consistentes en toda la UI.

export const fmtInt = (n: number) => n.toLocaleString('es-PE')

export const fmtPct = (n: number, decimals = 2) =>
  `${n.toFixed(decimals)}%`

export const fmtPP = (n: number, decimals = 2) =>
  `${n.toFixed(decimals)} pp`

export const fmtDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Lima',
  })
}

// Insight plain-language para la probabilidad de que se invierta el orden
// actual entre los dos candidatos comparados. `pInvert` es 1 − p_orden_final.
// `leaderName` es el candidato que hoy tiene mejor proyección; se nombra
// explícitamente. El tono es deterministico, sin frases vendedoras ni
// absolutismos: describe probabilidades, no hechos.
export function inversionInsight(pInvert: number, leaderName: string): string {
  if (pInvert <= 0)    return `La diferencia ya no puede revertirse: ${leaderName} terminará por delante.`
  if (pInvert <= 0.05) return `${leaderName} terminaría por delante en prácticamente todos los escenarios posibles.`
  if (pInvert <= 0.15) return `Es estadísticamente improbable que ${leaderName} termine por debajo al finalizar el conteo.`
  if (pInvert <= 0.30) return `Es mucho más probable que ${leaderName} termine delante, pero aún no hay certeza absoluta.`
  if (pInvert <= 0.40) return `Es más probable que ${leaderName} termine delante, pero es técnicamente posible que el orden cambie.`
  return 'Las probabilidades de quedar por delante son similares para ambos candidatos; el orden final podría ir en cualquier dirección.'
}
