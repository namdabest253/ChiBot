import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChiBot',
  description: 'Your friendly conversational partner for practicing Chinese',
  icons: { icon: '/logo4.png' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#222222] text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
