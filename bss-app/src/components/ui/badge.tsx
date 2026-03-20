import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center px-2 py-[3px] font-mono font-medium text-[10px] tracking-[.09em] uppercase',
  {
    variants: {
      variant: {
        default:     'bg-primary/10 text-primary border border-primary/[0.28]',
        secondary:   'bg-secondary text-foreground border border-border',
        destructive: 'bg-destructive/10 text-destructive border border-destructive/[0.26]',
        success:     'bg-success/10 text-success border border-success/[0.26]',
        outline:     'border border-border text-foreground bg-transparent',
        muted:       'bg-transparent text-muted-foreground border border-input',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span className={cn(badgeVariants({ variant, className }))} ref={ref} {...props} />
  ),
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
export default Badge
