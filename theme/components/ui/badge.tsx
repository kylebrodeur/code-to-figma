import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * BSS Badge
 * Variants: default (gold) | secondary | destructive (rust) | teal | outline | outline-gold
 * Font: Martian Mono, uppercase, tracked wide. Radius: 2px.
 */

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1',
    'font-mono text-[10px] font-medium uppercase tracking-widest',
    'rounded-sm border px-2 py-0.5',
    'select-none whitespace-nowrap',
    'transition-colors duration-150',
  ],
  {
    variants: {
      variant: {
        default:             'bg-primary/15 text-primary border-primary/30',
        secondary:           'bg-secondary text-secondary-foreground border-border',
        destructive:         'bg-destructive/15 text-destructive border-destructive/30',
        teal:                'bg-bss-teal-dark/15 text-bss-teal-dark border-bss-teal-dark/30',
        outline:             'bg-transparent text-foreground border-border',
        'outline-gold':      'bg-transparent text-primary border-primary',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
