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
            image: "https://khaledashraf.me/image.jpg",
            sameAs: [
              "https://github.com/khaaledashraaf",
              "https://www.linkedin.com/in/khaledaelmaleh/",
            ],
            worksFor: {
              "@type": "Organization",
              name: "noon",
              url: "https://noon.com",
            },
            knowsAbout: [
              "Product Design",
              "UX/UI Design",
              "User Research",
              "Design Engineering",
              "Computer Engineering",
              "Design Systems",
              "Frontend Development",
              "Vibe Coding",
              "Claude Code",
              "Cursor",
            ],
            description:
              "Design Engineer at noon building at the intersection of design tools and code.",
          }),
        }}
      />
      <Hero />
      {/* <Projects /> */}
      {/* <ContactForm /> */}
    </>
  );
}
