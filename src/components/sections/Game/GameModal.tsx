"use client";

import * as React from "react";
import { Package, User, Zap, Shield, X } from "lucide-react";
import FormError from "@/components/ui/FormError";
import Image from "next/image";
import Modal from "@/components/ui/Modal";

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

export interface GameModalProps {
  game: Game | null;
  onClose: () => void;
  onSelectPackage: (pkg: GamePackage) => void;
  selectedPackage: GamePackage | null;
  gameAccount: string;
  setGameAccount: (value: string) => void;
  onTopUp: () => void;
  isProcessing: boolean;
  formError: Record<string, string[]>;
}

const GameModal: React.FC<GameModalProps> = ({
  formError,
  game,
  onClose,
  onSelectPackage,
  selectedPackage,
  gameAccount,
  setGameAccount,
  onTopUp,
  isProcessing,
}) => {
  if (!game) return null;

  return (
    <Modal
      isOpen={!!game}
      onClose={onClose}
      containerClassName="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-gray-200 dark:border-gray-700"
    >
      <>
        {/* Header */}
        <div
          className="
            flex items-center justify-between p-5 border-b
            bg-gray-100 border-gray-200
            dark:bg-gray-800 dark:border-gray-700
          "
        >
          <div className="flex items-center gap-4">
            <Image
              src={game.logo}
              alt={game.name}
              width={200}
              height={200}
              className="w-14 h-14 rounded-lg object-cover"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{game.name}</h2>
              <span className="text-primary-600 dark:text-primary-400 text-sm">{game.category}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition cursor-pointer"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-6 p-5 custom-scrollbar">
          {/* Package List */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
              Pilih Paket
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2 pt-2">
              {game.packages.map((pkg) => {
                const discount =
                  pkg.original_price && pkg.original_price > pkg.final_price
                    ? Math.round(((pkg.original_price - pkg.final_price) / pkg.original_price) * 100)
                    : 0;
                const isSel = selectedPackage?.id === pkg.id;

                return (
                  <button
                    type="button"
                    key={pkg.id}
                    onClick={() => onSelectPackage(pkg)}
                    className={`
                      relative w-full text-left p-4 rounded-xl border transition-all cursor-pointer
                      ${
                        isSel
                          ? "border-primary-500 bg-gray-100 dark:bg-gray-800 shadow-md"
                          : "border-gray-300 bg-gray-50 hover:border-primary-400 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-primary-400/40"
                      }
                    `}
                  >
                    {pkg.is_popular && (
                      <span className="absolute -top-2 left-3 bg-primary-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        Popular
                      </span>
                    )}
                    {pkg.has_discount && (
                      <span className="absolute -top-2 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        -{discount}%
                      </span>
                    )}
                    <div className="text-center space-y-2">
                      <h4 className="text-gray-900 dark:text-white font-bold">{pkg.amount}</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{pkg.name}</p>
                      <div className="flex justify-center gap-2">
                        <span className="text-primary-600 dark:text-primary-400 font-bold">
                          Rp {pkg.final_price.toLocaleString()}
                        </span>
                        {pkg.original_price && pkg.has_discount && (
                          <span className="text-gray-400 line-through text-xs">
                            Rp {pkg.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {pkg.metadata?.bonus && (
                        <p className="text-green-500 dark:text-green-400 text-xs font-medium">
                          + {pkg.metadata.bonus} Bonus
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
              {game.label}
            </h3>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder={game.placeholder}
                  value={gameAccount}
                  onChange={(e) => setGameAccount(e.target.value)}
                  className="w-full p-3 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Zap className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
              {formError.account && <FormError errors={formError.account} />}

              <button
                onClick={onTopUp}
                disabled={!selectedPackage || !gameAccount.trim() || isProcessing}
                className="w-full py-3 rounded-lg font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Shield className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Add to Cart"
                )}
              </button>
            </div>
          </div>
        </div>
      </>
    </Modal>
  );
};

export default GameModal;

