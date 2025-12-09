import React from "react";
import QRCode from "react-qr-code";

interface Props {
  value: string;
}

const InstructionQRCode: React.FC<Props> = ({ value }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center shadow-md">
      <h3 className="text-gray-800 dark:text-white font-semibold mb-4">Scan QR untuk Bayar</h3>
      <div className="inline-block bg-white p-4 rounded-lg">
        <QRCode value={value ?? ""} size={200} />
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm mt-4">Gunakan aplikasi e-wallet untuk scan QR ini.</p>
      <div className="mt-2 break-words text-xs text-primary-700 dark:text-primary-300 font-mono">{value}</div>
    </div>
  );
};

export default InstructionQRCode;

