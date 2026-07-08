import { hrefWithLang, type Lang } from "@/lib/i18n";
import SiteLogo from "./SiteLogo";

const profileLinks = {
  github: "https://github.com/JenohJOHNSON",
  linkedin: "https://fr.linkedin.com/in/jenohjohnson",
};

const labels = {
  en: {
    brand: "Customer Health",
    description:
      "Portfolio-grade prototype: public demo data, Airbyte ingestion, PostgreSQL analytics, Python ML, Vercel delivery, and OpenAI explanations.",
    links: "Profile links",
    github: "GitHub",
    linkedin: "LinkedIn",
  },
  fr: {
    brand: "Santé Client",
    description:
      "Prototype portfolio : données publiques, ingestion Airbyte, analyses PostgreSQL, ML Python, livraison Vercel et explications OpenAI.",
    links: "Liens de profil",
    github: "GitHub",
    linkedin: "LinkedIn",
  },
};

export default function SiteFooter({ lang = "en" }: { lang?: Lang }) {
  const text = labels[lang];

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-summary">
          <a className="footer-brand" href={hrefWithLang("/", lang)}>
            <SiteLogo label={text.brand} />
          </a>
          <p>{text.description}</p>
        </div>
        <nav className="footer-links" aria-label={text.links}>
          <a href={profileLinks.github} rel="noreferrer" target="_blank">
            {text.github}
          </a>
          <a href={profileLinks.linkedin} rel="noreferrer" target="_blank">
            {text.linkedin}
          </a>
        </nav>
      </div>
    </footer>
  );
}
