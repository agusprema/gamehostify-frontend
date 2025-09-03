"use client";

import React from "react";
import { PaymentChannel } from "@/components/checkout/types/checkout";
import Image from "next/image";

interface PaymentChannelCardProps {
  channel: PaymentChannel;
  category: string;
  total: number;
  selectedChannel: string;
  onSelect: (channelCode: string, category: string) => void;
}

const PaymentChannelCard: React.FC<PaymentChannelCardProps> = ({
  channel,
  category,
  total,
  selectedChannel,
  onSelect,
}) => {
  const isSelected = selectedChannel === channel.code;
  const feeValue = Number(channel.fee_value);

  const totalWithFee =
    channel.fee_type === "fixed"
      ? total + feeValue
      : total + (total * feeValue) / 100;

  const formatRupiah = (value: number) =>
    `Rp${value.toLocaleString("id-ID")}`;

  return (
    <div
      className={`border-2 rounded-lg p-3 cursor-pointer flex items-center space-x-3 transition-all shadow-sm
        ${
          isSelected
            ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10"
            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
        }
        bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700
      `}
      onClick={() => onSelect(channel.code, category)}
    >
      <Image
        src={`${process.env.BACKEND_API_BASE_URL}storage/${channel.logo}`}
        alt={channel.name}
        width={48}
        height={48}
        className="w-8 h-8 object-contain rounded"
      />
      <div>
        <p className="text-gray-900 dark:text-white text-sm font-medium">
          {channel.name}
        </p>
        <p className="text-gray-600 dark:text-gray-300 text-xs">
          Total: {formatRupiah(totalWithFee)}{" "}
          {channel.fee_type === "fixed"
            ? `(+${formatRupiah(feeValue)})`
            : `(+${channel.fee_value}%)`}
        </p>
      </div>
    </div>
  );
};

export default PaymentChannelCard;
