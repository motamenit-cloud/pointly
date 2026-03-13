"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { AirlineLogo } from "./AirlineLogo";

const airlines = [
  { code: "UA", name: "United Airlines", color: "#002244" },
  { code: "AA", name: "American Airlines", color: "#B6322D" },
  { code: "DL", name: "Delta Air Lines", color: "#003366" },
  { code: "BA", name: "British Airways", color: "#075AAA" },
  { code: "VS", name: "Virgin Atlantic", color: "#B80024" },
  { code: "AF", name: "Air France", color: "#002157" },
];

const stopOptions = ["Nonstop", "1 stop", "2+ stops"];
const cabinOptions = ["Economy", "Premium Economy", "Business", "First"];

export function SearchFilters() {
  const [showMobile, setShowMobile] = useState(false);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [selectedCabins, setSelectedCabins] = useState<string[]>(["Business"]);

  function toggleFilter(
    arr: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
  ) {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  }

  const filterContent = (
    <div className="space-y-6">
      {/* Stops */}
      <div>
        <h4 className="text-sm font-bold text-navy mb-2.5">Stops</h4>
        <div className="space-y-2">
          {stopOptions.map((stop) => (
            <label
              key={stop}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedStops.includes(stop)}
                onChange={() => toggleFilter(selectedStops, setSelectedStops, stop)}
                className="w-4 h-4 rounded border-navy/20 text-coral accent-coral cursor-pointer"
              />
              <span className="text-sm text-text-secondary group-hover:text-navy transition-colors">
                {stop}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Airlines */}
      <div>
        <h4 className="text-sm font-bold text-navy mb-2.5">Airlines</h4>
        <div className="space-y-2">
          {airlines.map((airline) => (
            <label
              key={airline.code}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedAirlines.includes(airline.code)}
                onChange={() =>
                  toggleFilter(selectedAirlines, setSelectedAirlines, airline.code)
                }
                className="w-4 h-4 rounded border-navy/20 text-coral accent-coral cursor-pointer"
              />
              <AirlineLogo code={airline.code} size={20} />
              <span className="text-sm text-text-secondary group-hover:text-navy transition-colors">
                {airline.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Cabin */}
      <div>
        <h4 className="text-sm font-bold text-navy mb-2.5">Cabin</h4>
        <div className="space-y-2">
          {cabinOptions.map((cabin) => (
            <label
              key={cabin}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedCabins.includes(cabin)}
                onChange={() =>
                  toggleFilter(selectedCabins, setSelectedCabins, cabin)
                }
                className="w-4 h-4 rounded border-navy/20 text-coral accent-coral cursor-pointer"
              />
              <span className="text-sm text-text-secondary group-hover:text-navy transition-colors">
                {cabin}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Departure time */}
      <div>
        <h4 className="text-sm font-bold text-navy mb-2.5">Departure time</h4>
        <div className="grid grid-cols-2 gap-2">
          {["Morning", "Afternoon", "Evening", "Red-eye"].map((time) => (
            <button
              key={time}
              className="px-3 py-2 rounded-lg text-xs font-medium border border-navy/10 text-text-secondary hover:border-coral hover:text-coral transition-colors cursor-pointer"
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Points programs */}
      <div>
        <h4 className="text-sm font-bold text-navy mb-2.5">Your programs</h4>
        <div className="space-y-2">
          {["Chase Ultimate Rewards", "Amex Membership Rewards", "Citi ThankYou", "Capital One Miles"].map(
            (program) => (
              <label
                key={program}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-navy/20 text-coral accent-coral cursor-pointer"
                />
                <span className="text-sm text-text-secondary group-hover:text-navy transition-colors">
                  {program}
                </span>
              </label>
            ),
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-20 bg-white rounded-2xl border border-navy/8 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-navy">Filters</h3>
            <button className="text-xs text-coral font-medium hover:underline cursor-pointer">
              Clear all
            </button>
          </div>
          {filterContent}
        </div>
      </aside>

      {/* Mobile filter button */}
      <button
        onClick={() => setShowMobile(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-navy text-white p-4 rounded-full shadow-lg hover:bg-navy-dark transition-colors cursor-pointer"
      >
        <SlidersHorizontal size={20} />
      </button>

      {/* Mobile filter drawer */}
      {showMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowMobile(false)}
          />
          <div className="relative ml-auto w-80 max-w-[85vw] bg-white h-full overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-navy">Filters</h3>
              <button
                onClick={() => setShowMobile(false)}
                className="text-navy p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            {filterContent}
            <button
              onClick={() => setShowMobile(false)}
              className="mt-6 w-full bg-navy text-white py-3 rounded-xl font-semibold hover:bg-navy-dark transition-colors cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
}
