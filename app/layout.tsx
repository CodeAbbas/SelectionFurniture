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
      <head>
        <link rel="stylesheet" href="/assets/css/style.css" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}