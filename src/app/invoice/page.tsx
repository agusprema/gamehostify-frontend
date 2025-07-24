import { Suspense } from "react";
import PageTransition from "@/components/animations/PageTransition";
import InvoiceClient from "@/components/invoice/InvoiceClient";
import InvoiceSkeleton from "@/components/invoice/InvoiceSkeleton";

interface Props {
  searchParams: { ref?: string };
}

export const metadata = {
  title: "Cek Invoice | Status Pembayaran & Pengiriman",
  description: "Masukkan Reference ID untuk melihat status pembayaran & pengiriman produk Anda.",
};

export const dynamic = "force-dynamic"; // selalu realtime

export default function InvoicePage({ searchParams }: Props) {
  const ref = typeof searchParams?.ref === "string" ? searchParams.ref : "";

  return (
    <PageTransition>
      <Suspense fallback={<InvoiceSkeleton />}>
        <InvoiceClient initialRef={ref} autoFetch={true} enablePolling={true} />
      </Suspense>
    </PageTransition>
  );
}
