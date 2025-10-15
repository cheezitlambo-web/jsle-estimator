"use client";
import clsx from "clsx";
import React from "react";

type Props = React.SelectHTMLAttributes<HTMLSelectElement>;
export default function Select({ className, children, ...rest }: Props) {
  return (
    <select
      className={clsx(
        "w-full rounded-xl border border-gray-300 bg-white",
        "px-3 py-2 text-sm outline-none",
        "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
        className
      )}
      {...rest}
    >
      {children}
    </select>
  );
}
