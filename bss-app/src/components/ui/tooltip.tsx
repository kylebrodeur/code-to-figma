'use client'

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import * as React from 'react'
import { cn } from '@/lib/utils'

const TooltipProvider = BaseTooltip.Provider

const Tooltip = BaseTooltip.Root

const TooltipTrigger = BaseTooltip.Trigger

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseTooltip.Popup>
>(({ className, ...props }, ref) => (
  <BaseTooltip.Portal>
    <BaseTooltip.Positioner sideOffset={6}>
      <BaseTooltip.Popup
        className={cn(
          'z-50 rounded-sm bg-foreground px-2 py-1 text-xs font-mono text-background shadow-md',
          'data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity duration-150',
          className,
        )}
        ref={ref}
        {...props}
      />
    </BaseTooltip.Positioner>
  </BaseTooltip.Portal>
))
TooltipContent.displayName = 'TooltipContent'

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
