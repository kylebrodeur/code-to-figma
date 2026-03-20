import type * as React from 'react'
import { cn } from '@/lib/utils'

type LineVariant = 'default' | 'comment' | 'keyword' | 'string' | 'dim'

export interface TerminalLine {
  content: string
  variant?: LineVariant
}

export interface TerminalBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  lines: TerminalLine[]
}

const lineColour: Record<LineVariant, string> = {
  default: 'text-foreground',
  comment: 'text-muted-foreground',
  keyword: 'text-primary',
  string: 'text-success',
  dim: 'text-muted-foreground/60',
}

export function TerminalBlock({
  className,
  title = 'terminal',
  lines,
  ...props
}: TerminalBlockProps) {
  return (
    <div
      className={cn('border border-border bg-background overflow-hidden', className)}
      {...props}
    >
      {/* Titlebar */}
      <div className="flex items-center gap-1.5 border-b border-border bg-card px-4 py-2.5">
        <span className="bss-dot h-3 w-3 bg-destructive" />
        <span className="bss-dot h-3 w-3 bg-primary" />
        <span className="bss-dot h-3 w-3 bg-success" />
        {title && <span className="ml-3 text-xs font-mono text-muted-foreground">{title}</span>}
      </div>
      {/* Content */}
      <pre className="p-4 text-sm font-mono leading-relaxed overflow-x-auto">
        {lines.map((line, i) => (
          <div key={i} className={cn('whitespace-pre', lineColour[line.variant ?? 'default'])}>
            {line.content}
          </div>
        ))}
      </pre>
    </div>
  )
}

export default TerminalBlock
