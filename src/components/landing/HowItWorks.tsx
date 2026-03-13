import { PlaneTakeoff } from "lucide-react";
import { ScrollClouds } from "@/components/ui/ScrollClouds";

/* Custom filled icons matching the mockup style */
function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} width={32} height={32}>
      {/* Card body */}
      <rect x="2" y="7" width="28" height="19" rx="3" />
      {/* Magnetic stripe */}
      <rect x="2" y="11" width="28" height="4" fill="white" opacity="0.3" />
      {/* Chip */}
      <rect x="6" y="17" width="6" height="4" rx="1" fill="white" opacity="0.4" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} width={32} height={32}>
      {/* Magnifying glass circle */}
      <circle cx="14" cy="14" r="9" stroke="currentColor" strokeWidth="3" />
      {/* Handle */}
      <line x1="21" y1="21" x2="28" y2="28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* Search lines inside glass */}
      <line x1="9" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="9" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function LaptopCheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} width={32} height={32}>
      {/* Laptop screen */}
      <rect x="4" y="5" width="24" height="16" rx="2" />
      {/* Screen content - checkmark */}
      <polyline
        points="11,14 14.5,17.5 21,11"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Laptop base */}
      <path d="M1 23 L4 21 L28 21 L31 23 L31 24 C31 25.1 30.1 26 29 26 L3 26 C1.9 26 1 25.1 1 24 Z" />
    </svg>
  );
}

const steps = [
  {
    number: 1,
    icon: CreditCardIcon,
    title: "Link your accounts",
    description:
      "Connect your credit cards and airline loyalty programs to track your points and miles.",
  },
  {
    number: 2,
    icon: SearchIcon,
    title: "Search & Compare",
    description:
      "Use natural language or traditional search to find flights. Our AI compares deals across all your points programs.",
  },
  {
    number: 3,
    icon: LaptopCheckIcon,
    title: "Book & Travel",
    description:
      "Select your flight and let our agentic AI handle the booking process seamlessly.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative bg-sky-light py-20 md:py-28 overflow-hidden">
      <ScrollClouds />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-navy">
            How it Works
          </h2>
          <p className="mt-3 text-text-secondary text-lg">
            Get the best flight deals in 3 simple steps
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Dashed connector line — desktop only */}
          <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-0 border-t-2 border-dashed border-navy/20" />
          {/* Airplane on the connector */}
          <div className="hidden md:block absolute top-[40px] right-[8%] z-10">
            <PlaneTakeoff size={24} className="text-navy/40" />
          </div>

          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              {/* Step circle with icon */}
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-lg">
                <step.icon className="text-navy" />
                {/* Number badge */}
                <span className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-coral text-white text-sm font-bold flex items-center justify-center shadow-sm">
                  {step.number}
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold text-navy">
                {step.title}
              </h3>
              <p className="mt-2 text-text-secondary leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
