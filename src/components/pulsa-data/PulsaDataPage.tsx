"use client";

import { Smartphone, Wifi, Shield, Headphones, Award, Zap } from "lucide-react";
import Wrapper from "@/components/ui/Wrapper";
import { PulsaTopUp } from "@/components/sections/pulsa-data";
import type { Operator } from "@/components/sections/pulsa-data/types";
import dynamic from "next/dynamic";

const Faq = dynamic(() => import("@/components/sections/Faq/Faq"), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-200 dark:bg-gray-800/50 animate-pulse rounded-xl" />,
});
const Testimonials = dynamic(() => import("@/components/sections/Testimonials/Testimonials"), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-200 dark:bg-gray-800/50 animate-pulse rounded-xl" />,
});

export interface PulsaDataPageProps {
  operators: Operator[];
}

// FAQ khusus Pulsa & Data
const FAQ_ITEMS = [
  {
    q: "Bagaimana cara membeli pulsa atau paket data?",
    a: "Pilih operator yang Anda gunakan, masukkan nomor telepon, pilih nominal pulsa atau paket data, lalu lakukan pembayaran. Pulsa akan masuk secara otomatis setelah pembayaran berhasil."
  },
  {
    q: "Berapa lama pulsa masuk setelah pembayaran?",
    a: "Sebagian besar pembelian pulsa dan data diproses instan kurang dari 30 detik. Namun, pada jam sibuk atau gangguan operator, bisa memakan waktu 1-5 menit."
  },
  {
    q: "Apakah ada biaya tambahan untuk pembelian pulsa?",
    a: "Harga yang tertera adalah harga final. Kami tidak mengenakan biaya tambahan kecuali metode pembayaran tertentu yang memiliki biaya admin."
  },
  {
    q: "Bagaimana jika pulsa tidak masuk?",
    a: "Jika pulsa tidak masuk dalam 5 menit, hubungi tim support kami dengan bukti transaksi. Kami akan melakukan pengecekan dan pengembalian dana jika diperlukan."
  },
  {
    q: "Apakah nomor telepon harus terdaftar?",
    a: "Pastikan Anda memasukkan nomor telepon yang aktif dan benar. Nomor tidak harus terdaftar di situs kami, tapi kesalahan nomor bukan tanggung jawab kami."
  },
  {
    q: "Bisakah membeli pulsa untuk orang lain?",
    a: "Ya, Anda bisa mengisi pulsa atau paket data untuk nomor teman atau keluarga dengan memasukkan nomor mereka saat transaksi."
  },
  {
    q: "Bagaimana cara mengetahui promo paket data?",
    a: "Kami sering memberikan promo menarik untuk pembelian pulsa dan paket data. Lihat banner promo di halaman utama atau cek halaman promo."
  }
];

// Testimoni khusus Pulsa & Data
const testimonials = [
  { name: 'Budi Santoso', game: 'Telkomsel Pulsa', rating: 5, comment: 'Pulsa masuk hanya dalam 10 detik! Mantap.', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100' },
  { name: 'Rina Amelia', game: 'Indosat Paket Data', rating: 5, comment: "Harga paket data lebih murah dibandingkan tempat lain!", avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100' },
  { name: 'Agus Wijaya', game: 'XL Pulsa', rating: 5, comment: 'Transaksi lancar dan support cepat.', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100' }
];

// Kenapa pilih layanan ini?
const whyChooseUs = [
  { icon: Zap, title: 'Proses Instan', description: 'Pulsa dan data langsung masuk dalam hitungan detik.' },
  { icon: Shield, title: 'Transaksi Aman', description: 'Sistem keamanan tinggi untuk melindungi Anda.' },
  { icon: Headphones, title: 'Dukungan 24/7', description: 'CS kami siap membantu kapan saja.' },
  { icon: Award, title: 'Harga Terbaik', description: 'Harga bersaing dengan banyak promo menarik.' }
];

export default function PulsaDataPage({ operators }: PulsaDataPageProps) {
  return (
    <Wrapper>
      {/* Header */}
      <section className="relative py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-primary-400 to-primary-600 p-4 rounded-2xl inline-block mb-6 shadow-lg shadow-primary-500/30">
            <div className="flex items-center justify-center gap-2 text-white">
              <Smartphone className="h-8 w-8" />
              <Wifi className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Pulsa & Paket Data
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Isi ulang pulsa dan paket data semua operator Indonesia dengan harga terbaik dan pengiriman instan.
          </p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="relative py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Kenapa Pilih Kami?
            </h2>
            <div className="w-24 h-1 mx-auto bg-gradient-to-r from-primary-400 to-primary-600 rounded-full mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-sm md:text-base">
              Alasan kenapa layanan top-up kami dipercaya banyak pelanggan.
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
                  <Icon className="h-8 w-8 text-primary-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Operator Picker */}
      <section className="relative py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Pilih Operator
          </h2>
          <div className="w-24 h-1 mx-auto bg-gradient-to-r from-primary-400 to-primary-600 rounded-full mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-sm md:text-base">
            Pilih operator dan paket yang sesuai kebutuhan Anda.
          </p>
        </div>
        <PulsaTopUp operators={operators} />
      </section>

      {/* Testimonials */}
      <section className="relative py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Testimonials
            testimonials={testimonials}
            title="What Gamers Say"
            subtitle="Ulasan pelanggan kami tentang layanan pulsa & data."
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Faq
            items={FAQ_ITEMS}
            variant="accordion"
            title="Frequently Asked Questions"
            subtitle="Semua yang perlu kamu tahu tentang isi ulang pulsa & data."
          />
        </div>
      </section>
    </Wrapper>
  );
}