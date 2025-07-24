import PulsaDatapage from "@/components/pulsa-data/PulsaDataPage";
import PageTransition from "@/components/animations/PageTransition";
import { Metadata } from "next";

const app_name = process.env.NEXT_PUBLIC_APP_NAME;
const app_url = process.env.NEXT_PUBLIC_BASE_URL;

export const metadata: Metadata = {
  title: `Beli Pulsa Online & Paket Data Murah Semua Operator | ${app_name}`,
  description: `Top-up pulsa & paket internet Telkomsel, Indosat, XL, Tri dengan harga termurah, proses instan, dan 100% aman hanya di ${app_name}.`,
  keywords: [
    "beli pulsa online murah",
    "top up pulsa semua operator",
    "paket internet telkomsel",
    "paket data indosat murah",
    "paket internet xl",
    "top up tri online",
    "pulsa cepat dan aman",
    `beli pulsa ${app_name}`,
    `paket data ${app_name}`,
    "pulsa online 24 jam",
  ],
  metadataBase: new URL(app_url ?? ""),
  alternates: { canonical: "/pulsa-data" },
  robots: "index, follow",
  openGraph: {
    title: `Beli Pulsa Online & Paket Data | ${app_name}`,
    description: `Isi ulang pulsa & paket internet semua operator dengan harga murah, aman, dan cepat hanya di ${app_name}.`,
    url: new URL(`${app_url ?? ""}pulsa-data`),
    siteName: app_name,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_OG_IMAGE}og-image-pulsa-data.jpg`,
        width: 1200,
        height: 630,
        alt: `Pulsa & Data | ${app_name}`,
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Beli Pulsa Online & Paket Data Murah | ${app_name}`,
    description: `Top-up pulsa & paket internet Telkomsel, Indosat, XL, Tri dengan harga murah, cepat, dan aman hanya di ${app_name}.`,
    images: [`${process.env.NEXT_PUBLIC_OG_IMAGE}og-image-pulsa-data.jpg`],
    site: process.env.NEXT_PUBLIC_TWITER_TAG,
  },
};

export const viewport = { themeColor: "#6b21a8" };

export default async function PulsaDataPage() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  const res = await fetch(`${API}api/v1/operators`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 }, // Cache data selama 1 jam
  });

  if (!res.ok) {
    console.error("Failed to fetch operators");
    return (
      <PageTransition>
        <div className="text-center text-white py-20">
          Gagal memuat data operator.
        </div>
      </PageTransition>
    );
  }

  const json = await res.json();
  const data = json?.data ?? {};
  const operators = data.operators || [];

  return (
    <PageTransition>
      <PulsaDatapage operators={operators} />
    </PageTransition>
  );
}
