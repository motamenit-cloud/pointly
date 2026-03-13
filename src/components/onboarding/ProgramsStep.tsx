"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { POINTS_PROGRAMS, type PointsProgram } from "./airports";
import type { ProgramBalance } from "@/lib/userProfile";

interface ProgramsStepProps {
  programBalances: ProgramBalance[];
  onToggle: (id: string) => void;
  onBalanceChange: (id: string, balance: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const CATEGORIES: {
  key: PointsProgram["category"];
  label: string;
}[] = [
  { key: "credit-card", label: "Credit Card Points" },
  { key: "airline", label: "Airline Miles" },
  { key: "hotel", label: "Hotel Points" },
];

export function ProgramsStep({
  programBalances,
  onToggle,
  onBalanceChange,
  onNext,
  onBack,
}: ProgramsStepProps) {
  const hasSelections = programBalances.length > 0;
  const selectedIds = new Set(programBalances.map((p) => p.programId));

  return (
    <div className="flex flex-col min-h-screen px-6 py-12">
      {/* Back */}
      <div className="max-w-2xl mx-auto w-full">
        <button
          onClick={onBack}
          className="animate-fade-in-up flex items-center gap-1.5 text-sm text-text-secondary hover:text-navy transition-colors cursor-pointer mb-8"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto w-full flex-1">
        <h2
          className="animate-fade-in-up text-2xl md:text-3xl font-bold text-navy text-center"
          style={{ animationDelay: "0.05s" }}
        >
          Which points programs do you have?
        </h2>
        <p
          className="animate-fade-in-up text-text-secondary text-center mt-2 mb-8"
          style={{ animationDelay: "0.1s" }}
        >
          Select your programs and enter your balances for personalized results.
        </p>

        {/* Categories */}
        <div
          className="animate-fade-in-up space-y-8"
          style={{ animationDelay: "0.15s" }}
        >
          {CATEGORIES.map((cat) => {
            const programs = POINTS_PROGRAMS.filter(
              (p) => p.category === cat.key,
            );
            return (
              <div key={cat.key}>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                  {cat.label}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {programs.map((program) => {
                    const selected = selectedIds.has(program.id);
                    const balance =
                      programBalances.find((p) => p.programId === program.id)
                        ?.balance ?? 0;
                    return (
                      <ProgramCard
                        key={program.id}
                        program={program}
                        selected={selected}
                        balance={balance}
                        onToggle={() => onToggle(program.id)}
                        onBalanceChange={(val) =>
                          onBalanceChange(program.id, val)
                        }
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="max-w-2xl mx-auto w-full mt-8 pb-4">
        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2 bg-coral text-white py-4 rounded-xl text-base font-semibold hover:bg-coral-dark transition-colors cursor-pointer"
        >
          {hasSelections ? "Continue" : "Skip for now"}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

/* ── Program card ── */
function ProgramCard({
  program,
  selected,
  balance,
  onToggle,
  onBalanceChange,
}: {
  program: PointsProgram;
  selected: boolean;
  balance: number;
  onToggle: () => void;
  onBalanceChange: (val: number) => void;
}) {
  return (
    <div
      className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200 text-center ${
        selected
          ? "border-coral bg-coral/5 shadow-sm"
          : "border-navy/8 bg-white hover:border-navy/20"
      }`}
    >
      {/* Selected check */}
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-coral flex items-center justify-center">
          <Check size={12} className="text-white" />
        </div>
      )}

      {/* Clickable area for toggling */}
      <button
        onClick={onToggle}
        className="flex flex-col items-center gap-2.5 cursor-pointer w-full"
      >
        {/* Icon circle */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: program.color }}
        >
          {program.iconLetter}
        </div>

        {/* Name */}
        <div>
          <p className="text-sm font-semibold text-navy">
            {program.shortName}
          </p>
          <p className="text-xs text-text-muted mt-0.5 leading-tight">
            {program.name}
          </p>
        </div>
      </button>

      {/* Balance input (shown when selected) */}
      {selected && (
        <div className="w-full mt-1">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Balance"
            value={balance || ""}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              onBalanceChange(val);
            }}
            className="w-full text-center text-sm font-medium text-navy bg-white border border-navy/15 rounded-lg px-2 py-1.5 outline-none focus:border-coral transition-colors"
          />
          <p className="text-[10px] text-text-muted mt-1">points/miles</p>
        </div>
      )}
    </div>
  );
}
