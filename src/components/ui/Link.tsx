"use client";

import React, { useCallback } from "react";
import NextLink from "next/link";
import { useLoader } from "@/contexts/LoaderContext";
import { useRouter, usePathname } from "next/navigation";
import { normalizePath } from "@/lib/router/normalizePath";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  className?: string;
  children: React.ReactNode;
  onNavigateStart?: () => void;
  onNavigateEnd?: () => void;
}

export default function Link({
  href,
  className = "",
  children,
  onNavigateStart,
  onNavigateEnd,
  ...rest
}: LinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { showLoader } = useLoader();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (rest.onClick) rest.onClick(e);
      if (e.defaultPrevented) return;

      // Panggil callback sebelum navigasi
      if (onNavigateStart) onNavigateStart();

      // Allow open new tab / window
      if (
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
        e.button === 1
      ) {
        return; // biarkan default
      }

      // Cek apakah external link
      if (/^https?:\/\//i.test(href) && !href.startsWith(window.location.origin)) {
        return;
      }

      e.preventDefault();

      // Sama halaman? (normalize)
      if (normalizePath(pathname) === normalizePath(href)) {
        if (onNavigateEnd) onNavigateEnd();
        return;
      }

      showLoader();

      // Router push dengan callback onNavigateEnd
      router.push(href);
      if (onNavigateEnd) onNavigateEnd();
    },
    [pathname, href, rest, onNavigateStart, onNavigateEnd, showLoader, router]
  );

  return (
    <NextLink href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </NextLink>
  );
}
