import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finds Admin",
  robots: { index: false, follow: false },
};

export default function AdminFindsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
