import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, ...props }, ref) => (
    <input
      type={type}
      data-error={error || undefined}
      data-success={success || undefined}
      className={cn(
        'w-full bg-secondary border border-input rounded-md px-3 text-sm font-mono min-h-11',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
        'placeholder:text-muted-foreground',
        error && 'border-destructive focus-visible:ring-destructive',
        success && 'border-success focus-visible:ring-success',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input }
export default Input
