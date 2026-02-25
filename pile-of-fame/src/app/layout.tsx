import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { cn } from '@/lib/utils'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pile of Fame',
  description: 'The Strava for miniature painting. Transform your pile of shame into public momentum.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, 'min-h-screen bg-background antialiased')}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
