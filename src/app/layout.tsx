import PwaRegister from '@/components/PwaRegister'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'FinanceFlow',
  description: 'Tu app de finanzas personales',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FinanceFlow',
  },
}

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='es'>
      <head>
        <link rel='apple-touch-icon' href='/icons/apple-touch-icon.png' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta
          name='apple-mobile-web-app-status-bar-style'
          content='black-translucent'
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <PwaRegister />
        {children}
      </body>
    </html>
  )
}
