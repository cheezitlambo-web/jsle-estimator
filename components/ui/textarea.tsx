"use client";
import clsx from "clsx";
import React from "react";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
const Textarea = React.forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { className, ...rest },
  ref
) {
  return (
    <textarea
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
export default Textarea;
