import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { I18nProvider } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Equb Management System | ዲጂታል የዕቁብ ማስተዳደሪያ',
  description: 'A modern, secure, and digital savings circle (Equb) platform for Ethiopia.',
  keywords: 'Equb, Savings Circle, Ethiopia, Finance, Digital Equb, Addis Ababa',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
        <I18nProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'glass border border-border rounded-xl font-sans',
              style: {
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
              },
            }}
          />
        </I18nProvider>
      </body>
    </html>
  )
}
