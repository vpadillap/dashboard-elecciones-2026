import { Linkedin, Heart } from 'lucide-react'

export function CreditsFooter() {
  return (
    <footer className="px-4 py-6 md:py-8 border-t border-black/10 bg-base mt-auto">
      <div className="mx-auto max-w-6xl flex flex-col items-center gap-2 text-sm text-muted">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span>Dashboard creado por</span>
          <span className="text-ink font-medium">Victor Antonio Padilla Prado</span>
          <a
            href="https://www.linkedin.com/in/vpadillaprado/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Perfil de LinkedIn de Victor Antonio Padilla Prado"
            className="inline-flex items-center justify-center rounded-full p-1.5
                       text-muted hover:text-ink hover:bg-ink/5
                       focus:outline-none focus:ring-2 focus:ring-ink/30"
          >
            <Linkedin size={18} aria-hidden="true" />
          </a>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Con el apoyo de</span>
          <span className="text-ink font-medium">Claude Code</span>
          <Heart size={16} className="text-accent-pos fill-current" aria-hidden="true" />
        </div>
      </div>
    </footer>
  )
}
