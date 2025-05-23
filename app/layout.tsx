import type React from "react"
import type { Metadata } from "next"
import { Prompt } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"

// Import Prompt font
const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
})

export const metadata: Metadata = {
  title: "Banpu Team Matching",
  description: "AI-Powered Team Matching Platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${prompt.variable} font-prompt min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
