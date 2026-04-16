"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  getUserProfile,
  saveUserProfile,
  DEFAULT_PREFERENCES,
  type UserProfile,
  type TravelPreferences,
  type ProgramBalance,
} from "@/lib/userProfile";
import { createClient } from "@/lib/supabase/client";
import { loadProfileFromSupabase, saveProfileToSupabase } from "@/lib/supabase/profile";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { AIRPORTS, POINTS_PROGRAMS } from "@/components/onboarding/airports";
import {
  PROGRAM_BALANCE_URLS,
  isStale,
  formatLastSynced,
} from "@/lib/programLinks";
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
  ExternalLink,
  Clipboard,
  RefreshCw,
  AlertTriangle,
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
   Points program row (editable + sync)
───────────────────────────────────────────── */
function ProgramRow({
  programId,
  balance,
  lastSyncedAt,
  onBalanceChange,
  onRemove,
}: {
  programId: string;
  balance: number;
  lastSyncedAt?: string | null;
  onBalanceChange: (v: number, syncedAt: string) => void;
  onRemove: () => void;
}) {
  const meta = getProgramMeta(programId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(balance));
  const [awaitingPaste, setAwaitingPaste] = useState(false);
  const [pasteError, setPasteError] = useState("");
  const stale = isStale(lastSyncedAt);
  const balanceUrl = PROGRAM_BALANCE_URLS[programId];

  function commit(value?: string) {
    const raw = (value ?? draft).replace(/[^0-9]/g, "");
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 0) onBalanceChange(n, new Date().toISOString());
    else setDraft(String(balance));
    setEditing(false);
    setAwaitingPaste(false);
    setPasteError("");
  }

  async function handlePaste() {
    setPasteError("");
    try {
      const text = await navigator.clipboard.readText();
      const match = text.replace(/,/g, "").match(/\d+/);
      if (match) {
        setDraft(match[0]);
        setEditing(true);
        setAwaitingPaste(false);
      } else {
        setPasteError("No number found in clipboard");
      }
    } catch {
      setPasteError("Allow clipboard access to use this feature");
    }
  }

  function openBalancePage() {
    if (balanceUrl) {
      window.open(balanceUrl, "_blank", "noopener,noreferrer");
      setAwaitingPaste(true);
    }
  }

  return (
    <div className={`py-3.5 border-b border-navy/5 last:border-0 ${stale ? "opacity-100" : ""}`}>
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
          style={{ background: meta?.color ?? "#64748b" }}
        >
          {meta?.iconLetter ?? programId[0].toUpperCase()}
        </div>

        {/* Name + sync status */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy truncate">{meta?.shortName ?? programId}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {stale && lastSyncedAt !== undefined && (
              <AlertTriangle size={10} className="text-amber-400 shrink-0" />
            )}
            <p className={`text-xs ${stale ? "text-amber-500" : "text-text-muted"}`}>
              {formatLastSynced(lastSyncedAt)}
            </p>
          </div>
        </div>

        {/* Balance editor */}
        {editing ? (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              className="w-28 text-right text-sm font-semibold text-navy bg-navy/5 border border-navy/15 rounded-lg px-2 py-1.5 outline-none focus:border-coral/40"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => commit()}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") { setEditing(false); setDraft(String(balance)); setAwaitingPaste(false); }
              }}
            />
            <button
              onClick={() => commit()}
              className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer shrink-0"
            >
              <Check size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setEditing(true); setDraft(String(balance)); }}
            className="flex items-center gap-1.5 text-sm font-bold text-navy hover:text-coral transition-colors cursor-pointer group"
          >
            <span>{balance.toLocaleString("en-US")}</span>
            <Edit3 size={11} className="text-text-muted group-hover:text-coral transition-colors" />
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 ml-1">
          {balanceUrl && (
            <button
              onClick={openBalancePage}
              title="Open balance page"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-coral hover:bg-coral/8 transition-colors cursor-pointer"
            >
              <ExternalLink size={13} />
            </button>
          )}
          <button
            onClick={handlePaste}
            title="Paste balance from clipboard"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-coral hover:bg-coral/8 transition-colors cursor-pointer"
          >
            <Clipboard size={13} />
          </button>
          <button
            onClick={onRemove}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Awaiting paste helper */}
      {awaitingPaste && !editing && (
        <div className="mt-2 ml-12 flex items-center gap-2 text-xs text-coral bg-coral/8 border border-coral/15 rounded-lg px-3 py-2">
          <Clipboard size={11} />
          <span>Copy your balance on that page, then click the clipboard icon here to paste it.</span>
          <button onClick={() => setAwaitingPaste(false)} className="ml-auto text-coral/60 hover:text-coral cursor-pointer">
            <X size={11} />
          </button>
        </div>
      )}

      {pasteError && (
        <p className="mt-1.5 ml-12 text-xs text-amber-500">{pasteError}</p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sync status banner
───────────────────────────────────────────── */
function SyncStatusBanner({ programs }: { programs: ProgramBalance[] }) {
  const stalePrograms = programs.filter((p) => isStale(p.lastSyncedAt));

  function openAllStale() {
    stalePrograms.forEach((p, i) => {
      const url = PROGRAM_BALANCE_URLS[p.programId];
      if (url) {
        setTimeout(() => window.open(url, "_blank", "noopener,noreferrer"), i * 800);
      }
    });
  }

  if (programs.length === 0) return null;

  if (stalePrograms.length === 0) {
    return (
      <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4">
        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <Check size={12} className="text-emerald-600" />
        </div>
        <p className="text-sm font-medium text-emerald-700">All balances are up to date</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
      <div className="flex items-center gap-2.5">
        <AlertTriangle size={15} className="text-amber-500 shrink-0" />
        <p className="text-sm font-medium text-amber-800">
          {stalePrograms.length} balance{stalePrograms.length > 1 ? "s" : ""} need{stalePrograms.length === 1 ? "s" : ""} updating
        </p>
      </div>
      <button
        onClick={openAllStale}
        className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
      >
        <RefreshCw size={11} />
        Sync all
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
   Direct Sync Section
───────────────────────────────────────────── */
function DirectSyncSection({
  programs,
  onToast,
}: {
  programs: ProgramBalance[];
  onToast: (msg: string) => void;
}) {
  function openAll() {
    const urls = programs
      .map((p) => PROGRAM_BALANCE_URLS[p.programId])
      .filter(Boolean);
    if (urls.length === 0) {
      onToast("No programs added yet");
      return;
    }
    urls.forEach((url) => window.open(url, "_blank", "noopener,noreferrer"));
    onToast(`Opened ${urls.length} balance page${urls.length !== 1 ? "s" : ""}`);
  }

  if (programs.length === 0) {
    return (
      <p className="text-sm text-text-muted italic">
        Add programs above to see quick-sync links.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-muted leading-relaxed">
        Open each program&apos;s official page to check your current balance, then tap ✏️ above to update it here.
      </p>
      <div className="flex flex-wrap gap-2">
        {programs.map((p) => {
          const url = PROGRAM_BALANCE_URLS[p.programId];
          const name = getProgramName(p.programId);
          const color = getProgramColor(p.programId);
          if (!url) return null;
          return (
            <a
              key={p.programId}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-opacity hover:opacity-70"
              style={{ borderColor: color, color }}
            >
              <ExternalLink size={11} />
              {name}
            </a>
          );
        })}
      </div>
      {programs.length > 1 && (
        <button
          onClick={openAll}
          className="flex items-center gap-1.5 text-sm font-semibold text-coral hover:text-coral/80 transition-colors cursor-pointer"
        >
          <ExternalLink size={13} />
          Open all {programs.length} balance pages
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");

  // Load data
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      setUser(u);
      if (u) {
        // Try loading from Supabase first
        const remoteProfile = await loadProfileFromSupabase(supabase, u.id);
        if (remoteProfile) {
          const merged = { ...remoteProfile, preferences: remoteProfile.preferences ?? DEFAULT_PREFERENCES };
          setProfile(merged);
          saveUserProfile(merged); // keep localStorage in sync
          return;
        }
      }
      // Fallback to localStorage
      const p = getUserProfile();
      setProfile(p ? { ...p, preferences: p.preferences ?? DEFAULT_PREFERENCES }
        : { homeAirport: null, programs: [], preferences: DEFAULT_PREFERENCES });
    });
  }, []);

  function save(updated: UserProfile) {
    setProfile(updated);
    saveUserProfile(updated);
    setToast("Changes saved");
    // Sync to Supabase if signed in
    if (user) {
      const supabase = createClient();
      saveProfileToSupabase(supabase, user.id, updated).catch(console.error);
    }
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
  const displayName = user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "Your Profile";
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

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
                  onBlur={async () => {
                    if (draftName.trim() && user) {
                      const supabase = createClient();
                      await supabase.auth.updateUser({ data: { name: draftName.trim() } });
                      setUser((u) => u ? { ...u, user_metadata: { ...u.user_metadata, name: draftName.trim() } } : u);
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
                onClick={() => { setDraftName(displayName); setEditingName(true); }}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <h1 className="text-2xl font-bold text-navy group-hover:text-coral transition-colors">
                  {displayName}
                </h1>
                <Edit3 size={15} className="text-text-muted group-hover:text-coral transition-colors" />
              </button>
            )}
            <p className="text-sm text-text-muted mt-0.5">{user?.email}</p>
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
          subtitle="Tap ✏️ to edit · ↗ to open balance page · 📋 to paste from clipboard"
        >
          <SyncStatusBanner programs={profile.programs} />

          {profile.programs.length === 0 ? (
            <p className="text-sm text-text-muted italic">No programs added yet.</p>
          ) : (
            <div>
              {profile.programs.map((p) => (
                <ProgramRow
                  key={p.programId}
                  programId={p.programId}
                  balance={p.balance}
                  lastSyncedAt={p.lastSyncedAt}
                  onBalanceChange={(v, syncedAt) =>
                    updatePrograms(
                      profile.programs.map((x) =>
                        x.programId === p.programId
                          ? { ...x, balance: v, lastSyncedAt: syncedAt }
                          : x
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
              updatePrograms([...profile.programs, { programId: id, balance: 0, lastSyncedAt: null }])
            }
          />
        </Section>

        {/* ── Quick Balance Links ── */}
        <Section
          icon={<ExternalLink size={17} />}
          title="Quick Balance Links"
          subtitle="Open each program's official page to check and update your balance"
        >
          <DirectSyncSection
            programs={profile.programs}
            onToast={(msg) => setToast(msg)}
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
                <p className="text-sm text-text-muted">{displayName}</p>
              </div>
              <button
                onClick={() => { setDraftName(displayName); setEditingName(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="text-xs font-semibold text-coral hover:text-coral/70 transition-colors cursor-pointer"
              >
                Edit
              </button>
            </div>
            <div className="border-t border-navy/5" />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-navy">Email</p>
                <p className="text-sm text-text-muted">{user?.email ?? "—"}</p>
              </div>
            </div>
            <div className="border-t border-navy/5" />
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                localStorage.clear();
                window.location.href = "/";
              }}
              className="text-sm font-semibold text-red-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </Section>

      </main>

      <Footer />

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
