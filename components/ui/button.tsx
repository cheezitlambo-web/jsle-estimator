"use client";
import clsx from "clsx";
import React from "react";

type Tone = "primary" | "outline" | "ghost";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: Tone;
};

export default function Button({ tone = "primary", className, children, ...rest }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl text-sm px-3 py-2 transition";
  const tones: Record<Tone, string> = {
    primary:
      "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-400",
    outline:
      "border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800",
    ghost:
      "text-gray-700 hover:bg-gray-100 active:bg-gray-200",
  };
  return (
    <button className={clsx(base, tones[tone], className)} {...rest}>
      {children}
    </button>
  );
}
