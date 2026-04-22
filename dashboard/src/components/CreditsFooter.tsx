import { Heart } from 'lucide-react'

export function CreditsFooter() {
  return (
    <footer className="px-4 py-5 md:py-6 mt-auto">
      <div className="mx-auto max-w-6xl flex items-center justify-center gap-1.5 text-sm text-muted">
        <span>Con el apoyo de</span>
        <span className="text-ink font-medium">Claude Code</span>
        <Heart size={16} className="text-accent-pos fill-current" aria-hidden="true" />
      </div>
    </footer>
  )
}
