"use client";

import React from "react";
import Image from "next/image";
import { Gamepad2, Loader2, Trash2 } from "lucide-react";
import { CartItem } from "@/components/checkout/types/checkout";

interface ProductInfoProps {
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdate: (target: string, id: string) => void;
  removingId: string | null;
  isLoadingCartUpdate: boolean;
}

function ProductInfo({
  items,
  onRemove,
  onUpdate,
  removingId,
  isLoadingCartUpdate,
}: ProductInfoProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editedTarget, setEditedTarget] = React.useState<string>("");

  return (
    <div className=" pt-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <Gamepad2 className="h-5 w-5 mr-2 text-green-500" />
        Game Account Information
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
        Please provide your game account details for top-up delivery
      </p>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-300 dark:border-gray-600"
          >
            <div className="flex items-center mb-3">
              <Image
                src={item.image}
                alt={item.name}
                width={48}
                height={48}
                className="w-12 h-12 object-cover rounded-lg mr-3"
              />
              <div>
                <h4 className="text-gray-800 dark:text-white font-medium">{item.name}</h4>
                <span className="text-primary-500 text-xs uppercase tracking-wide">
                  {item.packages.name}
                </span>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Quantity: {item.quantity}</p>
              </div>
            </div>
            <div className="space-y-4">
              {item.packages.items.map((entry, idx) => {
                const isEditing = editingId === entry.id;

                return (
                  <div key={idx} className="p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Game Account ID / Username
                      </label>
                      <span className="text-xs bg-primary-500 text-center text-white px-2 py-0.5 rounded-full">
                        {entry.quantity}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={isEditing ? editedTarget : entry.target}
                        onChange={(e) => setEditedTarget(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && isEditing) {
                            e.preventDefault();
                            onUpdate(editedTarget, entry.id);
                            setEditingId(null);
                          }
                        }}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100 disabled:dark:bg-gray-700"
                        placeholder="Enter your game account ID or username"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          if (isEditing) {
                            onUpdate(editedTarget, entry.id);
                            // Do not mutate props; rely on upstream update
                            setEditingId(null);
                          } else {
                            setEditingId(entry.id);
                            setEditedTarget(entry.target);
                          }
                        }}
                        className={`px-3 py-2 cursor-pointer rounded-md text-white transition ${
                          isLoadingCartUpdate && isEditing
                            ? "hover:bg-blue-600 bg-blue-500"
                            : isEditing
                            ? "hover:bg-green-600 bg-green-500"
                            : "hover:bg-yellow-600 bg-yellow-500"
                        }`}
                        disabled={isLoadingCartUpdate && isEditing}
                        aria-disabled={isLoadingCartUpdate && isEditing}
                      >
                        {isLoadingCartUpdate && editingId === entry.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-500 dark:text-red-400" />
                        ) : isEditing ? (
                          <>Apply</>
                        ) : (
                          <>Edit</>
                        )}
                      </button>

                      <button
                        onClick={() => onRemove(entry.id)}
                        disabled={removingId === entry.id}
                        className="border cursor-pointer border-gray-300 dark:border-gray-600 rounded-md p-2 text-black dark:text-white hover:text-red-500 dark:hover:text-red-400 bg-gray-200 dark:bg-gray-700 hover:bg-gray-200/50 hover:dark:bg-gray-700/50 transition-transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Remove package ${entry.target}`}
                      >
                        {removingId === entry.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-500 dark:text-red-400" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(ProductInfo);
