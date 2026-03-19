'use client'

import { Accordion as BaseAccordion } from '@base-ui/react/accordion'
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface FAQItemProps {
  question: string
  answer: string
  value: string
  className?: string
}

export function FAQItem({ question, answer, value, className }: FAQItemProps) {
  return (
    <BaseAccordion.Root className={cn('w-full', className)}>
      <BaseAccordion.Item value={value} className="border-b border-border">
        <BaseAccordion.Header className="flex">
          <BaseAccordion.Trigger
            className={cn(
              'flex flex-1 items-center justify-between py-4',
              'font-mono text-sm font-medium text-foreground',
              'transition-colors hover:text-primary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              '[&[data-panel-open]]:text-primary',
              '[&[data-panel-open]>svg]:rotate-180',
            )}
          >
            {question}
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
              className="shrink-0 transition-transform duration-200"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </BaseAccordion.Trigger>
        </BaseAccordion.Header>
        <BaseAccordion.Panel className="overflow-hidden text-sm font-sans text-muted-foreground">
          <div className="pb-4 leading-relaxed">{answer}</div>
        </BaseAccordion.Panel>
      </BaseAccordion.Item>
    </BaseAccordion.Root>
  )
}

export default FAQItem
