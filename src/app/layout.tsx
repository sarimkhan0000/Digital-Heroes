import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Digital Heroes — Web-to-Print E-Commerce & Production Platform',
  description: 'Custom print runs, engineered to the millimeter.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#F5F4F0]">
      <body className={`${inter.className} min-h-full text-[#141413] antialiased selection:bg-[#E85D04] selection:text-white flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
