import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  color?: "primary" | "red" | "gray" | "green";
  className?: string;
}

const colorMap = {
  primary: "bg-primary-600 text-white",
  red: "bg-red-500 text-white",
  gray: "bg-gray-300 text-gray-800",
  green: "bg-green-500 text-white",
};

export default function Badge({ children, color = "primary", className = "" }: BadgeProps) {
  const c = colorMap[color] || colorMap.primary;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${c} ${className}`}>
      {children}
    </span>
  );
}

