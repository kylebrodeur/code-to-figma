import type * as React from 'react'
import { cn } from '@/lib/utils'

export interface StatBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  label: string
  accent?: 'gold' | 'rust' | 'teal'
}

const accentColour = {
  gold: 'text-primary',
  rust: 'text-destructive',
  teal: 'text-success',
}

export function StatBlock({ className, value, label, accent = 'gold', ...props }: StatBlockProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)} {...props}>
      <span className={cn('font-display text-3xl font-bold', accentColour[accent])}>{value}</span>
      <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

export default StatBlock
