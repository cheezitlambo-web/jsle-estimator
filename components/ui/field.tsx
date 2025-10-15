"use client";
import clsx from "clsx";
import React from "react";

type Props = {
  label?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** When true, label sits left of content on one line */
  row?: boolean;
};
export default function Field({ label, children, className, row }: Props) {
  if (row) {
    return (
      <div className={clsx("flex items-center justify-between gap-3", className)}>
        {label ? <div className="text-sm text-gray-700">{label}</div> : null}
        <div className="flex-1 flex justify-end">{children}</div>
      </div>
    );
  }
  return (
    <label className={clsx("block", className)}>
      {label ? <div className="mb-1 text-sm text-gray-700">{label}</div> : null}
      {children}
    </label>
  );
}
