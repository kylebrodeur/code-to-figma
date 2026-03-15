import { Barlow, Bricolage_Grotesque, Martian_Mono } from 'next/font/google'

/**
 * BSS Typography Stack
 *
 * Display  → Bricolage Grotesque  (headings, hero text)
 * Body     → Barlow               (paragraphs, prose)
 * Data     → Martian Mono         (buttons, labels, code, data, nav)
 *
 * Usage in app/layout.tsx:
 *   import { bricolage, barlow, martianMono } from './fonts'
 *   <html className={`${bricolage.variable} ${barlow.variable} ${martianMono.variable}`}>
 */

export const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
  preload: true,
})

export const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-barlow',
  display: 'swap',
  preload: true,
})

export const martianMono = Martian_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-martian-mono',
  display: 'swap',
  preload: false,
})
