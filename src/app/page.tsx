import { Hero } from "@/components/hero";
import { Projects } from "@/components/projects";
import { ContactForm } from "@/components/contact-form";

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Khaled Ashraf",
            jobTitle: "Product Designer",
            url: "https://khaledashraf.me",
            sameAs: [
              "https://github.com/khaaledashraaf",
              "https://www.linkedin.com/in/khaledaelmaleh/",
            ],
            description:
              "Product Designer with a background in Computer Engineering. Building at the intersection of design tools and code.",
          }),
        }}
      />
      <Hero />
      {/* <Projects /> */}
      {/* <ContactForm /> */}
    </>
  );
}
