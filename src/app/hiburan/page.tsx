import HiburanPage from '@/components/hiburan/HiburanPage';
import PageTransition from '@/components/animations/PageTransition';
import { Metadata } from 'next';
import { fetchJson } from '@/lib/fetchJson';

const app_name = process.env.NEXT_PUBLIC_APP_NAME;
const app_url = process.env.NEXT_PUBLIC_BASE_URL;

export const metadata: Metadata = {
  title: `Layanan Hiburan & Streaming | ${app_name}`,
  description: `Beli paket Netflix, VIU, dan layanan hiburan lainnya dengan harga terbaik di ${app_name}.`,
  metadataBase: new URL(app_url ?? ''),
  alternates: {
    canonical: '/hiburan',
  },
  robots: 'index, follow',
  openGraph: {
    title: `Layanan Hiburan & Streaming | ${app_name}`,
    description: `Nikmati berbagai layanan streaming populer dengan harga murah hanya di ${app_name}.`,
    url: new URL(`${app_url ?? ''}hiburan`),
    siteName: app_name,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_OG_IMAGE}og-image-hiburan.jpg`,
        width: 1200,
        height: 630,
        alt: `${app_name} Hiburan`,
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Layanan Hiburan & Streaming | ${app_name}`,
    description: `Beli paket streaming favorit Anda secara instan di ${app_name}.`,
    images: [`${process.env.NEXT_PUBLIC_OG_IMAGE}og-image-hiburan.jpg`],
    site: process.env.NEXT_PUBLIC_TWITER_TAG,
  },
};

export const viewport = {
  themeColor: '#6b21a8',
};

export default async function Hiburan() {
  const API = process.env.BACKEND_API_BASE_URL ?? '';

  const [json] = await Promise.all([
    fetchJson(API + 'api/v1/entertainments?per_page=24', { headers: { Accept: 'application/json' }, next: { revalidate: 3600 } }),
  ]);

  const data = json?.data ?? {};
  const hiburans = data.entertainment ?? [];

  return (
    <PageTransition>
      <HiburanPage hiburans={hiburans} />
    </PageTransition>
  );
}
