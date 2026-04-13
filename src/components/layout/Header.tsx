"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  getUserAccount,
  getUserProfile,
  getTotalPoints,
  signOut,
  type UserAccount,
  type ProgramBalance,
} from "@/lib/userProfile";
import { POINTS_PROGRAMS } from "@/components/onboarding/airports";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "#" },
  { label: "My Wallet", href: "/wallet" },
];

function formatPoints(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("en-US");
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pointsOpen, setPointsOpen] = useState(false);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [programs, setPrograms] = useState<ProgramBalance[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAccount(getUserAccount());
    setTotalPoints(getTotalPoints());
    const profile = getUserProfile();
    if (profile) setPrograms(profile.programs);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        pointsRef.current &&
        !pointsRef.current.contains(e.target as Node)
      ) {
        setPointsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSignOut() {
    signOut();
    setAccount(null);
    setDropdownOpen(false);
    window.location.href = "/";
  }

  function getProgramName(id: string): string {
    const p = POINTS_PROGRAMS.find((pp) => pp.id === id);
    return p ? p.shortName : id;
  }

  function getProgramColor(id: string): string {
    const p = POINTS_PROGRAMS.find((pp) => pp.id === id);
    return p ? p.color : "#64748b";
  }

  const initials = account
    ? account.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  // Close mobile menu on route change / resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-navy/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <a href="/" className="text-2xl font-bold text-navy">
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

          {/* Desktop right section */}
          <div className="hidden md:flex items-center gap-3">
            {account?.signedIn ? (
              <div className="relative flex items-center gap-2" ref={dropdownRef}>
                {/* Points badge with breakdown */}
                {totalPoints > 0 && (
                  <div className="relative" ref={pointsRef}>
                    <button
                      onClick={() => { setPointsOpen(!pointsOpen); setDropdownOpen(false); }}
                      className="text-xs font-semibold text-coral bg-coral/10 px-2.5 py-1 rounded-pill cursor-pointer hover:bg-coral/15 transition-colors"
                    >
                      {formatPoints(totalPoints)} pts
                    </button>

                    {pointsOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-navy/10 shadow-lg py-3 animate-scale-in z-50">
                        <p className="px-4 pb-2 text-xs font-semibold text-text-muted uppercase tracking-wide">
                          Points Breakdown
                        </p>
                        <div className="space-y-1">
                          {programs
                            .filter((p) => p.balance > 0)
                            .sort((a, b) => b.balance - a.balance)
                            .map((p) => (
                              <div
                                key={p.programId}
                                className="flex items-center justify-between px-4 py-1.5 hover:bg-sky-light/50 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: getProgramColor(p.programId) }}
                                  />
                                  <span className="text-sm text-navy">
                                    {getProgramName(p.programId)}
                                  </span>
                                </div>
                                <span className="text-sm font-semibold text-navy">
                                  {p.balance.toLocaleString("en-US")}
                                </span>
                              </div>
                            ))}
                        </div>
                        <div className="mt-2 pt-2 mx-4 border-t border-navy/5 flex items-center justify-between">
                          <span className="text-xs font-semibold text-text-muted">Total</span>
                          <span className="text-sm font-bold text-coral">
                            {totalPoints.toLocaleString("en-US")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => { setDropdownOpen(!dropdownOpen); setPointsOpen(false); }}
                  className="flex items-center gap-2.5 cursor-pointer rounded-pill px-3 py-1.5 hover:bg-navy/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{initials}</span>
                  </div>
                  <span className="text-sm font-medium text-navy max-w-[120px] truncate">
                    {account.name}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-text-muted transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-navy/10 shadow-lg py-2 animate-scale-in">
                    <div className="px-4 py-2 border-b border-navy/5">
                      <p className="text-sm font-semibold text-navy">{account.name}</p>
                      {account.email && (
                        <p className="text-xs text-text-muted truncate">{account.email}</p>
                      )}
                      {totalPoints > 0 && (
                        <p className="text-xs font-medium text-coral mt-1">
                          {totalPoints.toLocaleString("en-US")} total points
                        </p>
                      )}
                    </div>
                    <a
                      href="#"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy hover:bg-sky-light transition-colors"
                    >
                      <User size={15} className="text-text-muted" />
                      My Profile
                    </a>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy hover:bg-sky-light transition-colors cursor-pointer"
                    >
                      <LogOut size={15} className="text-text-muted" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <a
                  href="/signin"
                  className="text-sm font-medium text-navy hover:text-coral transition-colors"
                >
                  Log In
                </a>
                <a href="/signup">
                  <Button variant="primary" size="md">Sign Up</Button>
                </a>
              </>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-navy hover:bg-navy/5 transition-colors cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {/* Backdrop */}
      <div
        className="md:hidden fixed inset-0 z-40 bg-navy/40 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "auto" : "none" }}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel — slides in from right */}
      <div
        className="md:hidden fixed top-0 right-0 z-50 h-full w-[300px] bg-cream shadow-2xl flex flex-col transition-transform duration-300 ease-in-out"
        style={{ transform: menuOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-navy/5">
          <a href="/" className="text-xl font-bold text-navy" onClick={() => setMenuOpen(false)}>
            Point.ly
          </a>
          <button
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-navy hover:bg-navy/5 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-1">
          {/* Nav links */}
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold text-navy hover:bg-navy/5 hover:text-coral transition-colors"
            >
              {link.label}
            </a>
          ))}

          {/* Divider */}
          <div className="my-4 border-t border-navy/8" />

          {/* Account section */}
          {account?.signedIn ? (
            <>
              {/* User info card */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-navy/8 mb-2">
                <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-white">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy truncate">{account.name}</p>
                  {account.email && (
                    <p className="text-xs text-text-muted truncate">{account.email}</p>
                  )}
                  {totalPoints > 0 && (
                    <p className="text-xs font-semibold text-coral mt-0.5">
                      {formatPoints(totalPoints)} pts
                    </p>
                  )}
                </div>
              </div>

              {/* Points breakdown */}
              {programs.filter((p) => p.balance > 0).length > 0 && (
                <div className="bg-white rounded-xl border border-navy/8 px-4 py-3 mb-2">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                    Points Breakdown
                  </p>
                  <div className="space-y-2">
                    {programs
                      .filter((p) => p.balance > 0)
                      .sort((a, b) => b.balance - a.balance)
                      .map((p) => (
                        <div key={p.programId} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: getProgramColor(p.programId) }}
                            />
                            <span className="text-sm text-navy">{getProgramName(p.programId)}</span>
                          </div>
                          <span className="text-sm font-semibold text-navy">
                            {p.balance.toLocaleString("en-US")}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <a
                href="#"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-navy hover:bg-navy/5 transition-colors"
              >
                <User size={16} className="text-text-muted" />
                My Profile
              </a>
              <button
                onClick={() => { handleSignOut(); setMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-navy hover:bg-navy/5 transition-colors cursor-pointer w-full text-left"
              >
                <LogOut size={16} className="text-text-muted" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <a href="/signup" onClick={() => setMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full">Sign Up</Button>
              </a>
              <a
                href="/signin"
                onClick={() => setMenuOpen(false)}
                className="block text-center text-sm font-semibold text-navy hover:text-coral transition-colors py-2"
              >
                Log In
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
