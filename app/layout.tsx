import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// === UPDATE THIS SECTION ===
export const metadata: Metadata = {
  title: 'Keshav Sharma | AI, Data & Software Engineer',
  description: 'NASA Space Apps Winner building production-ready AI agents, scalable SemRAG pipelines, and robust backend systems.',
  
  // This ensures the title looks good on social media
  openGraph: {
    title: 'Keshav Sharma | AI, Data & Software Engineer',
    description: 'NASA Space Apps Winner. Explore my portfolio of production-grade AI and Engineering projects.',
    type: 'website',
  },
}
// ===========================

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