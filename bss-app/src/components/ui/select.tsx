'use client'

import { Select as BaseSelect } from '@base-ui/react/select'
import * as React from 'react'
import { cn } from '@/lib/utils'

const Select = BaseSelect.Root

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof BaseSelect.Trigger>
>(({ className, ...props }, ref) => (
  <BaseSelect.Trigger
    className={cn(
      'flex h-11 w-full items-center justify-between border border-input bg-secondary px-3',
      'text-sm font-mono text-foreground',
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    ref={ref}
    {...props}
  >
    <BaseSelect.Value placeholder="Select…" />
    <BaseSelect.Icon className="ml-2 text-muted-foreground">
      <ChevronDownIcon />
    </BaseSelect.Icon>
  </BaseSelect.Trigger>
))
SelectTrigger.displayName = 'SelectTrigger'

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseSelect.Popup>
>(({ className, children, ...props }, ref) => (
  <BaseSelect.Portal>
    <BaseSelect.Positioner sideOffset={4}>
      <BaseSelect.Popup
        className={cn(
          'z-50 min-w-[8rem] overflow-hidden border border-border bg-popover shadow-lg',
          'data-[ending-style]:opacity-0 data-[ending-style]:scale-95',
          'data-[starting-style]:opacity-0 data-[starting-style]:scale-95',
          'origin-[var(--transform-origin)] transition-all duration-150',
          className,
        )}
        ref={ref}
        {...props}
      >
        <BaseSelect.List className="p-1">{children}</BaseSelect.List>
      </BaseSelect.Popup>
    </BaseSelect.Positioner>
  </BaseSelect.Portal>
))
SelectContent.displayName = 'SelectContent'

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseSelect.Item>
>(({ className, children, ...props }, ref) => (
  <BaseSelect.Item
    className={cn(
      'relative flex cursor-default select-none items-center py-1.5 pl-8 pr-2 text-sm font-mono',
      'text-foreground outline-none transition-colors',
      'hover:bg-accent focus:bg-accent',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      'data-[selected]:text-primary',
      className,
    )}
    ref={ref}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <BaseSelect.ItemIndicator>
        <CheckIcon />
      </BaseSelect.ItemIndicator>
    </span>
    <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
  </BaseSelect.Item>
))
SelectItem.displayName = 'SelectItem'

const SelectGroup = BaseSelect.Group

const SelectGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseSelect.GroupLabel>
>(({ className, ...props }, ref) => (
  <BaseSelect.GroupLabel
    className={cn(
      'py-1.5 pl-8 pr-2 text-xs font-mono font-semibold tracking-widest uppercase text-muted-foreground',
      className,
    )}
    ref={ref}
    {...props}
  />
))
SelectGroupLabel.displayName = 'SelectGroupLabel'

function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export { Select, SelectContent, SelectGroup, SelectGroupLabel, SelectItem, SelectTrigger }
