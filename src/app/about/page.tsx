import type { Metadata } from "next";
import { SeaReel } from "@/components/sea-reel";
import { AboutContent } from "@/components/about-content";

export const metadata: Metadata = {
  title: "About",
  description: "About Khaled Ashraf — Design Engineer.",
  alternates: { canonical: "https://khaledashraf.me/about" },
};

const profilePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  name: "About Khaled Ashraf",
  description: "About Khaled Ashraf — Design Engineer.",
  url: "https://khaledashraf.me/about",
  mainEntity: {
    "@type": "Person",
    name: "Khaled Ashraf",
    url: "https://khaledashraf.me",
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(profilePageJsonLd),
        }}
      />
      <SeaReel />
      <AboutContent />
    </>
  );
}
