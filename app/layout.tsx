import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// === UPDATE THIS BLOCK ===
export const metadata: Metadata = {
  // 1. Set the Base URL so WhatsApp finds the image
  metadataBase: new URL('https://keshav-sharma-portfolio-kappa.vercel.app'),

  title: 'Keshav Sharma | AI, Data & Software Engineer',
  description: 'NASA Space Apps Winner building production-ready AI agents, scalable SemRAG pipelines, and robust backend systems.',

  openGraph: {
    title: 'Keshav Sharma | AI, Data & Software Engineer',
    description: 'NASA Space Apps Winner. Explore my portfolio of production-grade AI and Engineering projects.',
    url: 'https://keshav-sharma-portfolio-kappa.vercel.app',
    siteName: 'Keshav Sharma Portfolio',
    locale: 'en_US',
    type: 'website',
  },
}
// =========================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}