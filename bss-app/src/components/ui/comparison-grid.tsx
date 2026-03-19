import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ComparisonRow {
  before: string
  after: string
}

export interface ComparisonGridProps extends React.HTMLAttributes<HTMLDivElement> {
  beforeLabel?: string
  afterLabel?: string
  rows: ComparisonRow[]
}

export function ComparisonGrid({
  className,
  beforeLabel = 'Before',
  afterLabel = 'After',
  rows,
  ...props
}: ComparisonGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-0.5 rounded-md overflow-hidden border border-border',
        className,
      )}
      {...props}
    >
      {/* Header */}
      <div className="bg-destructive/10 px-4 py-2 font-mono text-xs font-semibold tracking-widest uppercase text-destructive">
        {beforeLabel}
      </div>
      <div className="bg-success/10 px-4 py-2 font-mono text-xs font-semibold tracking-widest uppercase text-success">
        {afterLabel}
      </div>

      {/* Rows */}
      {rows.map((row, i) => (
        <React.Fragment key={i}>
          <div className="bg-card px-4 py-3 text-sm font-sans text-muted-foreground border-t border-border">
            {row.before}
          </div>
          <div className="bg-card px-4 py-3 text-sm font-sans text-foreground border-t border-border">
            {row.after}
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

export default ComparisonGrid
