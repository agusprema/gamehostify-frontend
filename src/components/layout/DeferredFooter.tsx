"use client";

import dynamic from "next/dynamic";

const Footer = dynamic(() => import("@/components/layout/Footer"), {
  ssr: false,
});

export default function DeferredFooter() {
  return <Footer />;
}

