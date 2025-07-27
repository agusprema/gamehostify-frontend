import React from "react";

interface Props {
  title: string;
  subtitle?: string;
}

export default function FaqHeader({ title, subtitle }: Props) {
  return (
    <header className="text-center mb-12" aria-labelledby="faq-title">
      <h2
        id="faq-title"
        className="text-3xl md:text-4xl font-extrabold mb-3 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent"
      >
        {title}
      </h2>
      <div className="w-24 h-1 mx-auto bg-gradient-to-r from-primary-400 to-primary-600 rounded-full mb-4" aria-hidden="true"></div>
      {subtitle && (
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-sm md:text-base">
          {subtitle}
        </p>
      )}
    </header>
  );
}
