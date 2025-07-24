import TestimonialsHeader from "./TestimonialsHeader";
import TestimonialsSlider from "./TestimonialsSlider";
import TestimonialsGrid from "./TestimonialsGrid";

export interface Testimonial {
  name: string;
  game: string;
  rating: number;
  comment: string;
  avatar: string;
}

interface Props {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
}

export default function Testimonials({
  testimonials,
  title = 'What Customer Say',
  subtitle = 'Pendapat pelanggan tentang layanan kami.',
}: Props) {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TestimonialsHeader title={title} subtitle={subtitle} />
        {/* Mobile: Slider */}
        <div className="block md:hidden">
          {/* Slider kita jadikan Client Component terpisah */}
          <TestimonialsSlider testimonials={testimonials} />
        </div>
        {/* Desktop: Grid */}
        <div className="hidden md:block">
          <TestimonialsGrid testimonials={testimonials} />
        </div>
      </div>
    </section>
  );
}
