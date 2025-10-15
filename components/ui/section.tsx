"use client";
import clsx from "clsx";
import React from "react";

type Props = {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};
export default function Section({ title, actions, children, className }: Props) {
  return (
    <section
      className={clsx(
        "rounded-2xl border bg-white shadow-xs",
        "p-4 sm:p-5 mb-4",
        className
      )}
    >
      {(title || actions) && (
        <div className="mb-3 flex items-center justify-between">
          {title ? (
            <h2 className="text-base sm:text-lg font-semibold tracking-tight">{title}</h2>
          ) : <div />}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
