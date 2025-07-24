"use client";

import React from "react";
import { CreditCard } from "lucide-react";
import PaymentChannelCard from "@/components/checkout/payment/PaymentChannelCard";
import ChannelExtraFields from "@/components/checkout/payment/ChannelExtraFields";
import { PaymentMethodsMap } from "@/components/checkout/types/checkout";

interface PaymentMethodProps {
  paymentMethods: PaymentMethodsMap;
  selectedChannel: string;
  setSelectedMethod: (method: string) => void;
  setSelectedChannel: (channel: string) => void;
  channelProperties: Record<string, unknown>;
  handleChannelPropertyChange: (key: string, value: string) => void;
  total: number;
  onBack: () => void;
  onSubmitPayment: () => void;
  serverErrors?: Record<string, string>;
  isPaying?: boolean;
  xenditMessage?: string;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({
  paymentMethods,
  selectedChannel,
  setSelectedMethod,
  setSelectedChannel,
  channelProperties,
  handleChannelPropertyChange,
  total,
  onBack,
  onSubmitPayment,
  serverErrors = {},
}) => {
  const [channelValid, setChannelValid] = React.useState(true);

  const channelError =
    serverErrors["channel_code"] ||
    Object.keys(serverErrors).find((key) => key.startsWith("channel_properties"))
      ? "Please check channel details"
      : "";

  return (
    <div className="bg-white dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <CreditCard className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
        Payment Method
      </h2>

      <div className="space-y-4 my-4">
        {Object.entries(paymentMethods).map(([category, channels]) => (
          <div key={category}>
            <h3 className="text-gray-800 dark:text-white font-semibold text-sm mb-3 uppercase tracking-wider">
              {category.replace("_", " ")}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {channels.map((channel) => {
                const isSelected = selectedChannel === channel.code;
                return (
                  <div key={channel.code} className="relative">
                    <PaymentChannelCard
                      channel={channel}
                      category={category}
                      total={total}
                      selectedChannel={selectedChannel}
                      onSelect={(channelCode, selectedCategory) => {
                        setSelectedChannel(channelCode);
                        setSelectedMethod(selectedCategory);
                      }}
                    />
                    {isSelected && serverErrors["channel_code"] && (
                      <p className="absolute -bottom-5 left-0 text-xs text-red-500">
                        {serverErrors["channel_code"]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <ChannelExtraFields
        selectedChannel={selectedChannel}
        channelProperties={channelProperties}
        handleChannelPropertyChange={handleChannelPropertyChange}
        onValidityChange={(isValid) => setChannelValid(isValid)}
      />

      {channelError && (
        <p className="mt-2 text-xs text-red-500">{channelError}</p>
      )}

      <div className="flex space-x-4 mt-8">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer flex-1 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-300 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmitPayment}
          disabled={!channelValid || !!channelError}
          className="cursor-pointer flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Complete Payment
        </button>
      </div>
    </div>
  );
};

export default PaymentMethod;
