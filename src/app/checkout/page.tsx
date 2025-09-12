
import CheckoutPage from '@/components/checkout/CheckoutPage';
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
    return app_url ? new URL('checkout', app_url) : '/checkout';
  } catch {
    return '/checkout';
  }
})();

export const metadata: Metadata = {
  title: `Checkout & Pembayaran | ${app_name}`,
  description: `Proses checkout, pembayaran, dan konfirmasi pesanan Anda di ${app_name}. Pastikan data dan metode pembayaran sudah benar sebelum melanjutkan transaksi.`,
  keywords: [
    'checkout',
    'pembayaran',
    'konfirmasi pesanan',
    'top up game',
    'voucher game',
    'bayar pesanan',
    `checkout ${app_name}`,
  ],
  metadataBase,
  alternates: {
    canonical: '/checkout',
  },
  robots: 'index, follow',
  openGraph: {
    title: `Checkout & Pembayaran | ${app_name}`,
    description: `Proses checkout, pembayaran, dan konfirmasi pesanan Anda di ${app_name}. Pastikan data dan metode pembayaran sudah benar sebelum melanjutkan transaksi.`,
    url: ogUrl,
    siteName: app_name,
    images: [
      {
        url: joinUrl(process.env.NEXT_PUBLIC_OG_IMAGE, 'og-image-checkout.jpg'),
        width: 1200,
        height: 630,
        alt: `${app_name} Checkout & Pembayaran`,
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Checkout & Pembayaran | ${app_name}`,
    description: `Proses checkout, pembayaran, dan konfirmasi pesanan Anda di ${app_name}. Pastikan data dan metode pembayaran sudah benar sebelum melanjutkan transaksi.`,
    images: [joinUrl(process.env.NEXT_PUBLIC_OG_IMAGE, 'og-image-checkout.jpg')],
    site: process.env.NEXT_PUBLIC_TWITER_TAG,
  },
};

export const viewport = {
  themeColor: "#6b21a8",
};

export default function CheckoutRoute() {
  return <CheckoutPage />;
}
