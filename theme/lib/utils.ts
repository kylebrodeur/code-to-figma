import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn() — standard shadcn class name merger.
 * Combines clsx (conditional classes) with tailwind-merge (deduplication).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * bssVariant — maps semantic intent to BSS color tokens.
 *
 * Example:
 *   <span className={bssVariant('teal', 'text')}>Saved</span>
 *   <div  className={bssVariant('rust',  'bg')}>Error</div>
 */
export type BssIntent  = 'gold' | 'rust' | 'teal' | 'muted' | 'dim'
export type BssContext = 'text' | 'bg'   | 'border'

export function bssVariant(intent: BssIntent, context: BssContext): string {
  const map: Record<BssIntent, Record<BssContext, string>> = {
    gold:  { text: 'text-primary',          bg: 'bg-primary',       border: 'border-primary'       },
    rust:  { text: 'text-destructive',       bg: 'bg-destructive',   border: 'border-destructive'   },
    teal:  { text: 'accent-teal',            bg: 'bg-bss-teal-dark', border: 'border-bss-teal-dark' },
    muted: { text: 'text-muted-foreground',  bg: 'bg-muted',         border: 'border-muted'         },
    dim:   { text: 'text-dim',               bg: 'bg-muted',         border: 'border-muted'         },
  }
  return map[intent][context]
}
