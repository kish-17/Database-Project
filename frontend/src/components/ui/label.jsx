import React from "react";

export function Label({ className = "", ...props }) {
  return (
    <label
      className={
        "text-sm font-medium text-neutral-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 " +
        className
      }
      {...props}
    />
  );
}




