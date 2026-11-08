interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'cuisine' | 'time'
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  const base =
    'inline-flex items-center rounded-full text-xs font-medium tracking-wide uppercase px-2.5 py-0.5 select-none'

  const variants: Record<string, string> = {
    default: 'bg-white/15 text-white backdrop-blur-sm',
    cuisine: 'bg-white/15 text-white backdrop-blur-sm',
    time: 'bg-black/20 text-white/80 backdrop-blur-sm',
  }

  return <span className={`${base} ${variants[variant]}`}>{children}</span>
}
