import * as React from 'react'
import { cn } from '@/lib/utils'

type CardAccent = 'gold' | 'rust' | 'teal'

const accentClass: Record<CardAccent, string> = {
  gold: 'border-l-2 border-l-primary',
  rust: 'border-l-2 border-l-destructive',
  teal: 'border-l-2 border-l-success',
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: CardAccent
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, accent, ...props }, ref) => (
  <div
    className={cn(
      'bg-card text-card-foreground rounded-md border border-border',
      accent && accentClass[accent],
      className,
    )}
    ref={ref}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn('px-6 pt-6 pb-2', className)} ref={ref} {...props} />
  ),
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      className={cn('font-display font-semibold text-lg leading-tight', className)}
      ref={ref}
      {...props}
    />
  ),
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p className={cn('text-sm text-muted-foreground font-sans', className)} ref={ref} {...props} />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn('px-6 py-4', className)} ref={ref} {...props} />
  ),
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn('px-6 pb-6 pt-2 flex items-center gap-2', className)} ref={ref} {...props} />
  ),
)
CardFooter.displayName = 'CardFooter'

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
export default Card
