"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, User, Zap, Shield, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { setFieldErrors } from "@/utils/rhf/setFieldErrors";
import FormError from "@/components/ui/FormError";
import Image from "next/image";

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
  const { setError, setValue, formState: { errors } } = useForm<{ target: string }>({
    defaultValues: { target: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Sync parent state into RHF and apply server errors
  React.useEffect(() => {
    setValue("target", gameAccount, { shouldDirty: true, shouldValidate: true });
  }, [gameAccount, setValue]);

  React.useEffect(() => {
    if (formError) {
      setFieldErrors(setError as any, formError as any, ["target"] as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formError]);
  React.useEffect(() => {
    if (game) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [game]);

  return (
    <AnimatePresence>
      {game && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 z-40 dark:bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          >
            <div
              className="
                w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-lg
                bg-white border-gray-200 
                dark:bg-gray-900 dark:border-gray-700
              "
              onClick={(e) => e.stopPropagation()}
            >
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

                  <input
                    type="text"
                    value={gameAccount}
                    onChange={(e) => setGameAccount(e.target.value)}
                    placeholder={game.placeholder}
                    className="
                      w-full rounded-lg px-4 py-3
                      border border-gray-300 bg-gray-100 text-gray-900
                      focus:border-primary-500 focus:outline-none
                      dark:border-gray-600 dark:bg-gray-700 dark:text-white
                    "
                  />
                  <FormError messages={(errors.target?.message ? [String(errors.target.message)] : formError.target) ?? []} />

                  {selectedPackage && (
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mt-4 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-500 dark:text-gray-400">
                        <span>Game:</span>
                        <span className="text-gray-900 dark:text-white">{game.name}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 dark:text-gray-400">
                        <span>Paket:</span>
                        <span className="text-gray-900 dark:text-white">{selectedPackage.name}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 dark:text-gray-400">
                        <span>Total:</span>
                        <span className="text-primary-600 dark:text-primary-400 font-bold">
                          Rp {selectedPackage.final_price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={onTopUp}
                    disabled={!selectedPackage || !gameAccount || isProcessing}
                    className="
                      w-full mt-6 py-3 rounded-lg font-semibold text-white
                      bg-primary-600 hover:bg-primary-700
                      transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                    "
                  >
                    {isProcessing ? "Processing..." : "Add to Cart"}
                  </button>

                  <div className="flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-4">
                    <Zap className="h-3 w-3 text-green-500 dark:text-green-400" /> Instan
                    <Shield className="h-3 w-3 text-blue-500 dark:text-blue-400" /> Aman
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GameModal;
