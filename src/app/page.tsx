
import dynamic from "next/dynamic";
import { joinUrl } from "@/lib/url";
import Hero from "@/components/sections/Hero/Hero";
import ProductGrid from "@/components/sections/Products/ProductGrid";
import Wrapper from "@/components/ui/Wrapper";
import { normalizeSlidesPayload } from "@/lib/slide/normalize";
import { fetchJson } from "@/lib/fetchJson";
import type { Slide } from "@/components/sections/Hero/slide";

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
    return app_url ? new URL('/', app_url) : '/';
  } catch {
    return '/';
  }
})();

// Dynamic import (lazy load)
const Faq = dynamic(() => import("@/components/sections/Faq/Faq"));
const Testimonials = dynamic(() => import("@/components/sections/Testimonials/Testimonials"));

// FAQ items (static, bisa di luar komponen)
const FAQ_ITEMS = [
  { 
    q: "Seberapa cepat proses top-up?", 
    a: "Sebagian besar top-up diproses kurang dari 30 detik. Namun, untuk beberapa game, proses bisa memakan waktu hingga 5 menit pada jam sibuk." 
  },
  { 
    q: "Apakah aman melakukan top-up di sini?", 
    a: "Ya, kami menggunakan API resmi game dan metode pembayaran yang aman. Data akun Anda tidak akan pernah disimpan." 
  },
  { 
    q: "Bagaimana jika kredit saya tidak masuk?", 
    a: "Segera hubungi tim dukungan 24/7 kami. Kami menjamin pengiriman atau pengembalian dana penuh dalam 24 jam." 
  },
  { 
    q: "Apakah ada promo atau diskon?", 
    a: "Tentu! Kami secara rutin memberikan bonus kredit, diskon pembelian dalam jumlah besar, dan promo spesial untuk pelanggan setia." 
  },
  {
    q: "Metode pembayaran apa saja yang tersedia?",
    a: "Kami mendukung berbagai metode pembayaran seperti transfer bank, e-wallet (OVO, GoPay, Dana), kartu kredit/debit, hingga gerai ritel seperti Alfamart dan Indomaret."
  },
  {
    q: "Bagaimana proses refund jika ada kesalahan?",
    a: "Jika terjadi kesalahan transaksi atau gagal top-up, kami akan melakukan refund maksimal 1x24 jam setelah laporan diterima. Proses ini 100% aman dan transparan."
  },
  {
    q: "Bagaimana cara melakukan top-up?",
    a: "Pilih game yang diinginkan, masukkan ID akun Anda, pilih nominal, lakukan pembayaran, dan saldo akan masuk secara otomatis."
  }
];

// Testimonials (static, bisa di luar komponen)
const testimonials = [
  { name: 'Alex Chen', game: 'Mobile Legends', rating: 5, comment: 'Super fast delivery! Got my diamonds in less than 20 seconds.', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100' },
  { name: 'Sarah Kim', game: 'Genshin Impact', rating: 5, comment: "Best prices I've found online. Will definitely use again!", avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100' },
  { name: 'Mike Johnson', game: 'PUBG Mobile', rating: 5, comment: 'Reliable service with great customer support. Highly recommended.', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100' }
];

export const metadata = {
  title: `${app_name} – Top-up Game, Pulsa & Paket Data, Langganan Digital Murah & Instan`,
  description: `Top-up Mobile Legends, Free Fire, Genshin Impact, beli pulsa & paket data semua operator, dan langganan digital instan & aman hanya di ${app_name}.`,
  keywords: [
    'top up game murah',
    'top up mobile legends',
    'top up free fire',
    'top up genshin impact',
    'beli pulsa online',
    'paket data murah',
    'voucher langganan digital',
    'top up diamond',
    `${app_name} top up`
  ],
  metadataBase,
  alternates: { canonical: '/' },
  robots: 'index, follow',
  openGraph: {
    title: `${app_name} – Top-up Game, Pulsa & Paket Data, Langganan Digital`,
    description: `Top-up game favorit, isi pulsa & paket internet Telkomsel/Indosat/XL/Tri, dan beli langganan digital dengan harga terbaik di ${app_name}.`,
    url: ogUrl,
    siteName: app_name,
    images: [
      {
        url: joinUrl(process.env.NEXT_PUBLIC_OG_IMAGE, 'og-image.jpg'),
        width: 1200,
        height: 630,
      alt: `${app_name} – Top-up Game & Pulsa`,
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${app_name} – Top-up Game, Pulsa & Paket Data Murah`,
    description: `Top-up MLBB, FF, Genshin, beli pulsa & paket data instan, plus langganan digital—semua di ${app_name}.`,
    images: [joinUrl(process.env.NEXT_PUBLIC_OG_IMAGE, 'og-image.jpg')],
    site: process.env.NEXT_PUBLIC_TWITER_TAG,
  },
};

export const viewport = { themeColor: "#6b21a8" };


export default async function HomePage() {
  const API = process.env.BACKEND_API_BASE_URL ?? '';


  // Fetch paralel & error safe
  const [jsonGames, jsonOperators, jsonSlider, jsonEntertaiments] = await Promise.all([
    fetchJson(joinUrl(API, 'api/v1/games?per_page=6'), { headers: { Accept: 'application/json' }, next: { revalidate: 3600 } }),
    fetchJson(joinUrl(API, 'api/v1/operators?per_page=6'), { headers: { Accept: 'application/json' }, next: { revalidate: 3600 } }),
    fetchJson(joinUrl(API, 'api/v1/contents/slider'), { headers: { Accept: 'application/json' }, next: { revalidate: 3600 } }),
    fetchJson(joinUrl(API, 'api/v1/entertainments?per_page=6'), { headers: { Accept: 'application/json' }, next: { revalidate: 3600 } }),
  ]);

  const dataGames = jsonGames?.data ?? {};
  const games = dataGames.games ?? [];
  const nextCursor = dataGames.next_cursor ?? null;
  const hasMore = !!dataGames.has_more;
  const operators = jsonOperators?.data?.operators ?? [];
  const slider: Slide[] = normalizeSlidesPayload(jsonSlider?.data ?? jsonSlider, API);

  const entertainments = jsonEntertaiments?.data?.entertainment ?? [];

  return (
    <Wrapper>
      <Hero slider={slider} />
      <ProductGrid
        activeCategoryDefault="topup"
        games={games}
        operators={operators}
        entertainments={entertainments}
        nextCursor={nextCursor}
        hasMore={hasMore}
      />
      {/* Testimonials */}
      <div className="relative py-16">
        <Testimonials testimonials={testimonials} />
      </div>
      {/* FAQ */}
      <div className="relative py-16">
        <Faq
          items={FAQ_ITEMS}
          variant="accordion"
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about game top-ups"
        />
      </div>
    </Wrapper>
  );
}
