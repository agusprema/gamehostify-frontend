'use client';
import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  ShoppingCart,
  Menu,
  X,
  Gamepad2,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Link from "@/components/ui/Link";
import ThemeSwitcher from '../ui/ThemeSwitcher';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { openCart } from '@/components/sections/Cart/CartClient';
import Image from 'next/image';

const app_name = process.env.NEXT_PUBLIC_APP_NAME || 'GameVault';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProdukOpen, setIsProdukOpen] = useState(false);
  const produkDropdownRef = useRef<HTMLDivElement>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    function onDocClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isUserMenuOpen]);

  const pathname = usePathname();
  const currentPage = pathname;
  const { quantity } = useCart();
  const { authenticated, user, loading, refresh } = useAuthStatus();
  const userDisplayName = user?.name || user?.email || 'Akun';

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Top-up', path: '/game-topup' },
    { label: 'Pulsa & Data', path: '/pulsa-data' },
    { label: 'Hiburan', path: '/hiburan' },
    { label: 'Check Invoice', path: '/invoice' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="relative w-full">
        <div className="relative border border-white/60 bg-white/75 shadow-[0_25px_60px_-25px_rgba(79,70,229,0.55)] backdrop-blur-2xl transition-colors duration-300 dark:border-white/10 dark:bg-gray-950/70">
          <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="group relative flex items-center gap-3"
              >
                <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/40 transition-transform duration-300 group-hover:scale-105">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-2xl border border-white/40 opacity-60"
                  />
                  <Gamepad2 className="relative h-6 w-6" />
                </span>
                <span className="text-2xl font-semibold leading-none tracking-tight">
                  <span className="bg-gradient-to-r from-primary-300 via-primary-500 to-accent-500 bg-clip-text text-transparent transition-colors duration-300 group-hover:from-primary-200 group-hover:via-primary-400 group-hover:to-accent-400">
                    {app_name}
                  </span>
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-1 rounded-full border border-white/50 bg-white/70 px-1 py-1 text-sm font-medium shadow-inner dark:border-white/10 dark:bg-white/10">
                {navItems.map(({ label, path }) => {
                  const active = currentPage === path;
                  return (
                    <Link
                      key={path}
                      href={path}
                      onNavigateEnd={() => setIsProdukOpen(false)}
                      className={`group relative flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-primary-500 via-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30'
                          : 'text-gray-600 transition-colors dark:text-gray-300 hover:text-primary-600 dark:hover:text-white hover:bg-primary-500/10 dark:hover:bg-white/10'
                      }`}
                    >
                      <span className="relative">{label}</span>
                      {!active && (
                        <span className="pointer-events-none absolute inset-0 rounded-full border border-transparent transition-all duration-200 group-hover:border-primary-400/40 dark:group-hover:border-white/20" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {!loading && !authenticated && (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="rounded-full border border-primary-500/20 bg-white/70 px-4 py-2 text-sm font-semibold text-primary-600 transition-all duration-200 hover:border-primary-500/40 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:text-primary-200 dark:hover:bg-white/10"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-gradient-to-r from-primary-500 via-primary-500 to-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary-500/60"
                  >
                    Register
                  </Link>
                </div>
              )}
              {!loading && authenticated && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full border border-primary-500/20 bg-white/75 px-3 py-1.5 text-sm font-semibold text-gray-800 transition-all duration-200 hover:border-primary-500/40 hover:text-primary-600 hover:shadow-primary-500/20 dark:border-white/10 dark:bg-white/10 dark:text-gray-100 dark:hover:text-primary-200"
                  >
                    {user?.avatar ? (
                      <Image
                        src={user.avatar}
                        width={100}
                        height={100}
                        alt={`${userDisplayName} avatar`}
                        className="h-8 w-8 rounded-full border border-white/60 object-cover dark:border-white/20"
                        loading="lazy"
                      />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 shadow-inner shadow-primary-500/20 dark:bg-primary-600/20 dark:text-primary-200">
                        <UserIcon className="h-4 w-4" />
                      </span>
                    )}
                    <span className="max-w-[120px] truncate text-sm">{userDisplayName}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-white/60 bg-white/95 p-2 shadow-xl shadow-primary-500/20 backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/95 z-50">
                      <Link
                        href="/profile"
                        onNavigateStart={() => setIsUserMenuOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition-colors duration-200 hover:bg-primary-500/10 hover:text-primary-600 dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-white"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={async () => {
                          await logout();
                          setIsUserMenuOpen(false);
                          await refresh();
                          router.push('/login');
                        }}
                        className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-500 transition-colors duration-200 hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={openCart}
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-primary-500/25 bg-white/80 text-primary-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-500/50 hover:text-primary-500 hover:shadow-lg hover:shadow-primary-500/40 dark:border-white/10 dark:bg-white/10 dark:text-primary-200"
              >
                <ShoppingCart className="h-5 w-5" />
                {quantity > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-primary-400 to-accent-500 text-[10px] font-semibold text-white shadow-lg shadow-primary-500/50">
                    {quantity}
                  </span>
                )}
              </button>

              <div className="hidden md:block">
                <div className="rounded-full border border-white/50 bg-white/70 p-1 shadow-inner dark:border-white/10 dark:bg-white/10">
                  <ThemeSwitcher />
                </div>
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/80 text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:text-primary-500 dark:border-white/10 dark:bg-white/10 dark:text-gray-200"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden animate-slideDown border-t border-white/40 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/85">
              <div className="mx-auto w-full max-w-7xl px-4 pb-6 pt-4 sm:px-6 lg:px-8">
                <nav className="flex flex-col gap-2">
                  {navItems.map(({ label, path }) => (
                    <Link
                      key={path}
                      href={path}
                      onNavigateStart={() => setIsMenuOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                        currentPage === path
                          ? 'bg-gradient-to-r from-primary-500 via-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-primary-500/10 hover:text-primary-600 dark:hover:bg-white/10 dark:hover:text-white'
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                  {!loading && !authenticated && (
                    <div className="flex items-center gap-2">
                      <Link
                        href="/login"
                        onNavigateStart={() => setIsMenuOpen(false)}
                        className="flex-1 rounded-xl border border-primary-500/30 bg-white/80 px-3 py-2 text-center text-sm font-semibold text-primary-600 transition-all duration-200 hover:border-primary-500/50 hover:bg-white/95 dark:border-white/10 dark:bg-white/5 dark:text-primary-100 dark:hover:bg-white/10"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onNavigateStart={() => setIsMenuOpen(false)}
                        className="flex-1 rounded-xl bg-gradient-to-r from-primary-500 via-primary-500 to-accent-500 px-3 py-2 text-center text-sm font-semibold text-white shadow-lg shadow-primary-500/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary-500/60"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                  {!loading && authenticated && (
                    <div className="rounded-xl border border-white/40 bg-white/80 p-3 shadow-inner dark:border-white/10 dark:bg-white/5">
                      <Link
                        href="/profile"
                        onNavigateStart={() => setIsMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 transition-colors duration-200 hover:bg-primary-500/10 hover:text-primary-600 dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-white"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={async () => {
                          await logout();
                          setIsMenuOpen(false);
                          await refresh();
                          router.push('/login');
                        }}
                        className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-500 transition-colors duration-200 hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </nav>

                <div className="mt-4">
                  <div className="rounded-full border border-white/40 bg-white/70 p-1 shadow-inner dark:border-white/10 dark:bg-white/10">
                    <ThemeSwitcher />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
