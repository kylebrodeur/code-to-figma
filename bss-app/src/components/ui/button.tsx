import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-mono font-semibold tracking-wide uppercase focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-opacity',
  {
    variants: {
      variant: {
        default:             'bg-primary text-primary-foreground hover:opacity-80',
        secondary:           'bg-secondary text-foreground hover:opacity-80',
        destructive:         'bg-destructive text-destructive-foreground hover:opacity-80',
        outline:             'border border-input text-muted-foreground hover:border-primary/[0.28] hover:text-primary transition-colors',
        'outline-destructive':'border border-destructive text-destructive hover:bg-destructive/10',
        ghost:               'text-foreground hover:bg-accent',
        link:                'text-primary underline-offset-4 hover:underline h-auto p-0',
      },
      size: {
        sm:      'h-8 px-3 text-[10px]',
        default: 'h-11 px-3.5 text-[11px]',
        lg:      'h-12 px-6 text-[13px]',
        icon:    'h-11 w-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  ),
)
Button.displayName = 'Button'

export { Button, buttonVariants }
export default Button
