import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy policy for khaledashraf.me",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <h1 className="text-2xl font-semibold mb-8">Privacy</h1>
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          This site uses{" "}
          <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">Google Analytics</a>,{" "}
          <a href="https://vercel.com/analytics" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">Vercel Analytics</a>, and{" "}
          <a href="https://clarity.microsoft.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">Microsoft Clarity</a>{" "}
          to understand how visitors interact with the site. These tools collect anonymous usage data like pages visited, time on site, and general location.
        </p>
        <p>
          No personal information is collected, sold, or shared. There are no ads, accounts, or cookies used for tracking you across other sites.
        </p>
        <p>
          If you have questions, reach me at{" "}
          <a href="mailto:hi@khaledashraf.me" className="underline underline-offset-2 hover:text-foreground">hi@khaledashraf.me</a>.
        </p>
      </div>
    </main>
  );
}
