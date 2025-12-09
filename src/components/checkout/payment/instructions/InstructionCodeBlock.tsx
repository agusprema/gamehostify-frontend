import React, { useState } from "react";
import { Copy } from "lucide-react";

interface Props {
  label: string;
  value: string;
}

const InstructionCodeBlock: React.FC<Props> = ({ label, value }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-primary-700/50 rounded-xl p-6 shadow-md">
      <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-2 flex items-center flex-wrap gap-2">
        <span>{label}</span>
        <span className="bg-primary-500 text-white text-xs rounded px-2 py-0.5">{label}</span>
      </p>

      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3">
        <span className="font-mono text-lg text-primary-600 dark:text-primary-400 flex-1 truncate">{value}</span>
        <button
          onClick={() => copyToClipboard(value ?? "")}
          className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition ml-4 cursor-pointer"
          title="Copy to clipboard"
        >
          <Copy className="w-5 h-5" />
        </button>
      </div>

      {copied && (
        <p className="text-green-600 dark:text-green-400 text-xs mt-2 flex items-center space-x-1">✓ <span>Copied to clipboard</span></p>
      )}
    </div>
  );
};

export default InstructionCodeBlock;

