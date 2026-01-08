import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Selection Furniture Admin',
  description: 'Admin dashboard for product management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}