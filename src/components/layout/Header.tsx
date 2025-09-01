'use client';
import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  ShoppingCart,
  Menu,
  X,
  Gamepad2,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Link from "@/components/ui/Link";
import ThemeSwitcher from '../ui/ThemeSwitcher';
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onCartClick: () => void;
}

const app_name = process.env.NEXT_PUBLIC_APP_NAME || 'GameVault';

export default function Header({ onCartClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProdukOpen, setIsProdukOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const produkDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProdukOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        produkDropdownRef.current &&
        !produkDropdownRef.current.contains(e.target as Node)
      ) {
        setIsProdukOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProdukOpen]);
  useEffect(() => {
    if (!isUserMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);
  const pathname = usePathname();
  const currentPage = pathname;
  const { quantity } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Top-up', path: '/game-topup' },
    { label: 'Pulsa & Data', path: '/pulsa-data' },
    { label: 'Hiburan', path: '/hiburan' },
    { label: 'Check Invoice', path: '/invoice' },
  ];

  // const produkDropdown = [
  //   { label: 'Game Top-up', path: '/game-topup', icon: <Gamepad2 className="h-4 w-4 text-primary-500" /> },
  //   { label: 'Pulsa & Data', path: '/pulsa-data', icon: <CreditCard className="h-4 w-4 text-blue-500" /> },
  //   { label: 'Langganan', path: '/langganan', icon: <Tv className="h-4 w-4 text-green-500" /> },
  //   { label: 'Hiburan', path: '/hiburan', icon: <Gamepad2 className="h-4 w-4 text-primary-500" /> },
  //   { label: 'PLN', path: '/pln', icon: <Zap className="h-4 w-4 text-yellow-500" /> },
  //   { label: 'E-Money', path: '/e-money', icon: <CreditCard className="h-4 w-4 text-blue-500" /> },
  //   { label: 'E-Toll', path: '/etoll', icon: <Wallet className="h-4 w-4 text-pink-500" /> },
  //   // Tambahkan kategori lain sesuai kebutuhan
  // ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-primary-500/20 shadow-lg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Nav kiri + Logo */}
          <div className="flex items-center gap-8">
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
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map(({ label, path }) => {
                const active = currentPage === path;
                return (
                  <Link
                    key={path}
                    href={path}
                    onNavigateEnd={() => setIsProdukOpen(false)}
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
              {/* Dropdown Produk */}
              {/* <div className="hidden md:flex items-center">
                <div className="relative group" ref={produkDropdownRef}>
                  <div className="relative">
                    <button
                      className={`group relative flex items-center gap-2 px-3 py-2 rounded-md
                        ${isProdukOpen ? 'text-primary-500 after:w-full' : 'cursor-pointer text-gray-700 dark:text-gray-300 hover:text-primary-400 after:w-0 hover:after:w-full'}`}
                      tabIndex={0}
                      aria-haspopup="true"
                      aria-expanded={isProdukOpen}
                      onClick={() => setIsProdukOpen((v) => !v)}
                    >
                      <span className="relative flex items-center">
                        Produk
                        <Menu className="h-4 w-4 text-primary-500 ml-2" />
                        <span
                          className={`absolute left-0 -bottom-1 h-0.5 rounded bg-gradient-to-r from-primary-400 to-accent-600 z-0 transition-all duration-300
                            ${isProdukOpen ? 'opacity-100 w-full' : 'opacity-0 w-0'}
                            group-hover:opacity-100 group-hover:w-full`}
                        />
                      </span>
                    </button>

                    <div
                      className={`absolute left-0 top-full min-w-[180px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg py-2 mt-2 z-50 transition-all duration-300
                        ${isProdukOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95 pointer-events-none'}
                      `}
                    >
                      {produkDropdown.map(({ label, path, icon }) => (
                        <Link
                          key={path}
                          href={path}
                          className={`relative flex items-center gap-2 px-4 py-2 text-sm rounded-md transition
                            ${currentPage === path
                              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-semibold shadow after:w-full'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400'}
                            after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-primary-400 after:to-accent-600 after:transition-all after:duration-300`}
                          onNavigateEnd={() => setIsProdukOpen(false)}
                        >
                          {icon}
                          <span className="relative">{label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {(() => {
                  const activeItem = produkDropdown.find(item => currentPage === item.path);
                  return activeItem ? (
                    <span className="ml-2 px-2 py-1 pb-2 rounded bg-primary-100 dark:bg-primary-600/20 text-primary-600 dark:text-primary-100 text-xs font-semibold shadow relative z-10">
                      {activeItem.label}
                    </span>
                  ) : null;
                })()}
              </div> */}

            </nav>
          </div>

          {/* Auth + Cart + Theme + Menu */}
          <div className="flex items-center gap-4">
            {/* Auth Actions */}
            <div className="hidden sm:flex items-center gap-2">
              {isAuthenticated ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    aria-haspopup="menu"
                    aria-expanded={isUserMenuOpen}
                  >
                    <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                      {(user?.name || 'U')[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[160px] truncate">
                      {user?.name}
                    </span>
                  </button>
                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-44 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1 z-50"
                      role="menu"
                    >
                      <Link
                        href="/profile"
                        onNavigateStart={() => setIsUserMenuOpen(false)}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        Profil
                      </Link>
                      <button
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await logout();
                        }}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-3 py-1.5 text-sm font-semibold rounded-md bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow hover:opacity-90 transition cursor-pointer"
                  >
                    Daftar
                  </Link>
                </>
              )}
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
              <div className="flex items-center gap-2 pt-2">
                {isAuthenticated ? (
                  <div className="flex w-full items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                      {(user?.name || 'U')[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{user?.name}</div>
                    </div>
                    <Link
                      href="/profile"
                      onNavigateStart={() => setIsMenuOpen(false)}
                      className="px-3 py-2 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Profil
                    </Link>
                    <button
                      onClick={async () => {
                        setIsMenuOpen(false);
                        await logout();
                      }}
                      className="px-3 py-2 text-xs font-semibold rounded-md bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow hover:opacity-90"
                    >
                      Keluar
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onNavigateStart={() => setIsMenuOpen(false)}
                      className="flex-1 text-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                      Masuk
                    </Link>
                    <Link
                      href="/auth/register"
                      onNavigateStart={() => setIsMenuOpen(false)}
                      className="flex-1 text-center px-3 py-2 text-sm font-semibold rounded-md bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow hover:opacity-90 transition cursor-pointer"
                    >
                      Daftar
                    </Link>
                  </>
                )}
              </div>
              {/* Dropdown Produk di mobile */}
              {/* <div className="mt-2">
                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 px-2">Produk</span>
                <div className="flex flex-col gap-1">
                  {produkDropdown.map(({ label, path, icon }) => (
                    <Link
                      key={path}
                      href={path}
                      onNavigateStart={() => {
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition
                        ${currentPage === path
                          ? 'bg-primary-100 dark:bg-primary-700/30 text-primary-600 dark:text-primary-400 font-semibold shadow'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400'}
                      `}
                    >
                      {icon}
                      {label}
                    </Link>
                  ))}
                </div>
              </div> */}
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
