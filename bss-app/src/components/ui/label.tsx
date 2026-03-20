import * as React from 'react'
import { cn } from '@/lib/utils'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  error?: boolean
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, error, ...props }, ref) => (
    <label
      className={cn(
        'font-mono text-[10px] font-medium tracking-[.12em] uppercase text-muted-foreground',
        error && 'text-destructive',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
Label.displayName = 'Label'

export { Label }
export default Label
