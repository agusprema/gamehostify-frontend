import React from "react";
import { Users, Award, Clock, Star } from "lucide-react";

const stats = [
  { icon: Users, value: "200K+", label: "Pelanggan Aktif" },
  { icon: Award, value: "99.9%", label: "Transaksi Berhasil" },
  { icon: Clock, value: "<30s", label: "Rata-rata Proses" },
  { icon: Star, value: "100+", label: "Produk Digital" },
];

const HeroStats: React.FC = () => {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12" aria-label="Statistik Hero" role="region">
      {stats.map((item, i) => (
        <div
          key={i}
          className="
            bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-gray-800
            rounded-xl p-6 border border-gray-300 dark:border-primary-800/40
            hover:border-primary-500 transition text-center shadow-sm dark:shadow-none
          "
        >
          <item.icon className="h-6 w-6 text-primary-600 dark:text-primary-400 mx-auto mb-2" aria-hidden="true" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {item.value}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{item.label}</p>
        </div>
      ))}
    </section>
  );
};

export default HeroStats;
