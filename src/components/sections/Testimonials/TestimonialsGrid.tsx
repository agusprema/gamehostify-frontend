import { Star } from "lucide-react";
import { Testimonial } from "./Testimonials";
import Image from "next/image";

export default function TestimonialsGrid({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <div
          key={index}
          className="bg-gray-100 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl p-6 border border-gray-300 dark:border-gray-700 hover:border-primary-400/40 transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center mb-4">
            <Image
              src={testimonial.avatar}
              alt={testimonial.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover mr-4"
            />
            <div>
              <h4 className="text-gray-900 dark:text-white font-semibold">{testimonial.name}</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{testimonial.game} Player</p>
            </div>
          </div>

          <div className="flex items-center mb-3">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
            ))}
          </div>

          <p className="text-gray-700 dark:text-gray-300 text-sm italic">{testimonial.comment}</p>
        </div>
      ))}
    </div>
  );
}
