"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  getUserProfile,
  saveUserProfile,
  getUserAccount,
  saveUserAccount,
  DEFAULT_PREFERENCES,
  type UserProfile,
  type UserAccount,
  type TravelPreferences,
  type ProgramBalance,
} from "@/lib/userProfile";
import { AIRPORTS, POINTS_PROGRAMS } from "@/components/onboarding/airports";
import {
  User,
  MapPin,
  CreditCard,
  Plane,
  Hotel,
  Settings,
  Check,
  Plus,
  Trash2,
  Edit3,
  X,
  ChevronDown,
  Star,
  Globe,
  Briefcase,
  Heart,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function formatPoints(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}K`;
  return n.toLocaleString("en-US");
}

function getProgramMeta(id: string) {
  return POINTS_PROGRAMS.find((p) => p.id === id);
}

function getProgramColor(id: string): string {
  return getProgramMeta(id)?.color ?? "#64748b";
}

function getProgramName(id: string): string {
  return getProgramMeta(id)?.shortName ?? id;
}

/* ─────────────────────────────────────────────
   Section wrapper
───────────────────────────────────────────── */
function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-navy/8 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-navy/6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-navy/6 flex items-center justify-center text-navy shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-bold text-navy">{title}</h2>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Pill selector (single)
───────────────────────────────────────────── */
function PillSelect<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-pill text-sm font-medium transition-all cursor-pointer ${
            value === opt.value
              ? "bg-navy text-white shadow-sm"
              : "bg-navy/5 text-navy hover:bg-navy/10 border border-navy/8"
          }`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Toast
───────────────────────────────────────────── */
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-navy text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium animate-scale-in">
      <Check size={16} className="text-emerald-400" />
      {message}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Airport search input
───────────────────────────────────────────── */
function AirportSearch({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (code: string) => void;
}) {
  const airport = value ? AIRPORTS.find((a) => a.code === value) : null;
  const [query, setQuery] = useState(
    airport ? `${airport.city} (${airport.code})` : ""
  );
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.length > 0
    ? AIRPORTS.filter(
        (a) =>
          a.city.toLowerCase().includes(query.toLowerCase()) ||
          a.code.toLowerCase().includes(query.toLowerCase()) ||
          a.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-2 bg-navy/4 border border-navy/10 rounded-xl px-4 py-3 focus-within:border-coral/50 transition-colors">
        <MapPin size={16} className="text-text-muted shrink-0" />
        <input
          className="flex-1 text-sm text-navy font-medium bg-transparent outline-none placeholder:text-navy/40"
          placeholder="Search city or airport code…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => { if (query.length > 0) setOpen(true); }}
        />
        {value && (
          <button
            onClick={() => { onChange(""); setQuery(""); }}
            className="text-text-muted hover:text-navy transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-navy/10 rounded-xl shadow-lg z-30 py-1 max-h-48 overflow-y-auto">
          {filtered.map((a) => (
            <button
              key={a.code}
              onClick={() => {
                onChange(a.code);
                setQuery(`${a.city} (${a.code})`);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-cream transition-colors cursor-pointer"
            >
              <span className="font-semibold text-navy">{a.code}</span>
              <span className="text-text-muted ml-2">{a.city} — {a.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Points program row (editable)
───────────────────────────────────────────── */
function ProgramRow({
  programId,
  balance,
  onBalanceChange,
  onRemove,
}: {
  programId: string;
  balance: number;
  onBalanceChange: (v: number) => void;
  onRemove: () => void;
}) {
  const meta = getProgramMeta(programId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(balance));

  function commit() {
    const n = parseInt(draft.replace(/,/g, ""), 10);
    if (!isNaN(n) && n >= 0) onBalanceChange(n);
    else setDraft(String(balance));
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-navy/5 last:border-0">
      {/* Color dot + name */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ background: meta?.color ?? "#64748b" }}
      >
        {meta?.iconLetter ?? programId[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-navy truncate">
          {meta?.shortName ?? programId}
        </p>
        <p className="text-xs text-text-muted capitalize">{meta?.category}</p>
      </div>

      {/* Balance */}
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            className="w-28 text-right text-sm font-semibold text-navy bg-navy/5 border border-navy/15 rounded-lg px-2 py-1 outline-none"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setEditing(false); setDraft(String(balance)); } }}
          />
        </div>
      ) : (
        <button
          onClick={() => { setEditing(true); setDraft(String(balance)); }}
          className="flex items-center gap-1.5 text-sm font-bold text-navy hover:text-coral transition-colors cursor-pointer group"
        >
          <span>{balance.toLocaleString("en-US")}</span>
          <Edit3 size={12} className="text-text-muted group-hover:text-coral transition-colors" />
        </button>
      )}

      <button
        onClick={onRemove}
        className="ml-1 text-text-muted hover:text-red-400 transition-colors cursor-pointer p-1"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Add program dropdown
───────────────────────────────────────────── */
function AddProgramDropdown({
  existingIds,
  onAdd,
}: {
  existingIds: string[];
  onAdd: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const available = POINTS_PROGRAMS.filter((p) => !existingIds.includes(p.id));

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  if (available.length === 0) return null;

  const groups = ["credit-card", "airline", "hotel"] as const;
  const groupLabel: Record<string, string> = {
    "credit-card": "Credit Cards",
    airline: "Airlines",
    hotel: "Hotels",
  };

  return (
    <div className="relative mt-3" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-semibold text-coral hover:text-coral/80 transition-colors cursor-pointer"
      >
        <Plus size={15} />
        Add program
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-72 bg-white border border-navy/10 rounded-xl shadow-lg z-30 py-2 max-h-64 overflow-y-auto">
          {groups.map((cat) => {
            const items = available.filter((p) => p.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <p className="px-4 pt-2 pb-1 text-xs font-semibold text-text-muted uppercase tracking-wide">
                  {groupLabel[cat]}
                </p>
                {items.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { onAdd(p.id); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-navy hover:bg-cream transition-colors cursor-pointer"
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: p.color }}
                    >
                      {p.iconLetter}
                    </div>
                    {p.shortName}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Multi-toggle for preferred airlines/hotels
───────────────────────────────────────────── */
function MultiToggle({
  category,
  selected,
  onChange,
}: {
  category: "airline" | "hotel";
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const programs = POINTS_PROGRAMS.filter((p) => p.category === category);
  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {programs.map((p) => {
        const active = selected.includes(p.id);
        return (
          <button
            key={p.id}
            onClick={() => toggle(p.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
              active
                ? "text-white border-transparent shadow-sm"
                : "bg-white text-navy border-navy/10 hover:border-navy/20"
            }`}
            style={active ? { background: p.color, borderColor: p.color } : {}}
          >
            <div
              className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${active ? "bg-white/20" : "text-white"}`}
              style={active ? {} : { background: p.color }}
            >
              <span style={{ color: active ? "white" : "white" }}>{p.iconLetter}</span>
            </div>
            {p.shortName}
            {active && <Check size={12} />}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Wishlist destinations
───────────────────────────────────────────── */
function WishlistEditor({
  destinations,
  onChange,
}: {
  destinations: string[];
  onChange: (d: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function add() {
    const trimmed = input.trim();
    if (trimmed && !destinations.includes(trimmed)) {
      onChange([...destinations, trimmed]);
    }
    setInput("");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {destinations.map((d) => (
          <span
            key={d}
            className="flex items-center gap-1.5 bg-coral/10 text-coral text-sm font-medium px-3 py-1.5 rounded-pill"
          >
            <Globe size={12} />
            {d}
            <button
              onClick={() => onChange(destinations.filter((x) => x !== d))}
              className="ml-0.5 hover:text-coral/60 transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {destinations.length === 0 && (
          <p className="text-sm text-text-muted italic">No destinations added yet</p>
        )}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 text-sm text-navy bg-navy/4 border border-navy/10 rounded-xl px-4 py-2.5 outline-none focus:border-coral/40 transition-colors placeholder:text-navy/40"
          placeholder="e.g. Tokyo, Maldives, Paris…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }}
        />
        <button
          onClick={add}
          disabled={!input.trim()}
          className="flex items-center gap-1.5 bg-coral text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-coral/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Plus size={14} />
          Add
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
export default function ProfilePage() {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");

  // Load data
  useEffect(() => {
    setAccount(getUserAccount());
    const p = getUserProfile();
    if (p) {
      setProfile({ ...p, preferences: p.preferences ?? DEFAULT_PREFERENCES });
    } else {
      setProfile({ homeAirport: null, programs: [], preferences: DEFAULT_PREFERENCES });
    }
  }, []);

  function save(updated: UserProfile) {
    setProfile(updated);
    saveUserProfile(updated);
    setToast("Changes saved");
  }

  function updatePrefs(patch: Partial<TravelPreferences>) {
    if (!profile) return;
    const prefs = { ...(profile.preferences ?? DEFAULT_PREFERENCES), ...patch };
    save({ ...profile, preferences: prefs });
  }

  function updatePrograms(programs: ProgramBalance[]) {
    if (!profile) return;
    save({ ...profile, programs });
  }

  if (!profile) return null;

  const prefs = profile.preferences ?? DEFAULT_PREFERENCES;
  const totalPoints = profile.programs.reduce((s, p) => s + p.balance, 0);
  const initials = account?.name
    ? account.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 space-y-6">

        {/* ── Hero header ── */}
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-navy flex items-center justify-center shrink-0 shadow-md">
            <span className="text-2xl font-bold text-white">{initials}</span>
          </div>
          <div>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  className="text-2xl font-bold text-navy bg-transparent border-b-2 border-coral outline-none"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={() => {
                    if (draftName.trim() && account) {
                      const updated = { ...account, name: draftName.trim() };
                      saveUserAccount(updated);
                      setAccount(updated);
                      setToast("Name updated");
                    }
                    setEditingName(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                />
              </div>
            ) : (
              <button
                onClick={() => { setDraftName(account?.name ?? ""); setEditingName(true); }}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <h1 className="text-2xl font-bold text-navy group-hover:text-coral transition-colors">
                  {account?.name ?? "Your Profile"}
                </h1>
                <Edit3 size={15} className="text-text-muted group-hover:text-coral transition-colors" />
              </button>
            )}
            <p className="text-sm text-text-muted mt-0.5">{account?.email}</p>
          </div>

          {/* Total points badge */}
          {totalPoints > 0 && (
            <div className="ml-auto text-right shrink-0">
              <p className="text-xs text-text-muted font-medium uppercase tracking-wide">Total points</p>
              <p className="text-2xl font-bold text-coral">{formatPoints(totalPoints)}</p>
            </div>
          )}
        </div>

        {/* ── Home Airport ── */}
        <Section
          icon={<MapPin size={17} />}
          title="Home Airport"
          subtitle="Used to personalise flight searches and deal alerts"
        >
          <AirportSearch
            value={profile.homeAirport}
            onChange={(code) => save({ ...profile, homeAirport: code || null })}
          />
          {profile.homeAirport && (
            <p className="mt-2 text-xs text-text-muted">
              Currently set to <strong className="text-navy">{profile.homeAirport}</strong>
              {" "}— {AIRPORTS.find((a) => a.code === profile.homeAirport)?.city}
            </p>
          )}
        </Section>

        {/* ── Points Balances ── */}
        <Section
          icon={<CreditCard size={17} />}
          title="Points & Miles"
          subtitle="Tap a balance to edit it inline"
        >
          {profile.programs.length === 0 ? (
            <p className="text-sm text-text-muted italic">No programs added yet.</p>
          ) : (
            <div>
              {profile.programs.map((p) => (
                <ProgramRow
                  key={p.programId}
                  programId={p.programId}
                  balance={p.balance}
                  onBalanceChange={(v) =>
                    updatePrograms(
                      profile.programs.map((x) =>
                        x.programId === p.programId ? { ...x, balance: v } : x
                      )
                    )
                  }
                  onRemove={() =>
                    updatePrograms(profile.programs.filter((x) => x.programId !== p.programId))
                  }
                />
              ))}
            </div>
          )}
          <AddProgramDropdown
            existingIds={profile.programs.map((p) => p.programId)}
            onAdd={(id) =>
              updatePrograms([...profile.programs, { programId: id, balance: 0 }])
            }
          />
        </Section>

        {/* ── Travel Preferences ── */}
        <Section
          icon={<Settings size={17} />}
          title="Travel Preferences"
          subtitle="Personalise your search results and recommendations"
        >
          <div className="space-y-6">

            {/* Cabin */}
            <div>
              <p className="text-sm font-semibold text-navy mb-2.5">Preferred cabin</p>
              <PillSelect
                value={prefs.preferredCabin}
                onChange={(v) => updatePrefs({ preferredCabin: v })}
                options={[
                  { value: "economy", label: "Economy" },
                  { value: "premium-economy", label: "Premium Economy" },
                  { value: "business", label: "Business" },
                  { value: "first", label: "First Class" },
                ]}
              />
            </div>

            {/* Seat */}
            <div>
              <p className="text-sm font-semibold text-navy mb-2.5">Seat preference</p>
              <PillSelect
                value={prefs.seatPreference}
                onChange={(v) => updatePrefs({ seatPreference: v })}
                options={[
                  { value: "window", label: "🪟 Window" },
                  { value: "aisle", label: "🚶 Aisle" },
                  { value: "no-preference", label: "No preference" },
                ]}
              />
            </div>

            {/* Trip style */}
            <div>
              <p className="text-sm font-semibold text-navy mb-2.5">How do you travel?</p>
              <PillSelect
                value={prefs.tripStyle}
                onChange={(v) => updatePrefs({ tripStyle: v })}
                options={[
                  { value: "leisure", label: "✈️ Leisure" },
                  { value: "business", label: "💼 Business" },
                  { value: "mixed", label: "🌍 Both" },
                ]}
              />
            </div>

            {/* Trips per year */}
            <div>
              <p className="text-sm font-semibold text-navy mb-2.5">Trips per year</p>
              <PillSelect
                value={prefs.tripsPerYear}
                onChange={(v) => updatePrefs({ tripsPerYear: v })}
                options={[
                  { value: "1-2", label: "1–2" },
                  { value: "3-5", label: "3–5" },
                  { value: "6-10", label: "6–10" },
                  { value: "10+", label: "10+" },
                ]}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-navy/6" />

            {/* Preferred airlines */}
            <div>
              <p className="text-sm font-semibold text-navy mb-2.5">Preferred airlines</p>
              <MultiToggle
                category="airline"
                selected={prefs.preferredAirlines}
                onChange={(ids) => updatePrefs({ preferredAirlines: ids })}
              />
            </div>

            {/* Preferred hotels */}
            <div>
              <p className="text-sm font-semibold text-navy mb-2.5">Preferred hotel programs</p>
              <MultiToggle
                category="hotel"
                selected={prefs.preferredHotels}
                onChange={(ids) => updatePrefs({ preferredHotels: ids })}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-navy/6" />

            {/* Wishlist */}
            <div>
              <p className="text-sm font-semibold text-navy mb-1">Dream destinations</p>
              <p className="text-xs text-text-muted mb-3">We'll alert you when great deals come up for these places</p>
              <WishlistEditor
                destinations={prefs.wishlistDestinations}
                onChange={(d) => updatePrefs({ wishlistDestinations: d })}
              />
            </div>
          </div>
        </Section>

        {/* ── Account ── */}
        <Section
          icon={<User size={17} />}
          title="Account"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-navy">Name</p>
                <p className="text-sm text-text-muted">{account?.name ?? "—"}</p>
              </div>
              <button
                onClick={() => { setDraftName(account?.name ?? ""); setEditingName(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="text-xs font-semibold text-coral hover:text-coral/70 transition-colors cursor-pointer"
              >
                Edit
              </button>
            </div>
            <div className="border-t border-navy/5" />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-navy">Email</p>
                <p className="text-sm text-text-muted">{account?.email ?? "—"}</p>
              </div>
            </div>
            <div className="border-t border-navy/5" />
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.clear();
                  window.location.href = "/";
                }
              }}
              className="text-sm font-semibold text-red-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              Sign out &amp; clear data
            </button>
          </div>
        </Section>

      </main>

      <Footer />

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
