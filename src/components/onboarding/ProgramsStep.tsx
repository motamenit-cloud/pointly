"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { POINTS_PROGRAMS, type PointsProgram } from "./airports";

interface ProgramsStepProps {
  selectedPrograms: string[];
  onToggle: (id: string) => void;
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
  selectedPrograms,
  onToggle,
  onNext,
  onBack,
}: ProgramsStepProps) {
  const hasSelections = selectedPrograms.length > 0;

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
          Select all that apply. You can always add more later.
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
                  {programs.map((program) => (
                    <ProgramCard
                      key={program.id}
                      program={program}
                      selected={selectedPrograms.includes(program.id)}
                      onToggle={() => onToggle(program.id)}
                    />
                  ))}
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
  onToggle,
}: {
  program: PointsProgram;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={selected}
      className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-center ${
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

      {/* Icon circle */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
        style={{ backgroundColor: program.color }}
      >
        {program.iconLetter}
      </div>

      {/* Name */}
      <div>
        <p className="text-sm font-semibold text-navy">{program.shortName}</p>
        <p className="text-xs text-text-muted mt-0.5 leading-tight">
          {program.name}
        </p>
      </div>
    </button>
  );
}
