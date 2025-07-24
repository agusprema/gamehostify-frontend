'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  Gamepad2,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Link from "@/components/ui/Link";
import ThemeSwitcher from '../ui/ThemeSwitcher';

interface HeaderProps {
  onCartClick: () => void;
}

const app_name = process.env.NEXT_PUBLIC_APP_NAME || 'GameVault';

export default function Header({ onCartClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const currentPage = pathname;
  const { quantity } = useCart();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Game Top-up', path: '/game-topup' },
    { label: 'Pulsa & Data', path: '/pulsa-data' },
    { label: 'Langganan', path: '/langganan' },
    { label: 'Check Invoice', path: '/invoice' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-primary-500/20 shadow-lg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href='/'
            className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
          >
            <div className="bg-gradient-to-r from-primary-400 to-primary-700 p-2 rounded-lg shadow-primary-600/40 shadow-md">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              {app_name}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map(({ label, path }) => {
              const active = currentPage === path;
              return (
                <Link
                  key={path}
                  href={path}
                  className={`relative flex items-center gap-1 font-medium transition cursor-pointer ${
                    active
                      ? 'text-primary-500 after:w-full'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-400 after:w-0 hover:after:w-full'
                  } after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-primary-400 after:to-accent-600 after:transition-all after:duration-300`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Search + Cart + Theme + Menu */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg px-3 py-1.5 border border-gray-300 dark:border-gray-700 focus-within:border-primary-500 transition-all">
              <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-gray-900 dark:text-white text-sm w-36 focus:w-56 transition-all duration-300 outline-none"
              />
            </div>

            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-primary-500 transition cursor-pointer"
            >
              <ShoppingCart className="h-6 w-6" />
              {quantity > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-primary-400 to-primary-600 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                  {quantity}
                </span>
              )}
            </button>

            {/* ThemeSwitcher Desktop */}
            <div className="hidden md:block">
              <ThemeSwitcher />
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-primary-500 transition"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden animate-slideDown py-4 border-t border-gray-300 dark:border-gray-700">
            <nav className="flex flex-col space-y-3">
              {navItems.map(({ label, path }) => (
                <Link
                  key={path}
                  href={path}
                  className={`flex items-center gap-2 px-2 py-2 rounded-md transition ${
                    currentPage === path
                      ? 'bg-primary-600/20 text-primary-500'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* ThemeSwitcher Mobile */}
            <div className="mt-4 px-2">
              <ThemeSwitcher />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
