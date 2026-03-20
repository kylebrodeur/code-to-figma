import type * as React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from './badge'
import { Button } from './button'

export interface PricingFeature {
  text: string
  included?: boolean
}

export interface PricingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  plan: string
  badge?: string
  priceMonthly: string | number
  priceOriginal?: string | number
  description?: string
  features: PricingFeature[]
  ctaLabel?: string
  onCtaClick?: () => void
  featured?: boolean
}

export function PricingCard({
  className,
  plan,
  badge,
  priceMonthly,
  priceOriginal,
  description,
  features,
  ctaLabel = 'Get started',
  onCtaClick,
  featured = false,
  ...props
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'relative border p-6 flex flex-col gap-6',
        featured ? 'border-primary bg-card' : 'border-border bg-card',
        className,
      )}
      {...props}
    >
      {badge && (
        <Badge variant="default" className="absolute -top-3 left-1/2 -translate-x-1/2">
          {badge}
        </Badge>
      )}

      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">{plan}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-display text-3xl font-bold text-foreground">${priceMonthly}</span>
          <span className="font-mono text-xs text-muted-foreground">/mo</span>
          {priceOriginal && (
            <span className="font-mono text-sm line-through text-muted-foreground/60 ml-1">
              ${priceOriginal}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm font-sans text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <ul className="flex flex-col gap-2.5 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm font-sans">
            <span
              className={cn(
                'mt-0.5 shrink-0',
                f.included === false ? 'text-muted-foreground/40' : 'text-success',
              )}
            >
              {f.included === false ? '✕' : '✓'}
            </span>
            <span
              className={
                f.included === false ? 'text-muted-foreground/40 line-through' : 'text-foreground'
              }
            >
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      <Button variant={featured ? 'default' : 'outline'} className="w-full" onClick={onCtaClick}>
        {ctaLabel}
      </Button>
    </div>
  )
}

export default PricingCard
