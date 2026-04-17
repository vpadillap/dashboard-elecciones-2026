import { HelpCircle } from 'lucide-react'

interface Props {
  onOpenMethodology: () => void
}

export function Header({ onOpenMethodology }: Props) {
  return (
    <header className="border-b border-black/10 bg-base">
      <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 px-4 py-3 md:py-4">
        <div className="min-w-0">
          <h1 className="text-lg md:text-2xl font-semibold tracking-tight text-ink truncate">
            Elecciones Perú 2026
          </h1>
          <p className="text-xs md:text-sm text-muted">
            Proyección nacional · nivel distrito/ciudad
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenMethodology}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink/20
                     px-3 py-2 text-sm font-medium text-ink hover:bg-ink/5
                     focus:outline-none focus:ring-2 focus:ring-ink/30
                     min-h-[44px]"
        >
          <HelpCircle size={16} aria-hidden="true" />
          <span className="hidden sm:inline">¿Cómo se calcula?</span>
          <span className="sm:hidden">Metodología</span>
        </button>
      </div>
    </header>
  )
}
