import type { Snapshot } from '../types/snapshot'
import type { Diff } from '../lib/diff'
import { DiffCue } from './DiffCue'
import { fmtInt, fmtPP, inversionInsight } from '../lib/format'
import type { NameResolver } from '../lib/displayNames'
import type { HeroComparisonConfig } from '../lib/displayConfig'

interface Props {
  snapshot: Snapshot
  previous?: Snapshot | null
  diff: Diff
  resolveName: NameResolver
  config: HeroComparisonConfig
}

export function HeroComparison({ snapshot, previous, diff, resolveName, config }: Props) {
  const rank      = snapshot.candidatos
  const aIdx      = Math.max(0, config.candidate_a_position - 1)
  const bIdx      = Math.max(0, config.candidate_b_position - 1)
  const a         = rank[aIdx]
  const b         = rank[bIdx]
  if (!a) return null

  // Busca la comparación que coincide con el par seleccionado; la mayoría de
  // pares aparecen precomputados en snapshot.comparaciones.
  const topComp =
    snapshot.comparaciones.find(c => c.a === a.nombre && c.b === b?.nombre) ??
    snapshot.comparaciones.find(c => c.a === b?.nombre && c.b === a.nombre) ??
    snapshot.comparaciones[0]

  // Umbral determinístico: qué fracción del TOTAL de votos aún pendientes
  // necesitaría el candidato por detrás para alcanzar al adelantado,
  // asumiendo que el adelantado cierra exactamente en su proyección actual.
  // Solo se muestra en tramos competitivos (5–45% de inversión); fuera de
  // ese rango la cifra es ruido.
  const pInvert = topComp ? 1 - topComp.p_orden_final : 0

  // Delta de pInvert vs snapshot anterior. Buscamos la misma comparación (a,b)
  // o su simétrica en el snapshot previo. Si no existe, no mostramos cue.
  const prevComp = previous && topComp
    ? previous.comparaciones.find(c => c.a === topComp.a && c.b === topComp.b)
      ?? previous.comparaciones.find(c => c.a === topComp.b && c.b === topComp.a)
    : null
  const pInvertPrev  = prevComp ? 1 - prevComp.p_orden_final : null
  const pInvertDelta = pInvertPrev != null ? pInvert - pInvertPrev : 0
  const pInvertDeltaObj = pInvertPrev != null
    ? {
        current:   pInvert,
        previous:  pInvertPrev,
        delta:     pInvertDelta,
        direction: (pInvertDelta > 0 ? 1 : pInvertDelta < 0 ? -1 : 0) as -1|0|1,
      }
    : null
  const leader  = b && a.pct_est >= b.pct_est ? a : b
  const trailer = leader === a ? b : a
  let thresholdLine: string | null = null
  if (b && topComp && leader && trailer && pInvert >= 0.05 && pInvert <= 0.45) {
    const totalRemaining = snapshot.kpis.proy_total - snapshot.kpis.votos_actuales
    const trailerNeeded  = leader.proy_100 - trailer.votos_actuales
    if (totalRemaining > 0 && trailerNeeded > 0) {
      const frac = trailerNeeded / totalRemaining
      if (frac > 0 && frac <= 1) {
        const pct = Math.round(frac * 100)
        thresholdLine = `Para invertir el orden, ${resolveName(trailer.nombre)} necesitaría más del ${pct}% de los votos aún por contabilizar, asumiendo que la proyección de ${resolveName(leader.nombre)} se mantenga.`
      }
    }
  }

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4">
        <div className="border-b border-muted py-6 md:py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 md:gap-0">
            <CandidateColumn
              candidate={a}
              diff={diff}
              resolveName={resolveName}
              className="md:pr-6 md:border-r md:border-muted"
            />
            {b && topComp ? (
              <div className="border-t md:border-t-0 md:border-r border-muted md:px-6
                              py-4 md:py-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[11px] md:text-xs text-muted uppercase tracking-wider">
                    Prob. de que el orden de estos candidatos se invierta
                  </div>
                  <div className="text-3xl md:text-5xl font-bold tabular-nums text-ink mt-1 flex items-baseline justify-center gap-2">
                    <span>{(pInvert * 100).toFixed(1)}%</span>
                    {pInvertDeltaObj && pInvertDeltaObj.direction !== 0 && (
                      <span className="text-xs md:text-sm font-medium">
                        <DiffCue
                          delta={pInvertDeltaObj}
                          format={(n) => `${(n * 100).toFixed(1)} pp`}
                          size="sm"
                        />
                      </span>
                    )}
                  </div>
                  <div
                    className="text-[11px] md:text-xs italic font-semibold mt-2"
                    style={{ color: 'var(--accent-neutral)' }}
                  >
                    {inversionInsight(
                      pInvert,
                      resolveName((leader ?? a).nombre),
                    )}
                  </div>
                  {thresholdLine && (
                    <div
                      className="text-[11px] md:text-xs italic font-semibold mt-2"
                      style={{ color: 'var(--accent-neutral)' }}
                    >
                      {thresholdLine}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
            {b ? (
              <CandidateColumn
                candidate={b}
                diff={diff}
                resolveName={resolveName}
                className="border-t border-muted md:border-t-0 md:pl-6"
              />
            ) : null}
          </div>

          {b && topComp && (() => {
            const dA = diff.candidatos.get(topComp.a)
            const dB = diff.candidatos.get(topComp.b)
            const diffPpDelta   = dA && dB ? dA.pct_est.delta  - dB.pct_est.delta  : 0
            const diffVotosCurr = Math.abs((rank.find(c => c.nombre === topComp.a)?.proy_100 ?? 0) - (rank.find(c => c.nombre === topComp.b)?.proy_100 ?? 0))
            const diffVotosDeltaSigned = dA && dB ? dA.proy_100.delta - dB.proy_100.delta : 0
            // Signo coherente con el valor absoluto mostrado: si la brecha
            // se amplía, delta positivo; si se reduce, negativo.
            const aProy = rank.find(c => c.nombre === topComp.a)?.proy_100 ?? 0
            const bProy = rank.find(c => c.nombre === topComp.b)?.proy_100 ?? 0
            const sign  = aProy >= bProy ? 1 : -1
            const diffVotosDelta = diffVotosDeltaSigned * sign
            const ppDeltaObj    = dA && dB ? { current: topComp.diff_pp,    previous: topComp.diff_pp - diffPpDelta,    delta: diffPpDelta,    direction: (diffPpDelta > 0 ? 1 : diffPpDelta < 0 ? -1 : 0) as -1|0|1 } : null
            const votosDeltaObj = dA && dB ? { current: diffVotosCurr,     previous: diffVotosCurr - diffVotosDelta,  delta: diffVotosDelta,  direction: (diffVotosDelta > 0 ? 1 : diffVotosDelta < 0 ? -1 : 0) as -1|0|1 } : null
            return (
              <div className="mt-5 md:mt-6 text-center">
                <div>
                  <span className="text-xs md:text-sm text-muted uppercase tracking-wider">
                    Diferencia:
                  </span>{' '}
                  <span
                    className="text-base md:text-lg font-semibold tabular-nums"
                    style={{ color: 'var(--accent-neutral)' }}
                  >
                    {topComp.diff_pp >= 0 ? '+' : ''}{fmtPP(topComp.diff_pp)}
                  </span>
                  {ppDeltaObj && ppDeltaObj.direction !== 0 && (
                    <span className="ml-1.5"><DiffCue delta={ppDeltaObj} format={(n) => `${n.toFixed(2)} pp`} size="sm" /></span>
                  )}
                </div>
                <div className="mt-1">
                  <span
                    className="text-sm md:text-base font-medium tabular-nums"
                    style={{ color: 'var(--text)' }}
                  >
                    {fmtInt(diffVotosCurr)} votos proyectados
                  </span>
                  {votosDeltaObj && votosDeltaObj.direction !== 0 && (
                    <span className="ml-1.5"><DiffCue delta={votosDeltaObj} format={(n) => fmtInt(Math.round(n))} size="sm" /></span>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </section>
  )
}

interface ColumnProps {
  candidate: Snapshot['candidatos'][number]
  diff: Diff
  resolveName: NameResolver
  className?: string
}

function CandidateColumn({ candidate, diff, resolveName, className = '' }: ColumnProps) {
  const d = diff.candidatos.get(candidate.nombre)
  return (
    <div className={`text-center py-5 md:py-0 ${className}`}>
      <h2 className="text-lg md:text-2xl font-semibold text-ink leading-tight">
        {resolveName(candidate.nombre)}
      </h2>
      <p className="mt-0.5 text-[11px] md:text-xs uppercase tracking-wider text-muted">
        {candidate.partido}
      </p>

      <div className="mt-2 flex items-baseline justify-center gap-2 flex-wrap">
        <span className="text-5xl md:text-6xl font-bold tabular-nums text-ink">
          {candidate.pct_est.toFixed(2)}
          <span className="text-2xl md:text-3xl font-semibold text-muted ml-0.5">%</span>
        </span>
        {d && <DiffCue delta={d.pct_est} format={(n) => `${n.toFixed(2)} pp`} />}
      </div>

      <div className="mt-3 text-xs md:text-sm text-muted">
        Margen de error ±{' '}
        <span className="text-ink font-medium">{fmtPP(candidate.margen_pp)}</span>
        {d && d.margen_pp.direction !== 0 && (
          <span className="ml-1.5"><DiffCue delta={d.margen_pp} format={(n) => `${n.toFixed(2)} pp`} size="sm" /></span>
        )}
      </div>

      <div className="text-xs md:text-sm text-muted">
        Votos proyectados:{' '}
        <span className="text-ink font-medium tabular-nums">{fmtInt(candidate.proy_100)}</span>
        {d && (
          <span className="ml-1.5"><DiffCue delta={d.proy_100} format={(n) => fmtInt(Math.round(n))} size="sm" /></span>
        )}
      </div>
    </div>
  )
}
