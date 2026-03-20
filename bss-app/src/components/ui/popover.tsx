'use client'

import { Popover as BasePopover } from '@base-ui/react/popover'
import * as React from 'react'
import { cn } from '@/lib/utils'

const Popover = BasePopover.Root

const PopoverTrigger = BasePopover.Trigger

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BasePopover.Popup>
>(({ className, ...props }, ref) => (
  <BasePopover.Portal>
    <BasePopover.Positioner sideOffset={8}>
      <BasePopover.Popup
        className={cn(
          'z-50 w-72 border border-border bg-popover p-4 shadow-lg',
          'data-[ending-style]:opacity-0 data-[ending-style]:scale-95',
          'data-[starting-style]:opacity-0 data-[starting-style]:scale-95',
          'origin-[var(--transform-origin)] transition-all duration-150',
          className,
        )}
        ref={ref}
        {...props}
      />
    </BasePopover.Positioner>
  </BasePopover.Portal>
))
PopoverContent.displayName = 'PopoverContent'

const PopoverTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof BasePopover.Title>
>(({ className, ...props }, ref) => (
  <BasePopover.Title
    className={cn('font-display font-semibold text-sm mb-1', className)}
    ref={ref}
    {...props}
  />
))
PopoverTitle.displayName = 'PopoverTitle'

const PopoverDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof BasePopover.Description>
>(({ className, ...props }, ref) => (
  <BasePopover.Description
    className={cn('text-sm font-sans text-muted-foreground', className)}
    ref={ref}
    {...props}
  />
))
PopoverDescription.displayName = 'PopoverDescription'

const PopoverClose = BasePopover.Close

export { Popover, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger }
