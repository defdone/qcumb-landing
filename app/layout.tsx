import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'qcumb • your anonymous space',
  description:
    'qcumb – your anonymous space to share content securely and privately. Share freely, stay private.',
  keywords: [
    'qcumb',
    'anonymous',
    'private sharing',
    'secure content',
    'web3',
    'payments',
    'authentication',
  ],
  authors: [{ name: 'qcumb' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: 'google-site-verification',
  },
  other: {
    google: 'notranslate',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
