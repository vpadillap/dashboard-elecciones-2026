import type { Delta } from '../lib/diff'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface Props {
  delta: Delta
  format?: (n: number) => string  // cómo renderizar el valor absoluto del delta
  className?: string
  size?: 'md' | 'sm'
}

const defaultFormat = (n: number) => n.toLocaleString('es-PE')

export function DiffCue({ delta, format = defaultFormat, className = '', size = 'md' }: Props) {
  if (delta.direction === 0 || delta.previous == null) return null
  const up = delta.direction === 1
  const color = up ? 'text-accent-pos' : 'text-accent-neg'
  const Icon  = up ? ArrowUp : ArrowDown
  const sign  = up ? '+' : '−'
  const abs   = Math.abs(delta.delta)
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  const iconSize = size === 'sm' ? 12 : 14
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${textSize} font-medium ${color} ${className}`}
      aria-label={`${up ? 'Subió' : 'Bajó'} ${format(abs)} desde el snapshot anterior`}
    >
      <Icon size={iconSize} strokeWidth={2.5} aria-hidden="true" />
      {sign}{format(abs)}
    </span>
  )
}
