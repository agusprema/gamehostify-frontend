"use client";

import React from "react";

interface FormErrorProps {
  messages?: string[]; // Array pesan error untuk satu field
  className?: string;
}

const FormError: React.FC<FormErrorProps> = ({ messages, className }) => {
  if (!messages || messages.length === 0) return null;

  return (
    <div className={`text-red-400 text-sm mt-1 space-y-0.5 ${className || ""}`}>
      {messages.map((msg, i) => (
        <p key={i}>{msg}</p>
      ))}
    </div>
  );
};

export default FormError;
