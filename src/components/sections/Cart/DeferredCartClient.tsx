"use client";

import dynamic from "next/dynamic";

const CartClient = dynamic(() => import("@/components/sections/Cart/CartClient"), {
  ssr: false,
});

export default function DeferredCartClient() {
  return <CartClient />;
}

