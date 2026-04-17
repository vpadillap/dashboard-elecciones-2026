import type { Snapshot } from '../types/snapshot'
import type { Diff } from '../lib/diff'
import { DiffCue } from './DiffCue'
import { fmtInt, fmtPP, orderProbLabel } from '../lib/format'

interface Props {
  snapshot: Snapshot
  diff: Diff
}

export function HeroComparison({ snapshot, diff }: Props) {
  const [a, b] = snapshot.candidatos
  if (!a) return null

  // Comparación top entre primeros dos candidatos (cuando exista b)
  const topComp = snapshot.comparaciones.find(c => c.a === a.nombre && c.b === b?.nombre)
                  ?? snapshot.comparaciones[0]

  return (
    <section className="px-4 py-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-stretch">
          <CandidateCard candidate={a} diff={diff} leading />
          {b ? (
            <div className="flex md:flex-col items-center justify-center gap-2 md:py-4">
              <div className="text-muted font-semibold uppercase tracking-wider text-xs md:text-sm">
                vs
              </div>
              {topComp && (
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-ink">
                    {(topComp.p_orden_final * 100).toFixed(1)}%
                  </div>
                  <div className="text-[11px] md:text-xs text-muted uppercase tracking-wider">
                    P(orden final)
                  </div>
                  <div className="text-xs md:text-sm text-ink mt-1 italic">
                    {orderProbLabel(topComp.p_orden_final)}
                  </div>
                </div>
              )}
            </div>
          ) : null}
          {b ? <CandidateCard candidate={b} diff={diff} /> : null}
        </div>

        {b && topComp && (
          <p className="mt-4 text-center text-sm text-muted">
            Diferencia entre {a.nombre.split(' ').slice(-1)[0]} y {b.nombre.split(' ').slice(-1)[0]}:{' '}
            <span className="text-ink font-medium">
              {topComp.diff_pp >= 0 ? '+' : ''}{fmtPP(topComp.diff_pp)}
            </span>
          </p>
        )}
      </div>
    </section>
  )
}

interface CardProps {
  candidate: Snapshot['candidatos'][number]
  diff: Diff
  leading?: boolean
}

function CandidateCard({ candidate, diff, leading = false }: CardProps) {
  const d = diff.candidatos.get(candidate.nombre)
  return (
    <article
      className={`rounded-2xl border p-5 md:p-6 flex flex-col gap-2
                  ${leading ? 'border-ink/20 bg-ink/[0.03]' : 'border-black/10'}`}
    >
      <div className="min-w-0">
        <h2 className="text-lg md:text-xl font-semibold text-ink truncate">
          {candidate.nombre}
        </h2>
        <p className="text-sm text-muted truncate">{candidate.partido}</p>
      </div>

      <div className="mt-2 flex items-baseline gap-2 flex-wrap">
        <span className="text-4xl md:text-6xl font-bold tabular-nums text-ink">
          {candidate.pct_est.toFixed(2)}
          <span className="text-2xl md:text-3xl font-semibold text-muted ml-1">%</span>
        </span>
        {d && <DiffCue delta={d.pct_est} format={(n) => `${n.toFixed(2)} pp`} />}
      </div>

      <div className="text-sm text-muted mt-1">
        Margen ±{' '}
        <span className="text-ink font-medium">{fmtPP(candidate.margen_pp)}</span>
        {d && d.margen_pp.direction !== 0 && (
          <span className="ml-2"><DiffCue delta={d.margen_pp} format={(n) => `${n.toFixed(2)} pp`} /></span>
        )}
        {candidate.margen_jee_pp != null && (
          <span className="ml-2 text-muted">
            (con JEE: ±{fmtPP(candidate.margen_jee_pp)})
          </span>
        )}
      </div>

      <div className="text-sm text-muted">
        Proyección @ 100%:{' '}
        <span className="text-ink font-medium tabular-nums">{fmtInt(candidate.proy_100)}</span>
        {d && (
          <span className="ml-2"><DiffCue delta={d.proy_100} format={(n) => fmtInt(Math.round(n))} /></span>
        )}
      </div>
    </article>
  )
}
