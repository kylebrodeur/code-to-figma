import type { Metadata } from 'next'
import { barlow, bricolage, martianMono } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'BulkSheetsSync',
  description: 'Sync your Google Sheets at scale',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${barlow.variable} ${martianMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
