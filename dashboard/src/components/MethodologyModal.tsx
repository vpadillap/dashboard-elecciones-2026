import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

export function MethodologyModal({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    closeBtnRef.current?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        // Focus trap mínimo — mantiene el foco dentro del modal
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusables || focusables.length === 0) return
        const first = focusables[0]
        const last  = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center
                 bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="methodology-title"
        className="relative w-full md:max-w-2xl max-h-[90svh] overflow-y-auto
                   bg-base border border-black/10 rounded-t-2xl md:rounded-2xl
                   shadow-lg p-5 md:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 id="methodology-title" className="text-xl md:text-2xl font-semibold text-ink">
            ¿Cómo se calcula?
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-2 text-muted hover:bg-ink/5 focus:outline-none
                       focus:ring-2 focus:ring-ink/30 min-h-[44px] min-w-[44px]
                       flex items-center justify-center"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 text-sm md:text-base text-ink leading-relaxed">
          <section>
            <h3 className="font-semibold mb-1">De dónde salen los datos</h3>
            <p className="text-muted">
              Los datos provienen directamente de la publicación oficial de la ONPE
              (Oficina Nacional de Procesos Electorales). Cada cierto tiempo el
              sistema recoge los resultados de todos los distritos del Perú y las
              ciudades donde vota la comunidad peruana en el extranjero, y los
              resume en esta página.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">¿Qué significa "proyección"?</h3>
            <p className="text-muted">
              No todas las actas están contabilizadas cuando se publica un resultado.
              La proyección es una estimación de cómo se verá el total final
              asumiendo que las actas que faltan se parecerán a las que ya llegaron
              de la misma zona. No es una predicción mágica: es una cuenta
              estadística a partir de lo que ya sabemos.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">¿Qué es el margen de error?</h3>
            <p className="text-muted">
              El margen (± pp) mide cuánto podría variar el porcentaje final al
              cerrarse el conteo. Viene de dos fuentes: los distritos con muy
              pocas actas aún (excluidos del cálculo directo) y la parte pendiente
              de los distritos ya incluidos. Si un candidato aparece con 45% ± 1.2
              pp significa que, con alta confianza, su resultado final estará entre
              43.8% y 46.2%.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">¿Qué significa "P(orden final)"?</h3>
            <p className="text-muted">
              Es la probabilidad de que el candidato A termine por encima del
              candidato B al cerrarse el conteo, considerando todas las fuentes
              de incertidumbre. Un 99% quiere decir que solo en 1 de cada 100
              escenarios posibles el orden se invertiría. Un 60% significa que
              el resultado es prácticamente una moneda al aire — cualquiera
              podría ganar. No indica quién va ganando hoy (eso lo dice el %
              estimado), sino qué tan firme es esa ventaja.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">¿Por qué se excluyen algunos distritos?</h3>
            <p className="text-muted">
              Los distritos con menos del 10% de actas contabilizadas se dejan
              fuera del cálculo directo porque sus datos todavía son muy pocos y
              podrían distorsionar la proyección. No se pierden: su peso estimado
              se suma al margen de error, para que el resultado final refleje que
              todavía hay información pendiente. Adicionalmente, cuando existen
              actas impugnadas (en revisión por el JEE) se muestra una columna
              separada con el margen considerando el riesgo de que alguna sea
              anulada.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
