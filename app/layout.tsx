import './globals.css';
import './style.css';

import type { Metadata } from 'next';
import Script from 'next/script';

import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Selection Furniture',
  description: 'Modern furniture and home decor',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />

        {children}

        <Footer />

        {/* IONICONS */}
        <Script
          type="module"
          src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"
          strategy="beforeInteractive"
        />

        <Script
          noModule
          src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}