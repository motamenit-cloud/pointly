"use client";

import { Plane } from "lucide-react";

export function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      {/* Logo */}
      <div
        className="animate-fade-in-up mb-8"
        style={{ animationDelay: "0s" }}
      >
        <span className="text-2xl font-bold text-navy">
          Point<span className="text-coral">.ly</span>
        </span>
      </div>

      {/* Icon */}
      <div
        className="animate-fade-in-up w-20 h-20 rounded-full bg-sky-light flex items-center justify-center mb-8"
        style={{ animationDelay: "0.1s" }}
      >
        <Plane size={32} className="text-navy -rotate-45" />
      </div>

      {/* Headline */}
      <h1
        className="animate-fade-in-up text-3xl md:text-4xl font-bold text-navy text-center max-w-md"
        style={{ animationDelay: "0.2s" }}
      >
        Let&apos;s personalize your experience
      </h1>

      {/* Subtitle */}
      <p
        className="animate-fade-in-up text-lg text-text-secondary text-center max-w-md mt-4"
        style={{ animationDelay: "0.3s" }}
      >
        We&apos;ll match you with the best points deals based on your home
        airport and loyalty programs.
      </p>

      {/* CTA */}
      <button
        onClick={onNext}
        className="animate-fade-in-up mt-10 bg-coral text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-coral-dark transition-colors cursor-pointer"
        style={{ animationDelay: "0.4s" }}
      >
        Get Started
      </button>

      {/* Muted note */}
      <p
        className="animate-fade-in-up text-sm text-text-muted mt-4"
        style={{ animationDelay: "0.5s" }}
      >
        Takes less than 1 minute
      </p>
    </div>
  );
}
