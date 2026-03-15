import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * BSS Card
 *
 * accent prop adds a 2px left border: 'gold' | 'rust' | 'teal' | 'none'
 * CardTitle: Bricolage Grotesque. CardDescription: muted foreground.
 * Radius: 2px. No elevation — border defines the edge.
 */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: 'gold' | 'rust' | 'teal' | 'none'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, accent = 'none', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-sm border bg-card text-card-foreground',
        accent === 'gold' && 'border-l-2 border-l-primary pl-[1px]',
        accent === 'rust' && 'border-l-2 border-l-destructive pl-[1px]',
        accent === 'teal' && 'border-l-2 border-l-bss-teal-dark pl-[1px]',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-1.5 p-5', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('font-display text-[18px] font-semibold leading-tight tracking-tight', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('font-body text-[13px] text-muted-foreground leading-relaxed', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between p-5 pt-0 border-t border-border mt-4 pt-4', className)}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
