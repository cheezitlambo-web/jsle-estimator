"use client";
import React from "react";

export function PrintOnly({ children }: { children: React.ReactNode }) {
  return <div className="hidden print:block">{children}</div>;
}

export function ScreenOnly({ children }: { children: React.ReactNode }) {
  return <div className="print:hidden">{children}</div>;
}
