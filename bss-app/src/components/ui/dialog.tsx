'use client'

import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import * as React from 'react'
import { cn } from '@/lib/utils'

// ─── Dialog ──────────────────────────────────────────────────────────────────

const Dialog = BaseDialog.Root

const DialogTrigger = BaseDialog.Trigger

const DialogPortal = BaseDialog.Portal

const DialogBackdrop = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseDialog.Backdrop>
>(({ className, ...props }, ref) => (
  <BaseDialog.Backdrop
    className={cn(
      'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
      'data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity duration-200',
      className,
    )}
    ref={ref}
    {...props}
  />
))
DialogBackdrop.displayName = 'DialogBackdrop'

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseDialog.Popup>
>(({ className, children, ...props }, ref) => (
  <BaseDialog.Portal>
    <DialogBackdrop />
    <BaseDialog.Popup
      className={cn(
        'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
        'w-full max-w-lg bg-card border border-border rounded-md shadow-xl p-6',
        'data-[ending-style]:opacity-0 data-[ending-style]:scale-95',
        'data-[starting-style]:opacity-0 data-[starting-style]:scale-95',
        'transition-all duration-200',
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </BaseDialog.Popup>
  </BaseDialog.Portal>
))
DialogContent.displayName = 'DialogContent'

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-1.5 mb-4', className)} {...props} />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center justify-end gap-2 mt-6', className)} {...props} />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof BaseDialog.Title>
>(({ className, ...props }, ref) => (
  <BaseDialog.Title
    className={cn('font-display font-semibold text-lg', className)}
    ref={ref}
    {...props}
  />
))
DialogTitle.displayName = 'DialogTitle'

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof BaseDialog.Description>
>(({ className, ...props }, ref) => (
  <BaseDialog.Description
    className={cn('text-sm text-muted-foreground font-sans', className)}
    ref={ref}
    {...props}
  />
))
DialogDescription.displayName = 'DialogDescription'

const DialogClose = BaseDialog.Close

export {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
