"use client";
import React, { useMemo } from "react";

interface CartSkeletonProps {
  count?: number;
}

export default React.memo(function CartSkeleton({ count = 3 }: CartSkeletonProps) {
  const skeletons = useMemo(
    () =>
      [...Array(count)].map((_, i) => (
        <div
          key={i}
          className="
            rounded-xl 
            border border-gray-300 dark:border-gray-700/50 
            bg-gray-200 dark:bg-gray-800/40 
            h-28 animate-pulse
            shadow-sm
          "
        />
      )),
    [count]
  );

  return <>{skeletons}</>;
});
