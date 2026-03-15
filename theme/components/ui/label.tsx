import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const labelVariants = cva(
  [
    'font-mono text-[11px] font-medium uppercase tracking-wider leading-none',
    'peer-disabled:cursor-not-allowed peer-disabled:opacity-40',
  ],
  {
    variants: {
      variant: {
        default: 'text-muted-foreground',
        gold:    'text-primary',
        dim:     'text-dim',
      },
      required: {
        true:  "after:content-['*'] after:ml-1 after:text-primary",
        false: '',
      },
    },
    defaultVariants: { variant: 'default', required: false },
  }
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, variant, required, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants({ variant, required }), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
