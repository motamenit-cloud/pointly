"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { AirportStep } from "@/components/onboarding/AirportStep";
import { ProgramsStep } from "@/components/onboarding/ProgramsStep";
import { CompleteStep } from "@/components/onboarding/CompleteStep";
import { saveUserProfile, type ProgramBalance } from "@/lib/userProfile";

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [selectedAirport, setSelectedAirport] = useState<string | null>(null);
  const [programBalances, setProgramBalances] = useState<ProgramBalance[]>([]);

  const goNext = useCallback(() => {
    setDirection("forward");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  const goBack = useCallback(() => {
    setDirection("back");
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const toggleProgram = useCallback((id: string) => {
    setProgramBalances((prev) => {
      const exists = prev.find((p) => p.programId === id);
      if (exists) return prev.filter((p) => p.programId !== id);
      return [...prev, { programId: id, balance: 0 }];
    });
  }, []);

  const handleBalanceChange = useCallback((id: string, balance: number) => {
    setProgramBalances((prev) =>
      prev.map((p) => (p.programId === id ? { ...p, balance } : p)),
    );
  }, []);

  const handleFinish = useCallback(() => {
    saveUserProfile({
      homeAirport: selectedAirport,
      programs: programBalances,
    });
    router.push("/");
  }, [router, selectedAirport, programBalances]);

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />

      <div className="relative min-h-screen">
        <div key={step} className={`animate-step-${direction}`}>
          {step === 0 && <WelcomeStep onNext={goNext} />}
          {step === 1 && (
            <AirportStep
              selectedAirport={selectedAirport}
              onSelect={setSelectedAirport}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {step === 2 && (
            <ProgramsStep
              programBalances={programBalances}
              onToggle={toggleProgram}
              onBalanceChange={handleBalanceChange}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {step === 3 && (
            <CompleteStep
              airportCode={selectedAirport}
              programCount={programBalances.length}
              onFinish={handleFinish}
            />
          )}
        </div>
      </div>
    </div>
  );
}
