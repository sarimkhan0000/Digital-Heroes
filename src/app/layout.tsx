import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digital Heroes | Custom Web-to-Print Store",
  description: "Premium custom posters, business cards, and print products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#F5F4F0] text-[#141413] antialiased">
        {children}
      </body>
    </html>
  );
}
