import { Copy, ExternalLink } from "lucide-react";
import React, { useState } from "react";
import QRCode from "react-qr-code";
import { TransactionAction } from "@/components/checkout/types/checkout";

interface Props {
  actions?: TransactionAction[];
}

const PaymentInstructions: React.FC<Props> = ({ actions = [] }) => {
  const [copied, setCopied] = useState(false);

  const va = actions.find(
    (a) => a.type === "PRESENT_TO_CUSTOMER" && a.descriptor === "VIRTUAL_ACCOUNT_NUMBER"
  );

  const pc = actions.find(
    (a) => a.type === "PRESENT_TO_CUSTOMER" && a.descriptor === "PAYMENT_CODE"
  );

  const qr = actions.find(
    (a) => a.type === "PRESENT_TO_CUSTOMER" && a.descriptor === "QR_STRING"
  );

  const rd = actions.find(
    (a) =>
      (a.type === "REDIRECT_CUSTOMER" || a.type === "REDIRECT") &&
      (a.descriptor === "WEB_URL" || a.descriptor === "DEEPLINK_URL")
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* VA / Payment Code */}
      {(va || pc) && (
        <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-primary-700/50 rounded-xl p-6 shadow-md">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-2 flex items-center flex-wrap gap-2">
            <span>{va ? "Virtual Account Number" : "Payment Code"}</span>
            <span className="bg-primary-500 text-white text-xs rounded px-2 py-0.5">
              {va ? "Virtual Account Number" : "Payment Code"}
            </span>
          </p>

          <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3">
            <span className="font-mono text-lg text-primary-600 dark:text-primary-400 flex-1 truncate">
              {(va || pc)!.value}
            </span>
            <button
              onClick={() => copyToClipboard((va || pc)!.value ?? "")}
              className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition ml-4 cursor-pointer"
              title="Copy to clipboard"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>

          {copied && (
            <p className="text-green-600 dark:text-green-400 text-xs mt-2 flex items-center space-x-1">
              ✓ <span>Copied to clipboard</span>
            </p>
          )}
        </div>
      )}

      {/* QR Code */}
      {qr && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center shadow-md">
          <h3 className="text-gray-800 dark:text-white font-semibold mb-4">Scan QR untuk Bayar</h3>
          <div className="inline-block bg-white p-4 rounded-lg">
            <QRCode value={qr.value ?? ""} size={200} />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-4">Gunakan aplikasi e-wallet untuk scan QR ini.</p>
          <div className="mt-2 break-words text-xs text-primary-700 dark:text-primary-300 font-mono">
            {qr.value}
          </div>
        </div>
      )}

      {/* Redirect (e.g. ShopeePay, OVO) */}
      {rd && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-md">
          <h3 className="text-gray-800 dark:text-white font-semibold mb-3">
            Lanjutkan ke Aplikasi Pembayaran
          </h3>
          <a
            href={rd.value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            {rd.descriptor === "DEEPLINK_URL" ? "Buka Aplikasi" : "Lanjutkan"}
            <ExternalLink className="w-4 h-4" />
          </a>
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">
            Jika tidak terbuka otomatis, klik tombol di atas.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentInstructions;
