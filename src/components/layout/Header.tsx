"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Explore", href: "#" },
  { label: "My Wallet", href: "#" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-navy/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
        <a href="#" className="text-2xl font-bold text-navy">
          Point.ly
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-navy hover:text-coral transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="/signin"
            className="text-sm font-medium text-navy hover:text-coral transition-colors"
          >
            Log In
          </a>
          <a href="/signup">
            <Button variant="primary" size="md">
              Sign Up
            </Button>
          </a>
        </div>

        <button
          className="md:hidden text-navy p-2 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-navy/5 bg-cream px-6 pb-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block py-3 text-sm font-medium text-navy hover:text-coral transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 space-y-2">
            <a href="/signup">
              <Button variant="primary" size="md" className="w-full">
                Sign Up
              </Button>
            </a>
            <a
              href="/signin"
              className="block text-center text-sm font-medium text-navy hover:text-coral transition-colors py-2"
            >
              Log In
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
