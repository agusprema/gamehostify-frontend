import TokenTestimonialsClient from "@/components/testimonials/TokenTestimonialsClient";

export default function Page({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const token = typeof searchParams?.token === "string" ? searchParams?.token : "";
  return <TokenTestimonialsClient token={token} />;
}
