'use client';

import dynamic from "next/dynamic";
import { Gamepad2, Zap, Shield, Headphones, Award } from 'lucide-react';
import GameTopUp from '../sections/Game/GameTopUp';
import Wrapper from "@/components/ui/Wrapper";

const Faq = dynamic(() => import("@/components/sections/Faq/Faq"), { ssr: false });
const Testimonials = dynamic(() => import("@/components/sections/Testimonials/Testimonials"), { ssr: false });

interface GamePackage {
  id: string;
  name: string;
  amount: string;
  type: string;
  final_price: number;
  original_price?: number;
  is_popular?: boolean;
  has_discount: boolean;
  metadata?: { bonus?: string };
}

interface Game {
  id: string;
  name: string;
  slug: string;
  logo: string;
  category: string;
  rating?: number;
  label: string;
  placeholder: string;
  is_popular?: boolean;
  packages: GamePackage[];
}

interface GameTopUpPageProps {
  games: Game[];
  nextCursor?: string | null;
  hasMore?: boolean;
  onBackHref?: string;
}

const FAQ_ITEMS = [
  {
    q: "Bagaimana cara melakukan top-up game?",
    a: "Pilih game yang ingin di-top-up, masukkan ID atau UID akun Anda, pilih nominal yang diinginkan, kemudian lakukan pembayaran. Saldo akan masuk secara otomatis setelah pembayaran berhasil."
  },
  {
    q: "Berapa lama waktu proses top-up?",
    a: "Sebagian besar top-up diproses secara instan kurang dari 30 detik. Namun, pada kondisi tertentu seperti server sibuk, proses dapat memakan waktu hingga 5 menit."
  },
  {
    q: "Bagaimana jika top-up gagal?",
    a: "Jika saldo tidak masuk setelah 5 menit, segera hubungi tim support kami dengan memberikan bukti transaksi. Kami siap membantu menyelesaikan masalah atau melakukan refund."
  },
  {
    q: "Apakah ada biaya tambahan saat top-up?",
    a: "Tidak ada biaya tambahan yang tersembunyi. Harga yang tertera adalah harga final, kecuali metode pembayaran tertentu yang mengenakan biaya admin."
  },
  {
    q: "Bisakah saya top-up untuk akun teman?",
    a: "Tentu saja! Anda hanya perlu memasukkan ID akun teman Anda saat melakukan transaksi, dan saldo akan dikirim ke akun tersebut."
  },
  {
    q: "Apakah top-up bisa dibatalkan?",
    a: "Setelah pembayaran berhasil dan saldo diproses, transaksi tidak bisa dibatalkan. Pastikan Anda mengisi data ID akun dengan benar."
  },
  {
    q: "Bagaimana cara mengetahui promo top-up?",
    a: "Kami rutin mengadakan promo menarik. Anda dapat memeriksa banner promosi di halaman utama atau berlangganan newsletter untuk mendapatkan info terbaru."
  }
];

const testimonials = [
  { name: 'Alex Chen', game: 'Mobile Legends', rating: 5, comment: 'Super fast delivery! Got my diamonds in less than 20 seconds.', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100' },
  { name: 'Sarah Kim', game: 'Genshin Impact', rating: 5, comment: "Best prices I've found online. Will definitely use again!", avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100' },
  { name: 'Mike Johnson', game: 'PUBG Mobile', rating: 5, comment: 'Reliable service with great customer support. Highly recommended.', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100' }
];

const whyChooseUs = [
  { icon: Zap, title: 'Super Fast', description: 'Top-up hanya dalam hitungan detik.' },
  { icon: Shield, title: 'Secure Payment', description: 'Transaksi aman dan terpercaya.' },
  { icon: Headphones, title: '24/7 Support', description: 'Bantuan pelanggan selalu tersedia.' },
  { icon: Award, title: 'Best Value', description: 'Harga kompetitif dan banyak promo.' }
];

export default function GameTopUpPage({ games, nextCursor, hasMore }: GameTopUpPageProps) {
  return (
    <Wrapper>
      <main aria-labelledby="game-topup-heading">
        {/* Header */}
        <section className="relative py-16 transition-colors" aria-label="Header Game Top-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-r from-primary-400 to-primary-600 p-4 rounded-2xl inline-block mb-6 shadow-lg shadow-primary-500/30">
              <Gamepad2 className="h-8 w-8 text-white" aria-hidden="true" />
            </div>
            <h1 id="game-topup-heading" className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Game Top-up & Credits
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Top-up game lebih mudah dengan harga bersaing dan pengiriman instan.
              Kami mendukung berbagai metode pembayaran terpercaya untuk pengalaman
              bermain yang bebas hambatan.
            </p>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="relative py-16 transition-colors" aria-labelledby="why-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="why-heading" className="text-3xl md:text-4xl font-extrabold mb-3 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                Why Choose Our Service?
              </h2>
              <div className="w-24 h-1 mx-auto bg-gradient-to-r from-primary-400 to-primary-600 rounded-full mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-sm md:text-base">
                Alasan mengapa layanan top-up kami menjadi pilihan gamer.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyChooseUs.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary-500/40 transition text-center shadow-sm"
                  >
                    <Icon className="h-8 w-8 text-primary-500 mx-auto mb-3" aria-hidden="true" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Games */}
        <section className="relative py-16 transition-colors" aria-labelledby="games-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
            <h2 id="games-heading" className="text-3xl md:text-4xl font-extrabold mb-3 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Select Your Game
            </h2>
            <div className="w-24 h-1 mx-auto bg-gradient-to-r from-primary-400 to-primary-600 rounded-full mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-sm md:text-base">
              Pilih game favorit Anda dari koleksi kami yang selalu up-to-date.
            </p>
          </div>
          <GameTopUp games={games} nextCursor={nextCursor} hasMore={hasMore} />
        </section>

        {/* Testimonials */}
        <section className="relative py-16 transition-colors" aria-labelledby="testi-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Testimonials
              testimonials={testimonials}
              title="What Gamers Say"
              subtitle="Pendapat pelanggan tentang layanan top-up kami."
            />
          </div>
        </section>

        {/* FAQ */}
        <section className="relative py-16 transition-colors" aria-labelledby="faq-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Faq
              items={FAQ_ITEMS}
              variant="accordion"
              title="Frequently Asked Questions"
              subtitle="Semua yang perlu Anda ketahui tentang top-up game"
            />
          </div>
        </section>
      </main>
    </Wrapper>
  );
}
