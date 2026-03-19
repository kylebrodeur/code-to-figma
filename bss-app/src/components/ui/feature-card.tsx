import * as React from 'react'
import { cn } from '@/lib/utils'

export interface FlowStep {
  label: string
}

export interface FeatureItem {
  title: string
  description: string
}

export interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  flowSteps?: FlowStep[]
  features?: FeatureItem[]
}

export function FeatureCard({ className, title, flowSteps, features, ...props }: FeatureCardProps) {
  return (
    <div
      className={cn('rounded-md border border-border bg-card p-6 flex flex-col gap-4', className)}
      {...props}
    >
      <h3 className="font-display font-semibold text-base text-foreground">{title}</h3>

      {flowSteps && flowSteps.length > 0 && (
        <div className="flex items-center gap-0 overflow-x-auto pb-1">
          {flowSteps.map((step, i) => (
            <React.Fragment key={i}>
              <span className="shrink-0 rounded-sm bg-secondary px-2 py-0.5 font-mono text-xs text-foreground whitespace-nowrap">
                {step.label}
              </span>
              {i < flowSteps.length - 1 && (
                <span className="shrink-0 text-muted-foreground/60 mx-1 font-mono text-xs">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {features && features.length > 0 && (
        <ul className="flex flex-col gap-3">
          {features.map((f, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-0.5 shrink-0 text-primary font-mono text-xs">✓</span>
              <span className="text-sm font-sans">
                <span className="font-medium text-foreground">{f.title}</span>
                {f.description && <span className="text-muted-foreground"> — {f.description}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default FeatureCard
