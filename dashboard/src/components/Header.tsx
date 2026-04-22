import { HelpCircle } from 'lucide-react'

interface Props {
  onOpenMethodology: () => void
}

// SVG inline del logotipo de LinkedIn — Lucide ya no distribuye marcas.
// Escala con el tamaño de fuente (1em) para alinearse con el texto.
function LinkedInIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
         aria-hidden="true" className="w-[1em] h-[1em]">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04
               -1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05
               c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46
               v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1
               0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77
               C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46
               C23.21 24 24 23.23 24 22.28V1.72C24 .77 23.21 0 22.23 0z"/>
    </svg>
  )
}

export function Header({ onOpenMethodology }: Props) {
  return (
    <header className="bg-base">
      <div className="mx-auto max-w-6xl px-4 relative">
        <button
          type="button"
          onClick={onOpenMethodology}
          aria-label="¿Cómo se calcula?"
          className="absolute top-3 right-4 inline-flex items-center gap-1.5 text-xs md:text-sm
                     text-muted hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent-neutral
                     rounded px-2 py-1.5"
        >
          <HelpCircle size={16} aria-hidden="true" />
          <span>¿Cómo se calcula?</span>
        </button>

        <div className="pt-12 md:pt-10 pb-4 md:pb-6 text-center">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-ink">
            Elecciones Perú 2026
          </h1>
          <p className="mt-1 text-xs md:text-sm text-muted">
            Proyección de resultados usando data de votos a nivel distrito/ciudad
          </p>
          <p className="mt-1 text-xs md:text-sm text-muted flex items-center justify-center gap-1.5">
            <a
              href="https://www.linkedin.com/in/vpadillaprado/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold hover:underline
                         focus:outline-none focus:ring-2 focus:ring-accent-neutral rounded"
              style={{ color: 'var(--accent-neutral)' }}
            >
              <LinkedInIcon />
              Por Victor Padilla Prado
            </a>
          </p>
        </div>
      </div>
    </header>
  )
}
