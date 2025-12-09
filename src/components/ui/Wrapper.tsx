import React from "react";

interface WrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function Wrapper({ children, className = "" }: WrapperProps) {
  return (
    <div
      className={`
        relative w-full min-h-screen text-gray-900 dark:text-white transition-colors duration-300
        bg-gradient-to-b from-gray-50 via-primary-100/50 to-primary-100
        dark:from-black dark:via-primary-950 dark:to-primary-900
        ${className}
      `}
    >
      {/* Glow Effects for Light Mode */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden dark:hidden">
        {/* Strong Yellow Glow */}
        <div
          className="
            absolute top-[10%] left-[10%]
            w-[350px] h-[350px]
            bg-gradient-to-br from-yellow-400/50 via-yellow-400/40 to-yellow-400/40
            rounded-full blur-[120px]
            animate-pulse delay-500
          "
        />
        {/* Red Glow */}
        <div
          className="
            absolute bottom-[10%] right-[10%]
            w-[320px] h-[320px]
            bg-gradient-to-br from-red-400/90 via-red-400/70 to-rose-400/70
            rounded-full blur-[120px]
            animate-pulse delay-500
          "
        />
        {/* Soft Layer */}
        <div
          className="
            absolute inset-0
            bg-[radial-gradient(circle_at_top_right,var(--color-accent-100),_transparent_30%)]
            animate-pulse delay-500
          "
        />
      </div>

      {/* Glow Effects for Dark Mode */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden dark:block">
        {/* primary Glow */}
        <div
          className="
            absolute top-[10%] left-[10%]
            w-[350px] h-[350px]
            bg-gradient-to-br from-primary-500/40 via-accent-500/30 to-indigo-500/30
            rounded-full blur-[140px]
            animate-pulse
          "
        />
        {/* Green Glow */}
        <div
          className="
            absolute bottom-[10%] right-[10%]
            w-[320px] h-[320px]
            bg-gradient-to-br from-emerald-400/40 via-teal-400/30 to-lime-400/30
            rounded-full blur-[140px]
            animate-pulse delay-500
          "
        />
        {/* Soft Layer */}
        <div
          className="
            absolute inset-0
            bg-[radial-gradient(circle_at_top_right,var(--color-accent-950),_transparent_10%)]
            animate-pulse delay-500
          "
        />
      </div>

      {/* Children */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
