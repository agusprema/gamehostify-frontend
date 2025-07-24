import FaqHeader from "./FaqHeader";
import FaqGrid from "./FaqGrid";
import FaqAccordion from "./FaqAccordion";

export interface FaqItem {
  q: string;
  a: string;
}

interface FaqProps {
  items: FaqItem[];
  title?: string;
  subtitle?: string;
  variant?: "grid" | "accordion";
  className?: string;
  containerClassName?: string;
}

export default function Faq({
  items,
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know about game top-ups",
  variant = "grid",
  className = "",
  containerClassName = "",
}: FaqProps) {
  return (
    <section className={`py-16 ${containerClassName}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FaqHeader title={title} subtitle={subtitle} />

        {variant === "accordion" ? (
          <FaqAccordion items={items} />
        ) : (
          <FaqGrid items={items} className={className} />
        )}
      </div>
    </section>
  );
}
