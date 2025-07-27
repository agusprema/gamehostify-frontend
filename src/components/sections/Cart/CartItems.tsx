"use client";
import React, { useMemo, useRef, useState, useLayoutEffect, RefObject } from "react";
import CartItem from "./CartItem";
import type { BaseCartItem } from "./types";

interface CartItemsProps {
  items?: BaseCartItem[];
  removingId: string | null;
  onRemove: (id: string) => void;
}

const emptyArray: BaseCartItem[] = [];
const VIRTUALIZE_THRESHOLD = 20;
const EST_ROW_HEIGHT = 160;

export default React.memo(function CartItems({
  items = emptyArray,
  removingId,
  onRemove,
}: CartItemsProps) {
  const containerRef = useRef<HTMLUListElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(0);

  const useVirtual = items.length > VIRTUALIZE_THRESHOLD;

  useLayoutEffect(() => {
    if (!useVirtual) return;
    const el = containerRef.current?.parentElement;
    if (!el) return;

    const onScroll = () => setScrollTop(el.scrollTop);
    const onResize = () => setHeight(el.clientHeight);

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    onResize();
    onScroll();
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [useVirtual]);

  const { start, end, padTop, padBottom } = useMemo(() => {
    if (!useVirtual) return { start: 0, end: items.length, padTop: 0, padBottom: 0 };
    const visible = Math.ceil(height / EST_ROW_HEIGHT) + 4;
    const start = Math.max(0, Math.floor(scrollTop / EST_ROW_HEIGHT) - 2);
    const end = Math.min(items.length, start + visible);
    return {
      start,
      end,
      padTop: start * EST_ROW_HEIGHT,
      padBottom: (items.length - end) * EST_ROW_HEIGHT,
    };
  }, [useVirtual, height, scrollTop, items.length]);

  const slice = useMemo(() => items.slice(start, end), [items, start, end]);

  const renderItems = useMemo(() => {
    if (!items.length) return <p className="text-gray-400 text-sm">Keranjang kosong.</p>;
    const list = useVirtual ? slice : items;

    return list.map((item, idx) => {
      // Ambil id dari package pertama (fallback ke index jika tidak ada)
      const mainId = item.packages?.items?.[0]?.id ?? `item-${idx}`;
      return (
        <CartItem
          key={mainId}
          item={item}
          removing={removingId}
          onRemove={onRemove}
        />
      );
    });
  }, [items, slice, useVirtual, removingId, onRemove]);

  return (
    <ul ref={containerRef} className="flex flex-col gap-5" aria-label="Cart Items">
      {useVirtual && padTop > 0 && <li style={{ height: padTop }} />}
      {renderItems}
      {useVirtual && padBottom > 0 && <li style={{ height: padBottom }} />}
    </ul>
  );
});
