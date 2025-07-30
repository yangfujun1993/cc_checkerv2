import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { MatrixRain } from '@/components/animations/MatrixRain'
import { QuantumParticles } from '@/components/animations/QuantumParticles'
import { StellarHeader } from '@/components/layout/StellarHeader'
import { InterstellarFooter } from '@/components/layout/InterstellarFooter'
import { CosmicBackground } from '@/components/animations/CosmicBackground'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Black Panther CC Checker - Quantum Technology',
  description: 'Advanced credit card verification system with Black Panther aesthetics and quantum technology',
  keywords: 'credit card, checker, black panther, quantum, technology, verification',
  authors: [{ name: 'Black Panther Tech' }],
  robots: 'noindex, nofollow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} quantum-container`}>
        <Providers>
          <CosmicBackground />
          <MatrixRain />
          <QuantumParticles />
          
          <div className="relative z-10 min-h-screen flex flex-col">
            <StellarHeader />
            
            <main className="flex-1 relative">
              {children}
            </main>
            
            <InterstellarFooter />
          </div>
        </Providers>
      </body>
    </html>
  )
} 