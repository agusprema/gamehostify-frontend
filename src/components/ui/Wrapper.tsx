"use client";

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
        bg-gradient-to-b from-gray-50 via-white to-gray-100
        dark:from-black dark:via-[#0a0613] dark:to-[#1a102e]
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
            bg-gradient-to-br from-yellow-300/40 via-yellow-400/40 to-yellow-200/60
            rounded-full blur-[120px]
            animate-pulse
          "
        />
        {/* Blue Glow */}
        <div
          className="
            absolute bottom-[10%] right-[10%]
            w-[320px] h-[320px]
            bg-gradient-to-br from-blue-300/40 via-blue-400/40 to-cyan-300/60
            rounded-full blur-[120px]
            animate-pulse delay-500
          "
        />
        {/* Soft Layer */}
        <div
          className="
            absolute inset-0
            bg-[radial-gradient(circle_at_top_right,_rgba(0,0,0,0.05),_transparent_70%)]
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
            bg-gradient-to-br from-primary-500/50 via-accent-500/40 to-indigo-500/40
            rounded-full blur-[140px]
            animate-pulse
          "
        />
        {/* Green Glow */}
        <div
          className="
            absolute bottom-[10%] right-[10%]
            w-[320px] h-[320px]
            bg-gradient-to-br from-emerald-400/50 via-teal-400/40 to-lime-400/40
            rounded-full blur-[140px]
            animate-pulse delay-500
          "
        />
        {/* Soft Layer */}
        <div
          className="
            absolute inset-0
            bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.05),_transparent_70%)]
          "
        />
      </div>

      {/* Children */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
