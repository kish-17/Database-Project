import React from "react";

export function Button({ className = "", variant = "default", ...props }) {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-neutral-900 text-white shadow hover:bg-neutral-900/90",
    outline: "border border-neutral-200 bg-white shadow-sm hover:bg-neutral-100 text-neutral-900",
    ghost: "hover:bg-neutral-100 hover:text-neutral-900",
    link: "text-neutral-900 underline-offset-4 hover:underline",
  };

  const variantStyles = variants[variant] || variants.default;

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    />
  );
}
