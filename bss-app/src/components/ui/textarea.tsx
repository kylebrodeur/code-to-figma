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
        'w-full bg-card border border-input px-3 py-2.5 text-[12px] font-mono min-h-[100px] resize-none',
        'focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_rgba(201,141,26,0.10)]',
        'disabled:opacity-50 disabled:cursor-not-allowed transition-[border-color,box-shadow]',
        'placeholder:text-muted-foreground',
        error && 'border-destructive focus-visible:shadow-[0_0_0_3px_rgba(204,96,48,0.10)]',
        success && 'border-success focus-visible:shadow-[0_0_0_3px_rgba(90,158,128,0.10)]',
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
