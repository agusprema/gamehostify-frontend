interface Props {
  searchParams: Promise<{ ref?: string }>;
}

import { Suspense } from "react";
import PageTransition from "@/components/animations/PageTransition";
import InvoiceClient from "@/components/invoice/InvoiceClient";
import InvoiceSkeleton from "@/components/invoice/InvoiceSkeleton";


import type { Metadata } from "next";
import { joinUrl } from "@/lib/url";

const app_name = process.env.NEXT_PUBLIC_APP_NAME;
const app_url = process.env.NEXT_PUBLIC_BASE_URL;

const metadataBase = (() => {
  try {
    return app_url ? new URL(app_url) : undefined;
  } catch {
    return undefined;
  }
})();
const ogUrl = (() => {
  try {
    return app_url ? new URL('invoice', app_url) : '/invoice';
  } catch {
    return '/invoice';
  }
})();

export const metadata: Metadata = {
  title: `Cek Invoice Pembayaran & Pengiriman | ${app_name}`,
  description: `Cek status pembayaran, pengiriman, dan detail invoice transaksi Anda di ${app_name}. Masukkan Reference ID untuk melihat status pesanan dan riwayat transaksi Anda.`,
  keywords: [
    'cek invoice',
    'status pembayaran',
    'status pengiriman',
    'cek pesanan',
    'invoice game',
    'riwayat transaksi',
    `invoice ${app_name}`,
  ],
  metadataBase,
  alternates: {
    canonical: '/invoice',
  },
  robots: 'index, follow',
  openGraph: {
    title: `Cek Invoice Pembayaran & Pengiriman | ${app_name}`,
    description: `Cek status pembayaran, pengiriman, dan detail invoice transaksi Anda di ${app_name}. Masukkan Reference ID untuk melihat status pesanan dan riwayat transaksi Anda.`,
    url: ogUrl,
    siteName: app_name,
    images: [
      {
        url: joinUrl(process.env.NEXT_PUBLIC_OG_IMAGE, 'og-image-invoice.jpg'),
        width: 1200,
        height: 630,
        alt: `${app_name} Invoice Cek Status`,
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Cek Invoice Pembayaran & Pengiriman | ${app_name}`,
    description: `Cek status pembayaran, pengiriman, dan detail invoice transaksi Anda di ${app_name}. Masukkan Reference ID untuk melihat status pesanan dan riwayat transaksi Anda.`,
    images: [joinUrl(process.env.NEXT_PUBLIC_OG_IMAGE, 'og-image-invoice.jpg')],
    site: process.env.NEXT_PUBLIC_TWITER_TAG,
  },
};

export const viewport = {
  themeColor: "#6b21a8",
};

export const dynamic = "force-dynamic"; // selalu realtime

export default async function InvoicePage({ searchParams }: Props) {
  const params = await searchParams;
  const ref = typeof params?.ref === "string" ? params.ref : "";

  return (
    <PageTransition>
      <Suspense fallback={<InvoiceSkeleton />}>
        <InvoiceClient initialRef={ref} autoFetch={true} enablePolling={true} />
      </Suspense>
    </PageTransition>
  );
}
