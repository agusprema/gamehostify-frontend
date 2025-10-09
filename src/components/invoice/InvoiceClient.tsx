"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Search, RefreshCw, ReceiptText, ChevronDown, FileDown } from "lucide-react";
import QRCode from "react-qr-code";
import Wrapper from "@/components/ui/Wrapper";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import InvoiceSkeleton from "./InvoiceSkeleton";
import { readableStatus, statusColor } from "./status";
import { apiFetch } from "@/lib/apiFetch";
import { useAuthStatus } from "@/hooks/useAuthStatus";

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

interface TransactionSummary {
  invoice_id: string;
  reference_id: string;
  status: string;
  items_count?: number;
  created_at: string;
}

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

// Known invoice status codes
const KNOWN_STATUSES = [
  "ACCEPTING_PAYMENTS",
  "REQUIRES_ACTION",
  "AUTHORIZED",
  "CANCELED",
  "EXPIRED",
  "SUCCEEDED",
  "FAILED",
  "PENDING",
  "WAITING_PAYMENT",
  "REFUND",
] as const;
const STATUS_SET = new Set<string>(KNOWN_STATUSES);

// Try to normalize a status string (code or label) into a known code
const normalizeStatus = (s: string): string => {
  if (!s) return s;
  const up = s.toUpperCase();
  const underscored = up.replace(/\s+/g, "_");
  if (STATUS_SET.has(underscored)) return underscored;
  if (up.includes("SUCCESS")) return "SUCCEEDED";
  if (up.includes("WAIT")) return "WAITING_PAYMENT";
  if (up.includes("PENDING")) return "PENDING";
  if (up.includes("CANCEL")) return "CANCELED";
  if (up.includes("EXPIRE")) return "EXPIRED";
  if (up.includes("FAIL")) return "FAILED";
  if (up.includes("REFUND")) return "REFUND";
  if (up.includes("AUTHOR")) return "AUTHORIZED";
  if (up.includes("REQUIRES")) return "REQUIRES_ACTION";
  if (up.includes("ACCEPT")) return "ACCEPTING_PAYMENTS";
  return underscored; // fallback
};

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
  // Auth state
  const { loading: authLoading, authenticated } = useAuthStatus();

  const [refid, setRefid] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);

  // List state (for authenticated users)
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [expandedRef, setExpandedRef] = useState<string | null>(null);
  const [perPage, setPerPage] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState<string>(""); // empty means all

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
        const res = await apiFetch(`api/v1/invoice/${ref}`, {
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
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'name' in err && (err as { name?: string }).name === 'AbortError') return; // ignore
        const message = err instanceof Error ? err.message : "Gagal memuat invoice.";
        setError(message);
        setPolling(false);
        clearPoll();
      } finally {
        if (!isPoll) setLoading(false);
      }
    },
    [refid, invoice, enablePolling]
  );

  // Fetch list of transactions for authenticated users
  const fetchTransactions = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const qs = new URLSearchParams();
      const pp = Math.max(1, Math.min(50, Number.isFinite(perPage as unknown as number) ? perPage : 10));
      qs.set("per_page", String(pp));
      if (statusFilter) qs.set("status", statusFilter);
      const url = `api/v1/invoice${qs.toString() ? `?${qs.toString()}` : ""}`;
      const res = await apiFetch(url, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Gagal memuat daftar transaksi");
      const json = await res.json();
      const list: TransactionSummary[] = (json?.data?.transactions ?? []) as TransactionSummary[];
      setTransactions(Array.isArray(list) ? list : []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memuat daftar transaksi.";
      setListError(message);
      setTransactions([]);
    } finally {
      setListLoading(false);
    }
  }, [perPage, statusFilter]);

  // Auto-fetch when initialRef provided (guest mode) or pre-expand in auth mode
  useEffect(() => {
    if (authenticated) {
      // Load list; if initial ref exists, expand after list fetched
      fetchTransactions();
      if (initialRef) {
        setExpandedRef(initialRef);
        // Preload detail for the initialRef
        fetchInvoice(initialRef);
      }
    } else if (initialRef && autoFetch) {
      fetchInvoice(initialRef);
    }
    return () => {
      clearPoll();
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRef, autoFetch, authenticated, fetchTransactions]);

  // Refetch list when filters change (authenticated only)
  useEffect(() => {
    if (authenticated) {
      fetchTransactions();
    }
  }, [authenticated, perPage, statusFilter, fetchTransactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoice();
  };

  const handleRefresh = () => fetchInvoice();

  // Toggle expand an item and fetch its detail
  const handleToggleExpand = (ref: string) => {
    setError(null);
    if (expandedRef === ref) {
      setExpandedRef(null);
      setInvoice(null);
      clearPoll();
      return;
    }
    setExpandedRef(ref);
    setRefid(ref);
    fetchInvoice(ref);
  };

  // Download PDF
  const handleDownloadPdf = async (referenceId: string) => {
    try {
      const res = await apiFetch(`api/v1/invoice/${referenceId}/pdf`,
        {
          headers: { Accept: "application/pdf" },
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error("Gagal mengunduh PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${referenceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mengunduh PDF.";
      setError(msg);
    }
  };

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
        {/* Authenticated view: list of transactions with expandable detail header */}
        {!authLoading && authenticated && (
          <div className="space-y-6">
            {listError && (
              <div className="bg-red-500/10 text-red-500 dark:text-red-400 border border-red-300 dark:border-red-500/30 px-4 py-3 rounded-lg" role="alert">
                {listError}
              </div>
            )}
            <Card className="shadow-lg">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Riwayat Transaksi</h2>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <div className="flex items-center gap-2">
                    <label htmlFor="statusFilter" className="text-sm text-gray-700 dark:text-gray-300">Status</label>
                    <select
                      id="statusFilter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1"
                    >
                      <option value="">Semua</option>
                      {KNOWN_STATUSES.map((st) => (
                        <option key={st} value={st}>{readableStatus(st)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="perPage" className="text-sm text-gray-700 dark:text-gray-300">Per Page</label>
                    <select
                      id="perPage"
                      value={perPage}
                      onChange={(e) => setPerPage(parseInt(e.target.value) || 10)}
                      className="text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1"
                    >
                      {[10, 20, 30, 40, 50].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={fetchTransactions}
                    disabled={listLoading}
                    className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-primary-500/40 text-primary-700 dark:text-primary-300 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${listLoading ? "animate-spin" : ""}`} />
                    Terapkan
                  </button>
                </div>
              </div>
              {listLoading ? (
                <div className="py-8 text-center text-gray-600 dark:text-gray-400">Memuat transaksi...</div>
              ) : transactions.length === 0 ? (
                <div className="py-8 text-center text-gray-600 dark:text-gray-400">Belum ada transaksi.</div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.map((tx) => {
                    const open = expandedRef === tx.reference_id;
                    return (
                      <div key={tx.reference_id}>
                        <button
                          type="button"
                          onClick={() => handleToggleExpand(tx.reference_id)}
                          className="w-full flex items-center justify-between text-left py-3"
                          aria-expanded={open}
                          aria-controls={`invoice-panel-${tx.reference_id}`}
                          id={`invoice-header-${tx.reference_id}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <span className="font-semibold text-gray-900 dark:text-white">{tx.reference_id}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{fmtDateTime(tx.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {(() => { const code = normalizeStatus(tx.status || ""); return (
                              <span className={`px-3 py-1 rounded-full text-xs border ${statusColor(code)}`}>
                                {STATUS_SET.has(code) ? readableStatus(code) : (tx.status || code)}
                              </span>
                            ); })()}
                            <ChevronDown className={`h-5 w-5 text-primary-500 transition-transform ${open ? "rotate-180" : ""}`} />
                          </div>
                        </button>
                        {open && (
                          <div id={`invoice-panel-${tx.reference_id}`} aria-labelledby={`invoice-header-${tx.reference_id}`} className="pb-4">
                            {/* When expanded, fetchInvoice loads details; card renders below for both modes */}
                            {loading && !invoice && <InvoiceSkeleton />}
                            {error && (
                              <div className="bg-red-500/10 text-red-500 dark:text-red-400 border border-red-300 dark:border-red-500/30 px-4 py-3 rounded-lg mb-2" role="alert">
                                {error}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Guest view */}
        {(!authLoading && !authenticated) && (
          <>

        {/* Search form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 mb-8"
          role="search"
          aria-label="Cari Invoice"
        >
          <label htmlFor="refid" className="sr-only">Reference ID</label>
          <Input
            id="refid"
            type="text"
            value={refid}
            onChange={(e) => setRefid(e.target.value)}
            placeholder="Masukkan Reference ID..."
            autoComplete="off"
            aria-label="Reference ID"
            containerClassName="flex-1"
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

          </>
        )}

        {/* Invoice Detail */}
        {invoice && (
          <Card className="space-y-6 shadow-lg" aria-labelledby="invoice-detail-heading">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reference ID</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {invoice.reference_id}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(invoice.reference_id)}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm px-3 py-2 rounded-md border border-primary-500/40 text-primary-700 dark:text-primary-300 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition"
                >
                  <FileDown className="h-4 w-4" />
                  Download PDF
                </button>
                <span
                  className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium border ${statusColor(
                    invoice.status
                  )}`}
                  aria-label={`Status: ${readableStatus(invoice.status)}`}
                >
                  {readableStatus(invoice.status)}
                </span>
              </div>
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
          </Card>
        )}
      </main>
    </Wrapper>
  );
}
