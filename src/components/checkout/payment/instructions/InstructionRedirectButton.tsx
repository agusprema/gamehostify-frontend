import React from "react";
import { ExternalLink } from "lucide-react";

interface Props {
  url: string;
  kind?: "DEEPLINK_URL" | "WEB_URL" | string;
}

const InstructionRedirectButton: React.FC<Props> = ({ url, kind }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-md">
      <h3 className="text-gray-800 dark:text-white font-semibold mb-3">Lanjutkan ke Aplikasi Pembayaran</h3>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
      >
        {kind === "DEEPLINK_URL" ? "Buka Aplikasi" : "Lanjutkan"}
        <ExternalLink className="w-4 h-4" />
      </a>
      <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">Jika tidak terbuka otomatis, klik tombol di atas.</p>
    </div>
  );
};

export default InstructionRedirectButton;

