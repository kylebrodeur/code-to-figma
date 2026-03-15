import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  state?: 'default' | 'error' | 'success'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, state = 'default', ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex w-full min-h-[44px] px-3 py-2',
        'font-body text-[15px] text-foreground placeholder:text-muted-foreground',
        'rounded-sm border bg-input',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-40',
        state === 'default' && 'border-border',
        state === 'error'   && 'border-destructive focus-visible:ring-destructive',
        state === 'success' && 'border-bss-teal-dark focus-visible:ring-bss-teal-dark',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
