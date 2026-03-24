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
    <div className="flex flex-1 flex-col">
      {children}
    </div>
  );
}
