
import GameTopUpPage from '@/components/topup/GameTopUpPage';
import PageTransition from '@/components/animations/PageTransition';
import { Metadata } from 'next';
import { fetchJson } from '@/lib/api/fetchJson';

const app_name = process.env.NEXT_PUBLIC_APP_NAME;
const app_url = process.env.NEXT_PUBLIC_BASE_URL;

export const metadata: Metadata = {
  title: `Top-up Game Online Murah & Instan | ${app_name}`,
  description: `Top-up Mobile Legends, Free Fire, PUBG, Valorant, Genshin Impact, dan game populer lainnya dengan harga termurah, diskon, serta pengiriman instan hanya di ${app_name}.`,
  keywords: [
    'top up game online',
    'top up ml murah',
    'top up free fire',
    'top up pubg mobile',
    'top up genshin impact',
    'top up valorant',
    'topup diamond murah',
    'voucher game online',
    `top up ${app_name}`,
  ],
  metadataBase: new URL(app_url ?? ""),
  alternates: {
    canonical: '/game-topup',
  },
  robots: 'index, follow',
  openGraph: {
    title: `Top-up Game Online Murah & Instan | ${app_name}`,
    description: `Top-up MLBB, Free Fire, Genshin Impact, PUBG, Valorant, dan ratusan game lainnya dengan harga murah & pengiriman cepat hanya di ${app_name}.`,
    url: new URL(`${app_url ?? ""}topup`),
    siteName: app_name,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_OG_IMAGE}og-image-topup.jpg`,
        width: 1200,
        height: 630,
        alt: `${app_name} Top-up Game`,
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Top-up Game Online Murah & Instan | ${app_name}`,
    description: `Top-up Mobile Legends, Free Fire, PUBG, Genshin Impact, Valorant, dan game lainnya hanya di ${app_name} dengan harga termurah.`,
    images: [`${process.env.NEXT_PUBLIC_OG_IMAGE}og-image-topup.jpg`],
    site: process.env.NEXT_PUBLIC_TWITER_TAG,
  },
};

export const viewport = {
  themeColor: "#6b21a8",
};


export default async function TopUpPage() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

  const [jsonGames] = await Promise.all([
    fetchJson(API + 'api/v1/games?per_page=24', { headers: { Accept: 'application/json' }, next: { revalidate: 3600 } }),
  ]);

  const data = jsonGames?.data ?? {};
  const games = data.games ?? [];
  const nextCursor = data.next_cursor ?? null;
  const hasMore = !!data.has_more;

  return (
    <PageTransition>
      <GameTopUpPage
        games={games}
        nextCursor={nextCursor}
        hasMore={hasMore}
        onBackHref="/"
      />
    </PageTransition>
  );
}
