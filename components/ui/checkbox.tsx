"use client";
import clsx from "clsx";
import React from "react";

type Props = {
  label?: React.ReactNode;
  className?: string;
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
};
export default function Checkbox({ label, className, checked, onChange, disabled }: Props) {
  return (
    <label
      className={clsx(
        "flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2",
        "hover:bg-gray-50",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      <input
        type="checkbox"
        className="size-5 rounded border-gray-300 accent-emerald-600"
        checked={!!checked}
        onChange={onChange}
        disabled={disabled}
      />
      {label ? <span className="text-sm">{label}</span> : null}
    </label>
  );
}
