import type { Metadata } from 'next'
import { VT323 } from 'next/font/google'
import './globals.css'

const vt323 = VT323({ weight: '400', subsets: ['latin'], variable: '--font-vt323' })

export const metadata: Metadata = {
  title: 'Harris Ryder',
  description: 'Harris Ryder',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={vt323.variable}>{children}</body>
    </html>
  )
}
