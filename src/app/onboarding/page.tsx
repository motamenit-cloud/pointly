"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { AirportStep } from "@/components/onboarding/AirportStep";
import { ProgramsStep } from "@/components/onboarding/ProgramsStep";
import { CompleteStep } from "@/components/onboarding/CompleteStep";

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [selectedAirport, setSelectedAirport] = useState<string | null>(null);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);

  const goNext = useCallback(() => {
    setDirection("forward");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  const goBack = useCallback(() => {
    setDirection("back");
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const toggleProgram = useCallback((id: string) => {
    setSelectedPrograms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }, []);

  const handleFinish = useCallback(() => {
    router.push("/");
  }, [router]);

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
              selectedPrograms={selectedPrograms}
              onToggle={toggleProgram}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {step === 3 && (
            <CompleteStep
              airportCode={selectedAirport}
              programCount={selectedPrograms.length}
              onFinish={handleFinish}
            />
          )}
        </div>
      </div>
    </div>
  );
}
