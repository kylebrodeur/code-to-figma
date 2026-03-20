'use client'

import { Menu as BaseMenu } from '@base-ui/react/menu'
import * as React from 'react'
import { cn } from '@/lib/utils'

const DropdownMenu = BaseMenu.Root

const DropdownMenuTrigger = BaseMenu.Trigger

const DropdownMenuPortal = BaseMenu.Portal

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseMenu.Popup>
>(({ className, ...props }, ref) => (
  <BaseMenu.Portal>
    <BaseMenu.Positioner sideOffset={4}>
      <BaseMenu.Popup
        className={cn(
          'z-50 min-w-[10rem] overflow-hidden border border-border bg-popover p-1 shadow-lg',
          'data-[ending-style]:opacity-0 data-[ending-style]:scale-95',
          'data-[starting-style]:opacity-0 data-[starting-style]:scale-95',
          'origin-[var(--transform-origin)] transition-all duration-150',
          className,
        )}
        ref={ref}
        {...props}
      />
    </BaseMenu.Positioner>
  </BaseMenu.Portal>
))
DropdownMenuContent.displayName = 'DropdownMenuContent'

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseMenu.Item>
>(({ className, ...props }, ref) => (
  <BaseMenu.Item
    className={cn(
      'relative flex cursor-default select-none items-center px-2 py-1.5 text-sm font-mono',
      'text-foreground outline-none transition-colors',
      'hover:bg-accent focus:bg-accent',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    ref={ref}
    {...props}
  />
))
DropdownMenuItem.displayName = 'DropdownMenuItem'

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    role="separator"
    className={cn('-mx-1 my-1 border-t border-border', className)}
    ref={ref}
    {...props}
  />
))
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'

const DropdownMenuLabel = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'px-2 py-1.5 text-xs font-mono font-semibold tracking-widest uppercase text-muted-foreground',
      className,
    )}
    {...props}
  />
)
DropdownMenuLabel.displayName = 'DropdownMenuLabel'

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
}
