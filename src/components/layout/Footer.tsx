const footerLinks = [
  { label: "Home", href: "#" },
  { label: "Explore", href: "#" },
  { label: "Help", href: "#" },
  { label: "My Wallet", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-cream border-t border-navy/5 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <a href="#" className="text-xl font-bold text-navy">
              Point.ly
            </a>
            <nav className="mt-4 flex flex-col gap-2">
              {footerLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-text-secondary hover:text-coral transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-navy/5 text-center text-sm text-text-muted">
          &copy; 2026 Point.ly | All Rights Reserved
        </div>
      </div>
    </footer>
  );
}
