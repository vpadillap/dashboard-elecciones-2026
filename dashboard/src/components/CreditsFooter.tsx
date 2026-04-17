import { Heart } from 'lucide-react'

// Lucide no incluye el logotipo de LinkedIn (dejaron de distribuir marcas);
// usamos un SVG inline del logo oficial para no añadir otra dependencia.
function LinkedInIcon({ size = 18 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size}
         viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
            <LinkedInIcon size={18} />
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
