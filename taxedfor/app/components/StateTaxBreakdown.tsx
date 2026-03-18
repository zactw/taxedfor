"use client";

import { useState, useEffect } from "react";

interface StateTaxBreakdownProps {
  stateTax: number;
  stateCode?: string;
}

interface StateLineItem {
  emoji: string;
  name: string;
  percent: number;
}

interface StateData {
  name: string;
  items: StateLineItem[];
}

const STATE_DATA: Record<string, StateData> = {
  CA: {
    name: "California",
    items: [
      { emoji: "📚", name: "K-12 Education", percent: 38.0 },
      { emoji: "🏥", name: "Medi-Cal (Medicaid)", percent: 18.0 },
      { emoji: "🎓", name: "Higher Education (UC/CSU)", percent: 8.0 },
      { emoji: "🛣️", name: "Transportation & Highways", percent: 7.5 },
      { emoji: "⛓️", name: "Corrections & Rehab", percent: 6.5 },
      { emoji: "🌿", name: "Natural Resources & Parks", percent: 4.0 },
      { emoji: "🏠", name: "Housing & Community Dev", percent: 3.5 },
      { emoji: "🏛️", name: "General Government", percent: 14.5 },
    ],
  },
  TX: {
    name: "Texas",
    items: [
      { emoji: "📚", name: "K-12 Education", percent: 34.0 },
      { emoji: "🏥", name: "Health & Human Services", percent: 24.0 },
      { emoji: "🛣️", name: "Transportation (TxDOT)", percent: 12.0 },
      { emoji: "🎓", name: "Higher Education", percent: 9.0 },
      { emoji: "⛓️", name: "Criminal Justice (TDCJ)", percent: 6.5 },
      { emoji: "🌾", name: "Agriculture & Rural Dev", percent: 2.5 },
      { emoji: "🏛️", name: "General Government", percent: 12.0 },
    ],
  },
  FL: {
    name: "Florida",
    items: [
      { emoji: "📚", name: "K-12 Education", percent: 31.0 },
      { emoji: "🏥", name: "Medicaid & Health", percent: 27.0 },
      { emoji: "🛣️", name: "Transportation (FDOT)", percent: 11.0 },
      { emoji: "🎓", name: "Higher Education", percent: 8.5 },
      { emoji: "⛓️", name: "Corrections (FDC)", percent: 5.5 },
      { emoji: "🌊", name: "Environmental Protection", percent: 3.5 },
      { emoji: "🏛️", name: "General Government", percent: 13.5 },
    ],
  },
  NY: {
    name: "New York",
    items: [
      { emoji: "🏥", name: "Medicaid & Health", percent: 32.0 },
      { emoji: "📚", name: "K-12 Education", percent: 25.0 },
      { emoji: "🎓", name: "Higher Education (SUNY/CUNY)", percent: 7.0 },
      { emoji: "🛣️", name: "Transportation (MTA/DOT)", percent: 9.0 },
      { emoji: "🏠", name: "Housing & Community Dev", percent: 5.0 },
      { emoji: "⛓️", name: "Corrections (DOCCS)", percent: 5.5 },
      { emoji: "🌿", name: "Environment & Parks", percent: 2.5 },
      { emoji: "🏛️", name: "General Government", percent: 14.0 },
    ],
  },
  PA: {
    name: "Pennsylvania",
    items: [
      { emoji: "🏥", name: "Human Services (Medicaid)", percent: 31.0 },
      { emoji: "📚", name: "K-12 Education", percent: 27.0 },
      { emoji: "🛣️", name: "Transportation (PennDOT)", percent: 12.0 },
      { emoji: "🎓", name: "Higher Education", percent: 5.5 },
      { emoji: "⛓️", name: "Corrections (DOC)", percent: 6.5 },
      { emoji: "🌿", name: "Environment & Natural Resources", percent: 2.5 },
      { emoji: "🏛️", name: "General Government", percent: 15.5 },
    ],
  },
  IL: {
    name: "Illinois",
    items: [
      { emoji: "📚", name: "K-12 Education", percent: 29.0 },
      { emoji: "🏥", name: "Healthcare & Family Svcs", percent: 26.0 },
      { emoji: "🛣️", name: "Transportation (IDOT)", percent: 10.0 },
      { emoji: "🎓", name: "Higher Education", percent: 7.5 },
      { emoji: "⛓️", name: "Corrections (IDOC)", percent: 7.0 },
      { emoji: "🏠", name: "Housing & Community Svcs", percent: 3.5 },
      { emoji: "🏛️", name: "General Government", percent: 17.0 },
    ],
  },
  OH: {
    name: "Ohio",
    items: [
      { emoji: "🏥", name: "Medicaid & Health", percent: 33.0 },
      { emoji: "📚", name: "K-12 Education", percent: 26.0 },
      { emoji: "🛣️", name: "Transportation (ODOT)", percent: 10.0 },
      { emoji: "🎓", name: "Higher Education", percent: 6.5 },
      { emoji: "⛓️", name: "Rehabilitation & Corrections", percent: 5.5 },
      { emoji: "🌾", name: "Agriculture & Natural Resources", percent: 2.0 },
      { emoji: "🏛️", name: "General Government", percent: 17.0 },
    ],
  },
  GA: {
    name: "Georgia",
    items: [
      { emoji: "📚", name: "K-12 Education", percent: 33.0 },
      { emoji: "🏥", name: "Medicaid & Health", percent: 22.0 },
      { emoji: "🛣️", name: "Transportation (GDOT)", percent: 11.0 },
      { emoji: "🎓", name: "Higher Education (USG)", percent: 9.0 },
      { emoji: "⛓️", name: "Corrections (GDC)", percent: 6.5 },
      { emoji: "🌿", name: "Natural Resources", percent: 2.5 },
      { emoji: "🏛️", name: "General Government", percent: 16.0 },
    ],
  },
  NC: {
    name: "North Carolina",
    items: [
      { emoji: "📚", name: "K-12 Education", percent: 34.0 },
      { emoji: "🏥", name: "Health & Human Services", percent: 23.0 },
      { emoji: "🛣️", name: "Transportation (NCDOT)", percent: 11.0 },
      { emoji: "🎓", name: "Higher Education (UNC System)", percent: 9.5 },
      { emoji: "⛓️", name: "Corrections (NCDPS)", percent: 5.5 },
      { emoji: "🌿", name: "Environment & Natural Resources", percent: 2.5 },
      { emoji: "🏛️", name: "General Government", percent: 14.5 },
    ],
  },
  MI: {
    name: "Michigan",
    items: [
      { emoji: "📚", name: "K-12 Education (School Aid)", percent: 31.0 },
      { emoji: "🏥", name: "Medicaid & Health", percent: 27.0 },
      { emoji: "🛣️", name: "Transportation (MDOT)", percent: 10.5 },
      { emoji: "🎓", name: "Higher Education", percent: 7.5 },
      { emoji: "⛓️", name: "Corrections (MDOC)", percent: 6.0 },
      { emoji: "🌊", name: "Environment, Great Lakes & Energy", percent: 3.0 },
      { emoji: "🏛️", name: "General Government", percent: 15.0 },
    ],
  },
};

const SUPPORTED_STATES = Object.keys(STATE_DATA);

function formatDollars(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatCompact(n: number): string {
  if (n < 1) return `${(n * 100).toFixed(1)}¢`;
  if (n < 100) return `$${n.toFixed(2)}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function StateTaxBreakdown({ stateTax, stateCode }: StateTaxBreakdownProps) {
  const [isPro, setIsPro] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setIsPro(localStorage.getItem("isPro") === "true");
  }, []);

  const code = stateCode?.toUpperCase();
  const stateData = code ? STATE_DATA[code] : null;
  const isSupported = !!stateData;

  const showFull = isPro && isSupported;

  // If no state tax info at all, don't render
  if (!code && !stateTax) return null;

  function renderBreakdown(blurred = false) {
    if (!stateData) return null;
    const maxPercent = Math.max(...stateData.items.map((i) => i.percent));

    return (
      <div className={blurred ? "blur-sm pointer-events-none select-none" : ""}>
        <div className="space-y-2">
          {stateData.items.map((item) => {
            const amount = (stateTax * item.percent) / 100;
            return (
              <div
                key={item.name}
                className="flex items-center gap-3 py-2.5 px-3 bg-gray-900/60 rounded-lg border border-gray-800/60"
              >
                <span className="text-xl flex-shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-200">{item.name}</p>
                    <span className="text-sm font-bold text-purple-400 flex-shrink-0">
                      {formatCompact(amount)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${(item.percent / maxPercent) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{item.percent.toFixed(1)}% of state budget</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-gray-700 text-xs text-center mt-4">
          Approximate percentages based on {stateData.name} FY2024 enacted budget.
        </p>
      </div>
    );
  }

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-gray-800" />
        <h2 className="text-white font-bold text-lg whitespace-nowrap">
          🗺️ State Tax Breakdown {code ? `(${code})` : ""}
        </h2>
        <div className="h-px flex-1 bg-gray-800" />
      </div>

      <div className="bg-gray-900/40 border border-purple-800/30 rounded-2xl p-5">
        {/* State total */}
        <div className="text-center mb-5">
          <p className="text-gray-400 text-sm">Your state tax withholding</p>
          <p className="text-3xl font-bold text-purple-400">{formatDollars(stateTax)}</p>
          {stateData && <p className="text-gray-500 text-sm mt-1">{stateData.name}</p>}
        </div>

        {/* Not supported state */}
        {!isSupported && code && (
          <div className="text-center py-6 border border-gray-800 rounded-xl">
            <span className="text-4xl block mb-3">🏗️</span>
            <p className="text-gray-400 font-semibold">
              Your state ({code}) breakdown coming soon
            </p>
            <p className="text-gray-600 text-sm mt-1">
              We&apos;re adding all 50 states — check back soon!
            </p>
          </div>
        )}

        {/* Full pro view */}
        {isSupported && showFull && renderBreakdown(false)}

        {/* Preview mode (locked) */}
        {isSupported && !showFull && (
          <div>
            {!showPreview ? (
              <div className="text-center">
                <button
                  onClick={() => setShowPreview(true)}
                  className="inline-flex items-center gap-2 bg-purple-900/40 hover:bg-purple-900/60 border border-purple-700/50 text-purple-300 font-semibold py-3 px-6 rounded-xl transition-all duration-150"
                >
                  <span>👁️</span>
                  Preview State Breakdown (Pro)
                </button>
                <p className="text-gray-600 text-xs mt-2">See a preview with upgrade option</p>
              </div>
            ) : (
              <div className="relative">
                {renderBreakdown(true)}
                {/* Lock overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/70 rounded-xl">
                  <span className="text-4xl mb-3">🔒</span>
                  <p className="text-white font-bold text-lg mb-1">Pro Feature</p>
                  <p className="text-gray-400 text-sm mb-4 text-center px-4">
                    Unlock state breakdowns and more with TaxedFor Pro
                  </p>
                  <a
                    href="#stripe-checkout"
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-150"
                  >
                    ⭐ Upgrade — $4.99
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
