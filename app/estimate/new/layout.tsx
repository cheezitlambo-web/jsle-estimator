// app/estimate/new/layout.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function NewEstimateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
