import type * as React from 'react'
import { cn } from '@/lib/utils'

export interface StatusPillProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: string
  timeline?: string
  spotsRemaining?: number
}

export function StatusPill({
  className,
  status = 'Building now',
  timeline,
  spotsRemaining,
  ...props
}: StatusPillProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 border border-border bg-card px-4 py-2 font-mono text-xs text-muted-foreground',
        className,
      )}
      {...props}
    >
      <span className="bss-dot h-1.5 w-1.5 bg-success animate-pulse" />
      <span className="text-foreground font-medium">{status}</span>
      {timeline && (
        <>
          <span className="text-border">·</span>
          <span>{timeline}</span>
        </>
      )}
      {spotsRemaining !== undefined && (
        <>
          <span className="text-border">·</span>
          <span>
            <span className="text-primary font-semibold">{spotsRemaining}</span>
            {' spots remaining'}
          </span>
        </>
      )}
    </div>
  )
}

export default StatusPill
