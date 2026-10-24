import type { Metadata } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import './globals.css'

/*
 * Three fonts, each with one job:
 *  - Instrument Serif → the story lines and titles (elegant, like a documentary title card)
 *  - Geist            → normal reading text
 *  - Geist Mono       → instrument readouts: the cosmic clock, labels, timestamps
 *
 * `variable` turns each font into a CSS variable (e.g. --font-display),
 * which tailwind.config.ts maps to the classes font-display / font-sans / font-mono.
 */
const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
})
const sans = Geist({ subsets: ['latin'], variable: '--font-sans' })
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

const description =
  'AI engineer building multi-agent systems, RAG pipelines and the backends that carry them. Founding Engineer at Importex.'

export const metadata: Metadata = {
  // The base URL lets WhatsApp, LinkedIn etc. find the preview image.
  metadataBase: new URL('https://keshavsharma.app'),
  title: 'Keshav Sharma | AI Engineer',
  description,
  openGraph: {
    title: 'Keshav Sharma | AI Engineer',
    description,
    url: 'https://keshavsharma.app',
    siteName: 'Keshav Sharma',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="bg-black font-sans text-white antialiased">{children}</body>
    </html>
  )
}