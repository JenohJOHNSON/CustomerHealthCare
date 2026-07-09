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
      "A simple cloud dashboard that uses public customer data to show who may leave, why they may leave, and what money is at risk.",
    links: "Profile links",
    github: "GitHub",
    linkedin: "LinkedIn",
  },
  fr: {
    brand: "Santé Client",
    description:
      "Un tableau cloud simple qui utilise des données clients publiques pour montrer qui risque de partir, pourquoi et quel revenu est à risque.",
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
