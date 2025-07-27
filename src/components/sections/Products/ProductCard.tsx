'use client';

import React from 'react';
import { ShoppingCart, Star, Gamepad2, Server, Cloud } from 'lucide-react';
import Image from "next/image";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  badge?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

import { useCallback } from 'react';

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const categoryIconMap: Record<string, React.ReactNode> = {
    'Game Top-up': <Gamepad2 className="h-4 w-4" aria-hidden="true" />,
    'Shared Hosting': <Server className="h-4 w-4" aria-hidden="true" />,
    'VPS Server': <Cloud className="h-4 w-4" aria-hidden="true" />,
  };

  const categoryColorMap: Record<string, string> = {
    'Game Top-up': 'from-green-400 to-emerald-500',
    'Shared Hosting': 'from-blue-400 to-sky-500',
    'VPS Server': 'from-orange-400 to-amber-500',
  };

  const icon = categoryIconMap[product.category] ?? null;
  const gradient = categoryColorMap[product.category] ?? 'from-primary-400 to-primary-600';

  const handleAddToCart = useCallback(() => {
    onAddToCart(product);
  }, [onAddToCart, product]);

  return (
    <article className="
      group relative rounded-2xl overflow-hidden
      bg-white/80 dark:bg-gray-900/60 backdrop-blur-lg
      border border-gray-200 dark:border-gray-700
      hover:border-primary-400/50 dark:hover:border-primary-500/50
      transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary-400/20
    " aria-label={product.name}>
      {/* Image Section */}
      <div className="relative">
        <Image
          src={product.image}
          alt={`Gambar produk ${product.name}`}
          width={200}
          height={200}
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
          priority
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Badges */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {product.badge && (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-md" aria-label={product.badge}>
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-600 text-white shadow-md" aria-label={`Diskon ${discount}%`}>
            -{discount}%
          </span>
        )}
      </div>

      {/* Category Pill */}
      <div className="absolute top-4 right-4">
        <span
          className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${gradient} text-white shadow-md`}
          aria-label={`Kategori ${product.category}`}
        >
          {icon}
          <span>{product.category}</span>
        </span>
      </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <header>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
            {product.name}
          </h3>
        </header>

        {/* Rating */}
        <div className="flex items-center mb-4" aria-label={`Rating ${product.rating} dari 5`}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(product.rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
              aria-hidden="true"
            />
          ))}
          <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="mb-4" aria-live="polite">
          <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="ml-2 text-gray-400 line-through text-sm">
              ${product.originalPrice}
            </span>
          )}
        </div>

        {/* Info */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          {product.category === 'Game Top-up' && 'Instant delivery  Auto top-up  Secure payment'}
          {product.category === 'Shared Hosting' && 'Free SSL  99.9% uptime  24/7 support'}
          {product.category === 'VPS Server' && 'Full root access  SSD storage  Scalable'}
        </p>

        {/* Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="
            w-full py-3 rounded-lg font-semibold text-white
            bg-gradient-to-r from-primary-500 to-primary-600
            hover:from-primary-600 hover:to-primary-700
            shadow-md hover:shadow-primary-500/40
            transition-all duration-300 transform hover:scale-105
            flex items-center justify-center gap-2
          "
          aria-label={`Tambahkan ${product.name} ke keranjang`}
        >
          <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          {product.category === 'Game Top-up' ? 'Top-up Now' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}
