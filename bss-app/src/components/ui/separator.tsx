import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SeparatorProps extends React.HTMLAttributes<HTMLElement> {
  orientation?: 'horizontal' | 'vertical'
}

const Separator = React.forwardRef<HTMLElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => {
    if (orientation === 'vertical') {
      return (
        <div
          role="separator"
          aria-orientation="vertical"
          className={cn('border-l border-border h-full inline-block align-middle', className)}
          ref={ref as React.Ref<HTMLDivElement>}
          {...props}
        />
      )
    }

    return (
      <hr
        className={cn('border-t border-border w-full', className)}
        ref={ref as React.Ref<HTMLHRElement>}
        {...(props as React.HTMLAttributes<HTMLHRElement>)}
      />
    )
  },
)
Separator.displayName = 'Separator'

export { Separator }
export default Separator
