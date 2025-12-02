import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'EdTech Project',
  description: 'Du an hoc tap',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}