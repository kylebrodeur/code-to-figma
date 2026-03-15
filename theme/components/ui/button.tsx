import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * BSS Button
 *
 * Variants: default | secondary | destructive | outline | outline-destructive | ghost | link
 * Sizes:    sm | md | lg | icon
 * Font:     Martian Mono, uppercase, tracked
 * Radius:   3px (rounded-sm in config)
 * Touch:    min-height 44px on all sizes (WCAG 2.5.5)
 */

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'min-h-[44px] whitespace-nowrap',
    'font-mono text-[11px] font-medium uppercase tracking-wider',
    'rounded-sm border',
    'cursor-pointer select-none',
    'transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-40',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-primary text-primary-foreground border-primary',
          'hover:bg-primary/90 hover:border-primary/90',
          'active:bg-primary/80',
        ],
        destructive: [
          'bg-destructive text-destructive-foreground border-destructive',
          'hover:bg-destructive/90',
          'active:bg-destructive/80',
        ],
        secondary: [
          'bg-secondary text-secondary-foreground border-border',
          'hover:bg-accent hover:text-accent-foreground',
          'active:bg-secondary/80',
        ],
        outline: [
          'bg-transparent text-primary border-primary',
          'hover:bg-primary/10',
          'active:bg-primary/20',
        ],
        'outline-destructive': [
          'bg-transparent text-destructive border-destructive',
          'hover:bg-destructive/10',
          'active:bg-destructive/20',
        ],
        ghost: [
          'bg-transparent text-foreground border-transparent',
          'hover:bg-accent hover:text-accent-foreground',
          'active:bg-accent/80',
        ],
        link: [
          'bg-transparent text-primary border-transparent',
          'underline-offset-4 hover:underline',
          'h-auto px-0 min-h-0',
        ],
      },
      size: {
        sm:   'h-[44px] px-3 text-[10px]',
        md:   'h-[44px] px-4',
        lg:   'h-[52px] px-6 text-[12px]',
        icon: 'h-[44px] w-[44px] p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render child as root element — use to wrap Next.js <Link> with button styles */
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
