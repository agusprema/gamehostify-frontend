"use client";

import * as React from "react";
import {
  Gamepad2,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Shield,
  Zap,
  Lock,
  Send,
} from "lucide-react";
import Link from "@/components/ui/Link";

const Footer = () => {
  const [subEmail, setSubEmail] = React.useState("");
  const [subscribed, setSubscribed] = React.useState<"idle" | "ok" | "error">("idle");
  const currentYear = new Date().getFullYear();
  const appName = process.env.NEXT_PUBLIC_APP_NAME;
  const appSlogan = process.env.NEXT_PUBLIC_SLOGAN;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail.trim()) return;
    setSubscribed("ok");
    setTimeout(() => setSubscribed("idle"), 3000);
    setSubEmail("");
  };

  const socials = [
    { icon: Facebook, label: "Facebook", href: "#" },
    { icon: Twitter, label: "Twitter / X", href: "#" },
    { icon: Instagram, label: "Instagram", href: "#" },
    { icon: Youtube, label: "YouTube", href: "#" },
  ];

  const productLinks = [
    { name: "Game Top-up", href: "/game-topup" },
    { name: "Mobile Legends", href: "/mobile-legends" },
    { name: "Free Fire", href: "/free-fire" },
    { name: "PUBG Mobile", href: "/pubg-mobile" },
    { name: "Pulsa & Data", href: "/pulsa-data" },
    { name: "Langganan", href: "/langganan" },
  ];

  const supportLinks = [
    { name: "Help Center", href: "/help-center" },
    { name: "Contact Us", href: "/contact" },
    { name: "Order Status", href: "/order-status" },
    { name: "Refund Policy", href: "/refund-policy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-950 dark:via-black dark:to-black border-t border-gray-200 dark:border-gray-800/60">
      {/* Accent glow strip */}
      <div className="absolute -top-px left-0 w-full h-[2px] bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 blur-[1px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary-500 to-primary-700 p-2 rounded-lg shadow-md shadow-primary-500/30">
                <Gamepad2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                {appName}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm text-sm leading-relaxed">
              {appSlogan}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  aria-label={label}
                  className="group relative inline-flex h-9 w-9 items-center justify-center
                  rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/40
                  text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-white hover:border-primary-400/60
                  hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-all duration-200"
                >
                  <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          {/* Produk */}
          <div>
            <h3 className="text-gray-800 dark:text-white font-semibold mb-4 text-sm tracking-wide uppercase">Produk</h3>
            <ul className="space-y-2">
              {productLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="relative inline-block text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm
                    after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-primary-400
                    hover:after:w-full after:transition-all after:duration-300"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-gray-800 dark:text-white font-semibold mb-4 text-sm tracking-wide uppercase">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="relative inline-block text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm
                    after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-primary-400
                    hover:after:w-full after:transition-all after:duration-300"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-gray-800 dark:text-white font-semibold mb-4 text-sm tracking-wide uppercase">Newsletter</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Dapatkan info promo, event & top deal langsung ke email kamu.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-700 focus-within:border-primary-500 bg-gray-100 dark:bg-gray-800/50 overflow-hidden">
                <input
                  type="email"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  placeholder="Email kamu"
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-800 dark:text-white placeholder:text-gray-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-1 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Kirim</span>
                </button>
              </div>
              {subscribed === "ok" && (
                <p className="text-xs text-green-500 dark:text-green-400">Terima kasih! Cek email kamu.</p>
              )}
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-16 border-t border-gray-200 dark:border-gray-800/60 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center md:text-left">
              © {currentYear} {appName}. All rights reserved.
            </p>
            <ul className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-green-500 dark:text-green-400" /> Instan
              </li>
              <li className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-blue-500 dark:text-blue-400" /> Aman
              </li>
              <li className="flex items-center gap-1">
                <Lock className="h-4 w-4 text-primary-500 dark:text-primary-400" /> SSL Encrypted
              </li>
            </ul>
          </div>

          {/* Contact strip */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-primary-500 dark:text-primary-400" /> support@gamevault.com
            </span>
            <span className="inline-flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-primary-500 dark:text-primary-400" /> +1 (555) 123-4567
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary-500 dark:text-primary-400" /> 123 Gaming St, Digital City
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
