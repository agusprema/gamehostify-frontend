"use client";

import dynamic from "next/dynamic";

const RouteResetter = dynamic(() => import("@/components/routing/RouteResetter"), {
  ssr: false,
});

export default function DeferredRouteResetter() {
  return <RouteResetter />;
}

