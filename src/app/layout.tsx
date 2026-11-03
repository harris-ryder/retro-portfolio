import type { Metadata } from 'next'
import './globals.css'
import ColorInspector from '@/components/ColorInspector'

export const metadata: Metadata = {
  title: 'Harris Ryder',
  description: 'Harris Ryder',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ColorInspector />
      </body>
    </html>
  )
}
