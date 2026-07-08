export default function SiteLogo({ label }: { label: string }) {
  return (
    <span className="site-logo">
      <span className="logo-mark" aria-hidden="true">
        <svg className="logo-svg" viewBox="0 0 48 48" focusable="false">
          <rect className="logo-bg" x="3" y="3" width="42" height="42" rx="12" />
          <path
            className="logo-pulse"
            d="M10 25h7l4-9 7 18 5-12h5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle className="logo-dot" cx="35" cy="15" r="4" />
        </svg>
      </span>
      <span className="logo-wordmark">{label}</span>
    </span>
  );
}
