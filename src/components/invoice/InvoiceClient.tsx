"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Search, RefreshCw, ReceiptText } from "lucide-react";
import QRCode from "react-qr-code";
import Wrapper from "@/components/ui/Wrapper";
import InvoiceSkeleton from "./InvoiceSkeleton";
import { readableStatus, statusColor } from "./status";

interface InvoiceItem {
  package_name: string;
  product_name: string;
  quantity: number;
  status: string;
  delivered_at: string | null;
}

interface InvoiceAction {
  type: string;
  value: string;
  descriptor: string;
}

interface InvoiceData {
  invoice_id: string;
  reference_id: string;
  amount: number;
  payment_method: string;
  status: string;
  actions: InvoiceAction[];
  is_successful: boolean;
  paid_at: string | null;
  created_at: string;
  items: InvoiceItem[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

// Helper format rupiah
const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(val);

// Safe date format helper (avoid runtime errors on invalid date)
const fmtDateTime = (iso: string | null, fallback = "-") => {
  if (!iso) return fallback;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleString("id-ID");
};

// Determine if invoice status is final (stop polling)
const isFinal = (status: string) =>
  ["SUCCEEDED", "FAILED", "EXPIRED", "CANCELED"].includes(status);

// Poll interval (ms)
const POLL_INTERVAL = 10_000; // 10s

interface Props {
  /** Prefill reference id from URL (?ref=123) */
  initialRef?: string;
  /** Auto-fetch on mount when initialRef exists */
  autoFetch?: boolean;
  /** Enable polling until final status */
  enablePolling?: boolean;
}

export default function InvoiceClient({
  initialRef = "",
  autoFetch = true,
  enablePolling = true,
}: Props) {
  const [refid, setRefid] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  const clearPoll = () => {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  };

  const fetchInvoice = useCallback(
    async (id?: string, { isPoll = false } = {}) => {
      const ref = (id ?? refid).trim();
      if (!ref) return;

      // cancel in-flight
      if (abortRef.current) abortRef.current.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      if (!isPoll) {
        setLoading(true);
        setError(null);
        if (!invoice) {
          // show skeleton only first time
          setInvoice(null);
        }
      }

      try {
        const res = await fetch(`${API_BASE}api/v1/invoice/${ref}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal: ac.signal,
        });

        if (!res.ok) {
          throw new Error("Invoice tidak ditemukan");
        }

        const json = await res.json();
        const data: InvoiceData = json.data;
        setInvoice(data);

        // polling logic
        if (enablePolling && !isFinal(data.status)) {
          setPolling(true);
          clearPoll();
          pollTimer.current = setTimeout(
            () => fetchInvoice(ref, { isPoll: true }),
            POLL_INTERVAL
          );
        } else {
          setPolling(false);
          clearPoll();
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return; // ignore
        setError(err?.message ?? "Gagal memuat invoice.");
        setPolling(false);
        clearPoll();
      } finally {
        if (!isPoll) setLoading(false);
      }
    },
    [refid, invoice, enablePolling]
  );

  // Auto-fetch when initialRef provided
  useEffect(() => {
    if (initialRef && autoFetch) {
      fetchInvoice(initialRef);
    }
    return () => {
      clearPoll();
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRef, autoFetch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoice();
  };

  const handleRefresh = () => fetchInvoice();

  return (
    <Wrapper>
      <main className="max-w-4xl mx-auto px-4 py-12 transition-colors duration-300" aria-labelledby="invoice-heading">
        <header className="flex items-center justify-between mb-10 px-4 sm:px-6 lg:px-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-500/10 dark:bg-primary-400/10">
              <ReceiptText className="w-6 h-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            </div>
            <h1 id="invoice-heading" className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Cek Status Invoice
            </h1>
          </div>
        </header>

        {/* Search form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 mb-8"
          role="search"
          aria-label="Cari Invoice"
        >
          <label htmlFor="refid" className="sr-only">Reference ID</label>
          <input
            id="refid"
            type="text"
            value={refid}
            onChange={(e) => setRefid(e.target.value)}
            placeholder="Masukkan Reference ID..."
            className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 transition"
            autoComplete="off"
            aria-label="Reference ID"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-5 py-3 rounded-lg font-semibold shadow-md transition disabled:opacity-50"
            aria-label="Cek Invoice"
          >
            {loading ? (
              <RefreshCw className="animate-spin h-5 w-5" aria-hidden="true" />
            ) : (
              <Search className="h-5 w-5" aria-hidden="true" />
            )}
            Cek Invoice
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 text-red-500 dark:text-red-400 border border-red-300 dark:border-red-500/30 px-4 py-3 rounded-lg mb-6 shadow" role="alert">
            {error}
          </div>
        )}

        {/* Loading (first load) */}
        {loading && !invoice && <InvoiceSkeleton />}

        {/* Invoice Detail */}
        {invoice && (
          <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-6 shadow-lg transition-colors" aria-labelledby="invoice-detail-heading">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reference ID</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {invoice.reference_id}
                </p>
              </div>
              <span
                className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium border ${statusColor(
                  invoice.status
                )}`}
                aria-label={`Status: ${readableStatus(invoice.status)}`}
              >
                {readableStatus(invoice.status)}
              </span>
            </header>

            {/* Info Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Info Invoice">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Jumlah</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatRupiah(invoice.amount)}
                </p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Metode</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {invoice.payment_method}
                </p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Dibuat</p>
                <p className="text-lg text-gray-900 dark:text-white">
                  {fmtDateTime(invoice.created_at)}
                </p>
              </div>
            </section>

            {/* Payment Actions */}
            {["WAITING_PAYMENT", "ACCEPTING_PAYMENTS", "REQUIRES_ACTION"].includes(invoice.status) && (
              <section className="mt-6 space-y-4" aria-label="Aksi Pembayaran">
                {invoice.actions?.map((action, i) => {
                  const type = action.descriptor?.toUpperCase() ?? "";

                  if (type.includes("QR_STRING")) {
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center text-center border border-primary-500/30 rounded-lg p-6 bg-gray-50 dark:bg-gray-800 shadow-md"
                      >
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Scan QR untuk Membayar
                        </p>
                        <QRCode value={action.value} size={180} />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">QR Code</p>
                      </div>
                    );
                  }

                  if (
                    type.includes("DEEPLINK_URL") ||
                    type.includes("WEB_URL")
                  ) {
                    return (
                      <a
                        key={i}
                        href={action.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 rounded-lg text-center shadow-md transition"
                      >
                        Bayar Sekarang
                      </a>
                    );
                  }

                  return null;
                })}
              </section>
            )}

            {/* Polling Indicator */}
            {polling && (
              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-300 text-sm" role="status" aria-live="polite">
                <RefreshCw className="animate-spin h-4 w-4" aria-hidden="true" />
                Memeriksa status pembayaran...
              </div>
            )}

            {/* Items */}
            <section aria-labelledby="produk-heading">
              <h2 id="produk-heading" className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Daftar Produk
              </h2>
              <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm">
                <table className="min-w-full text-sm text-gray-700 dark:text-gray-300" aria-describedby="produk-heading">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-2 text-left" scope="col">Package</th>
                      <th className="px-4 py-2 text-left" scope="col">Product</th>
                      <th className="px-4 py-2 text-center" scope="col">Qty</th>
                      <th className="px-4 py-2 text-center" scope="col">Status</th>
                      <th className="px-4 py-2 text-center" scope="col">Delivered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-4 py-2">{item.package_name}</td>
                        <td className="px-4 py-2">{item.product_name}</td>
                        <td className="px-4 py-2 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs border ${statusColor(
                              item.status
                            )}`}
                            aria-label={`Status: ${readableStatus(item.status)}`}
                          >
                            {readableStatus(item.status)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          {fmtDateTime(item.delivered_at, "-")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Manual Refresh */}
            {!isFinal(invoice.status) && (
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md border border-primary-500/40 text-primary-700 dark:text-primary-300 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${polling ? "animate-spin" : ""}`}
                  />
                  Refresh Status
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </Wrapper>
  );
}
