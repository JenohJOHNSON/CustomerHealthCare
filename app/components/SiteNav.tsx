const links = [
  { href: "/", label: "Dashboard" },
  { href: "/customers", label: "Customers" },
  { href: "/about", label: "About" },
];

export default function SiteNav() {
  return (
    <header className="site-header">
      <nav className="container site-nav" aria-label="Main navigation">
        <a className="brand" href="/">
          Customer Health
        </a>
        <div className="nav-links">
          {links.map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
