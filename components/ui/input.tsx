"use client";
import clsx from "clsx";
import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;
const Input = React.forwardRef<HTMLInputElement, Props>(function Input(
  { className, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      className={clsx(
        "w-full rounded-xl border border-gray-300 bg-white",
        "px-3 py-2 text-sm outline-none",
        "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
        "placeholder:text-gray-400",
        className
      )}
      {...rest}
    />
  );
});
export default Input;
