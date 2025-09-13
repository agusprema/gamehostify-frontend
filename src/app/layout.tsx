import './globals.css';
import { Inter } from "next/font/google";
import { Providers } from './providers';
import ClientWrapper from './ClientWrapper';

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to common asset origins to accelerate handshake */}
        {process.env.NEXT_PUBLIC_CDN_BASE_URL ? (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_CDN_BASE_URL} crossOrigin="" />
        ) : null}
        {process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ? (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL} crossOrigin="" />
        ) : null}
        <link rel="preconnect" href="https://images.pexels.com" crossOrigin="" />
      </head>
      <body className={`bg-black min-h-screen ${inter.className} custom-scrollbar`}>
        <Providers>
          {/* Komponen interaktif */}
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </Providers>
      </body>
    </html>
  );
}
