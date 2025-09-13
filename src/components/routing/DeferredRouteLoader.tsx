"use client";

import dynamic from "next/dynamic";

const RouteLoader = dynamic(() => import("@/components/routing/RouteLoader"), {
  ssr: false,
});

export default function DeferredRouteLoader() {
  return <RouteLoader />;
}

