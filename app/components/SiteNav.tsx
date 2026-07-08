import { hrefWithLang, type Lang } from "@/lib/i18n";

const labels = {
  en: {
    brand: "Customer Health",
    navigation: "Main navigation",
    dashboard: "Dashboard",
    customers: "Customers",
    about: "About",
    language: "Language",
  },
  fr: {
    brand: "Santé Client",
    navigation: "Navigation principale",
    dashboard: "Tableau de bord",
    customers: "Clients",
    about: "À propos",
    language: "Langue",
  },
};

export default function SiteNav({
  currentPath = "/",
  lang = "en",
}: {
  currentPath?: string;
  lang?: Lang;
}) {
  const text = labels[lang];
  const links = [
    { href: "/", label: text.dashboard },
    { href: "/customers", label: text.customers },
    { href: "/about", label: text.about },
  ];

  return (
    <header className="site-header">
      <nav className="container site-nav" aria-label={text.navigation}>
        <a className="brand" href={hrefWithLang("/", lang)}>
          {text.brand}
        </a>
        <div className="nav-actions">
          <div className="nav-links">
            {links.map((link) => (
              <a href={hrefWithLang(link.href, lang)} key={link.href}>
                {link.label}
              </a>
            ))}
          </div>
          <div className="language-switcher" aria-label={text.language}>
            <a
              aria-current={lang === "en" ? "true" : undefined}
              href={hrefWithLang(currentPath, "en")}
            >
              EN
            </a>
            <a
              aria-current={lang === "fr" ? "true" : undefined}
              href={hrefWithLang(currentPath, "fr")}
            >
              FR
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
