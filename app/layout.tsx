import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Header from '@/components/layout/Header'
import NavBar from '@/components/layout/NavBar'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Taques Agents',
  description: 'Painel de orquestração de agentes — Taques Advogados',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <NavBar />
        <main className="flex-1 px-6 py-6">{children}</main>
      </body>
    </html>
  )
}
