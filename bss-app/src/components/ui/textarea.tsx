import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
  success?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, success, ...props }, ref) => (
    <textarea
      data-error={error || undefined}
      data-success={success || undefined}
      className={cn(
        'w-full bg-secondary border border-input rounded-md px-3 py-2 text-sm font-mono min-h-[100px] resize-none',
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
Textarea.displayName = 'Textarea'

export { Textarea }
export default Textarea
