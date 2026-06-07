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
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                 bg-ink/50 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="methodology-title"
        className="relative w-full md:max-w-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto
                   bg-base rounded-2xl shadow-xl p-5 md:p-7"
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
                       focus:ring-2 focus:ring-accent-neutral min-h-[44px] min-w-[44px]
                       flex items-center justify-center"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 text-sm md:text-base text-ink leading-relaxed">
          <section>
            <h3 className="text-ink font-semibold mb-1">De dónde salen los datos</h3>
            <p className="text-muted">
              Un programa propio (script en Python) se conecta directamente a la
              API pública de la ONPE cada vez que se genera una captura. Recorre
              todos los distritos del Perú y las ciudades donde vota la comunidad
              peruana en el extranjero, y para cada uno obtiene: los votos
              válidos por candidato, el porcentaje de actas contabilizadas, y
              también el padrón de electores hábiles de esa unidad. Tener el
              padrón permite estimar con realismo el tamaño final de votos
              emitidos incluso en zonas con muy pocas actas procesadas.
            </p>
          </section>

          <section>
            <h3 className="text-ink font-semibold mb-1">¿Qué significa "proyección"?</h3>
            <p className="text-muted">
              No todas las actas están contabilizadas cuando se publica un
              resultado. La proyección es una estimación de cómo se verá el
              total final asumiendo que las actas que faltan se parecerán a las
              que ya llegaron de la misma zona. No es una predicción mágica: es
              una cuenta estadística a partir de lo que ya sabemos.
            </p>
          </section>

          <section>
            <h3 className="text-ink font-semibold mb-1">¿Qué es el margen de error?</h3>
            <p className="text-muted">
              El margen de error (± pp) mide cuánto podría variar el porcentaje
              final al cerrarse el conteo. Viene de dos fuentes: los distritos
              con muy pocas actas aún (excluidos del cálculo directo) y la parte
              pendiente de los distritos ya incluidos. Esa parte pendiente
              incluye también las actas que están en revisión del JEE: hasta que
              se resuelvan se cuentan como votos todavía por contabilizar. Si
              un candidato aparece con 45% ± 1.2 pp significa que, con alta
              confianza, su resultado final estará entre 43.8% y 46.2%.
            </p>
          </section>

          <section>
            <h3 className="text-ink font-semibold mb-1">¿Qué significa "Prob. de que el orden se invierta"?</h3>
            <p className="text-muted">
              Es la probabilidad de que, al cerrarse el conteo, los dos
              candidatos comparados terminen en el orden opuesto al que se
              observa hoy. Considera todas las fuentes de incertidumbre: actas
              pendientes, distritos con poca información y, cuando aplica, las
              actas en revisión del JEE. Un 1% significa que solo en 1 de cada
              100 escenarios posibles el orden cambiaría; un 40% significa que
              la disputa está tan apretada que el orden puede cambiar en
              cualquier dirección. No indica quién va ganando hoy (eso lo dice
              el % estimado), sino qué tan firme es esa ventaja frente a lo que
              aún falta contar.
            </p>
          </section>

          <section>
            <h3 className="text-ink font-semibold mb-1">¿Por qué se excluyen algunos distritos?</h3>
            <p className="text-muted">
              Los distritos con menos del 10% de actas contabilizadas se dejan
              fuera del cálculo directo porque sus datos todavía son muy pocos
              y podrían distorsionar la proyección. No se pierden: su peso
              estimado se suma al margen de error, para que el resultado final
              refleje que todavía hay información pendiente.
            </p>
          </section>

          <section>
            <h3 className="text-ink font-semibold mb-1">¿Por qué no mostramos un gráfico de evolución en el tiempo?</h3>
            <p className="text-muted">
              Podría parecer útil dibujar una línea con cómo cambia el porcentaje
              de cada candidato a medida que llegan más votos, pero
              estadísticamente es un modelo engañoso. El orden en que llegan las
              actas no es aleatorio: Lima puede procesar más rápido que Puno, el
              extranjero llega al final, algunas regiones rurales tardan más.
              Eso significa que una línea creciente o decreciente puede
              simplemente reflejar de qué región vienen los votos que acaban de
              llegar — no un cambio real en la intención de voto, que ya ocurrió
              el día de la elección. Mostrar esa línea induciría a leer
              "tendencia" donde solo hay orden de procesamiento. Lo
              estadísticamente honesto es la captura actual con su margen.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
