import './globals.css';
import { Inter } from "next/font/google";
import { Providers } from './providers';
import ClientWrapper from './ClientWrapper';

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
