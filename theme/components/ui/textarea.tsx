import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  state?: 'default' | 'error' | 'success'
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, state = 'default', ...props }, ref) => (
    <textarea
      className={cn(
        'flex min-h-[100px] w-full rounded-sm border bg-input px-3 py-2',
        'font-body text-[15px] text-foreground placeholder:text-muted-foreground',
        'resize-y',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'transition-colors duration-150',
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
Textarea.displayName = 'Textarea'

export { Textarea }
