"use client";

import { Tv, Clapperboard, Shield, Headphones, Award, Zap } from "lucide-react";
import Wrapper from "@/components/ui/Wrapper";
import { HiburanTopUp } from "@/components/sections/hiburan";
import type { Hiburan } from "@/components/sections/hiburan";
import dynamic from "next/dynamic";

const Faq = dynamic(() => import("@/components/sections/Faq/Faq"), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-200 dark:bg-gray-800/50 animate-pulse rounded-xl" />,
});
const Testimonials = dynamic(() => import("@/components/sections/Testimonials/Testimonials"), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-200 dark:bg-gray-800/50 animate-pulse rounded-xl" />,
});

export interface HiburanPageProps {
  hiburans: Hiburan[];
}

const FAQ_ITEMS = [
  {
    q: "Bagaimana cara membeli paket hiburan?",
    a: "Pilih layanan hiburan, masukkan nomor atau akun yang diperlukan, pilih paket, lalu lakukan pembayaran. Paket akan aktif setelah pembayaran berhasil.",
  },
  {
    q: "Berapa lama proses aktivasi paket?",
    a: "Sebagian besar paket hiburan aktif secara instan. Pada kondisi tertentu, proses dapat memakan waktu hingga 5 menit.",
  },
  {
    q: "Bagaimana jika paket tidak aktif?",
    a: "Jika paket belum aktif setelah beberapa menit, hubungi tim support kami dengan menyertakan bukti transaksi untuk dibantu lebih lanjut.",
  },
  {
    q: "Apakah ada biaya tambahan?",
    a: "Harga yang tertera adalah harga final kecuali metode pembayaran tertentu yang mengenakan biaya tambahan.",
  },
  {
    q: "Bisakah membeli paket untuk orang lain?",
    a: "Tentu, Anda dapat memasukkan nomor atau akun penerima saat melakukan transaksi.",
  },
  {
    q: "Bisakah transaksi dibatalkan?",
    a: "Transaksi yang sudah berhasil dan paket telah aktif tidak dapat dibatalkan.",
  },
  {
    q: "Bagaimana cara mengetahui promo?",
    a: "Cek secara berkala halaman utama kami atau berlangganan newsletter untuk informasi promo terbaru.",
  },
];

const testimonials = [
  { name: 'Andi Pratama', game: 'Netflix', rating: 5, comment: 'Streaming lancar dan harga bersahabat.', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100' },
  { name: 'Siti Rahma', game: 'VIU', rating: 5, comment: 'Proses cepat, tinggal bayar langsung aktif.', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100' },
  { name: 'Bambang Setiawan', game: 'Disney+', rating: 5, comment: 'Pelayanan memuaskan dan banyak promo.', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100' }
];

const whyChooseUs = [
  { icon: Zap, title: 'Aktivasi Cepat', description: 'Paket hiburan aktif hanya dalam hitungan detik.' },
  { icon: Shield, title: 'Pembayaran Aman', description: 'Sistem pembayaran yang terlindungi.' },
  { icon: Headphones, title: 'Support 24/7', description: 'Tim bantuan selalu siap melayani Anda.' },
  { icon: Award, title: 'Harga Terbaik', description: 'Harga kompetitif dengan banyak promo menarik.' },
];

export default function HiburanPage({ hiburans }: HiburanPageProps) {
  return (
    <Wrapper>
      <main aria-labelledby="hiburan-heading">
        <section className="relative py-16 transition-colors" aria-label="Header Hiburan">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-r from-primary-400 to-primary-600 p-4 rounded-2xl inline-block mb-6 shadow-lg shadow-primary-500/30">
              <div className="flex items-center justify-center gap-2 text-white">
                <Tv className="h-8 w-8" aria-hidden="true" />
                <Clapperboard className="h-8 w-8" aria-hidden="true" />
              </div>
            </div>
            <h1 id="hiburan-heading" className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Layanan Hiburan & Streaming
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Beli paket streaming dan hiburan favorit Anda dengan mudah, cepat, dan aman.
            </p>
          </div>
        </section>

        <section className="relative py-16 transition-colors" aria-labelledby="why-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="why-heading" className="text-3xl md:text-4xl font-extrabold mb-3 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                Kenapa Pilih Kami?
              </h2>
              <div className="w-24 h-1 mx-auto bg-gradient-to-r from-primary-400 to-primary-600 rounded-full mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-sm md:text-base">
                Nikmati pengalaman hiburan terbaik dengan layanan kami.
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

        <section className="relative py-16 transition-colors" aria-labelledby="hiburans-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
            <h2 id="hiburans-heading" className="text-3xl md:text-4xl font-extrabold mb-3 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Pilih Layanan
            </h2>
            <div className="w-24 h-1 mx-auto bg-gradient-to-r from-primary-400 to-primary-600 rounded-full mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-sm md:text-base">
              Temukan berbagai paket hiburan populer sesuai kebutuhan Anda.
            </p>
          </div>
          <HiburanTopUp hiburans={hiburans} />
        </section>

        <section className="relative py-16 transition-colors" aria-labelledby="testi-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Testimonials
              testimonials={testimonials}
              title="Apa Kata Mereka"
              subtitle="Ulasan pelanggan tentang layanan hiburan kami."
            />
          </div>
        </section>

        <section className="relative py-16 transition-colors" aria-labelledby="faq-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Faq
              items={FAQ_ITEMS}
              variant="accordion"
              title="Pertanyaan yang Sering Diajukan"
              subtitle="Semua yang perlu kamu tahu tentang paket hiburan."
            />
          </div>
        </section>
      </main>
    </Wrapper>
  );
}
