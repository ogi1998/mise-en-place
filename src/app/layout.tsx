import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mise en Place',
  description: 'Restaurant Booking & Management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}