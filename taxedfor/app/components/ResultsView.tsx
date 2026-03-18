"use client";

import { useEffect, useState, useMemo } from "react";
import { W2Data } from "../page";

interface Props {
  data: W2Data;
  onReset: () => void;
}

// ─── Budget Data ──────────────────────────────────────────────────────────────

type BudgetCategory = "Mandatory" | "Defense" | "Non-Defense" | "Debt";

interface BudgetItem {
  emoji: string;
  name: string;
  description: string;
  /** Percentage of total federal outlays (~$6.75T FY2024) */
  percent: number;
  category: BudgetCategory;
}

const BUDGET_ITEMS: BudgetItem[] = [
  // ── Mandatory ──────────────────────────────────────────────────────────────
  {
    emoji: "👴",
    name: "Social Security (OASDI)",
    description: "Monthly retirement, survivor, and disability payments to ~70 million Americans.",
    percent: 20.0,
    category: "Mandatory",
  },
  {
    emoji: "🏥",
    name: "Medicare",
    description: "Federal health insurance for Americans 65+ and certain disabled individuals.",
    percent: 14.8,
    category: "Mandatory",
  },
  {
    emoji: "💊",
    name: "Medicaid & CHIP",
    description: "Health coverage for low-income adults, children, pregnant women, and people with disabilities.",
    percent: 9.1,
    category: "Mandatory",
  },
  {
    emoji: "🍎",
    name: "SNAP (Food Stamps)",
    description: "Nutrition assistance for ~42 million low-income Americans each month.",
    percent: 1.7,
    category: "Mandatory",
  },
  {
    emoji: "🏛️",
    name: "Federal Civilian Retirement",
    description: "Pension and disability payments for retired federal government employees.",
    percent: 2.3,
    category: "Mandatory",
  },
  {
    emoji: "🎖️",
    name: "Veterans Compensation & Pensions",
    description: "Disability compensation and pension payments to eligible military veterans.",
    percent: 2.1,
    category: "Mandatory",
  },
  {
    emoji: "🩺",
    name: "ACA Health Insurance Subsidies",
    description: "Premium tax credits helping individuals buy coverage on ACA marketplace exchanges.",
    percent: 1.3,
    category: "Mandatory",
  },
  {
    emoji: "💰",
    name: "Earned Income Tax Credit",
    description: "Refundable tax credit for low- and moderate-income working families.",
    percent: 1.0,
    category: "Mandatory",
  },
  {
    emoji: "♿",
    name: "Supplemental Security Income (SSI)",
    description: "Cash assistance to aged, blind, and disabled people with limited income.",
    percent: 0.9,
    category: "Mandatory",
  },
  {
    emoji: "👶",
    name: "Child Tax Credit (Refundable)",
    description: "Refundable portion of the Child Tax Credit for qualifying families.",
    percent: 0.5,
    category: "Mandatory",
  },
  {
    emoji: "📖",
    name: "Student Loan Subsidies",
    description: "Interest subsidies and income-driven repayment forgiveness for federal student loans.",
    percent: 0.4,
    category: "Mandatory",
  },
  {
    emoji: "📉",
    name: "Unemployment Insurance",
    description: "Temporary income support for workers who lose their jobs through no fault of their own.",
    percent: 0.4,
    category: "Mandatory",
  },
  {
    emoji: "👨‍👩‍👧",
    name: "TANF & Family Support",
    description: "Block grants to states for cash assistance and services for low-income families.",
    percent: 0.3,
    category: "Mandatory",
  },
  {
    emoji: "📦",
    name: "Other Mandatory Spending",
    description: "Flood insurance, deposit insurance, Pension Benefit Guaranty, and other entitlement programs.",
    percent: 4.4,
    category: "Mandatory",
  },

  // ── Defense ────────────────────────────────────────────────────────────────
  {
    emoji: "✈️",
    name: "Air Force & Space Force",
    description: "Personnel, aircraft, satellites, cyber operations, and ICBM forces.",
    percent: 3.2,
    category: "Defense",
  },
  {
    emoji: "⚓",
    name: "Navy & Marine Corps",
    description: "Aircraft carriers, submarines, destroyers, amphibious forces, and naval aviation.",
    percent: 3.1,
    category: "Defense",
  },
  {
    emoji: "🪖",
    name: "Army Operations & Personnel",
    description: "Ground forces, combat units, training, and Army installation operations.",
    percent: 2.7,
    category: "Defense",
  },
  {
    emoji: "🔬",
    name: "Defense Research & Development",
    description: "Advanced weapons R&D, DARPA projects, next-generation military technology.",
    percent: 1.8,
    category: "Defense",
  },
  {
    emoji: "🕵️",
    name: "Defense-Wide Agencies (NSA, DIA, etc.)",
    description: "Intelligence agencies, logistics commands, and joint Pentagon-wide programs.",
    percent: 1.8,
    category: "Defense",
  },
  {
    emoji: "☢️",
    name: "Nuclear Weapons (NNSA)",
    description: "Design, production, and maintenance of the U.S. nuclear stockpile.",
    percent: 0.3,
    category: "Defense",
  },
  {
    emoji: "🏗️",
    name: "Military Construction",
    description: "Building and modernizing bases, barracks, and facilities worldwide.",
    percent: 0.2,
    category: "Defense",
  },

  // ── Non-Defense Discretionary ──────────────────────────────────────────────
  {
    emoji: "🏥",
    name: "VA Healthcare",
    description: "Medical care, mental health, and rehabilitation for 9+ million enrolled veterans.",
    percent: 1.7,
    category: "Non-Defense",
  },
  {
    emoji: "🛣️",
    name: "Transportation (Highways, FAA, Amtrak)",
    description: "Federal Highway Administration, airports, air traffic control, and passenger rail.",
    percent: 1.6,
    category: "Non-Defense",
  },
  {
    emoji: "📚",
    name: "Education (K-12 & Pell Grants)",
    description: "Title I funding for low-income schools, Pell grants, and special education.",
    percent: 1.2,
    category: "Non-Defense",
  },
  {
    emoji: "🏠",
    name: "Housing Assistance (HUD)",
    description: "Section 8 vouchers, public housing, and community development grants.",
    percent: 1.1,
    category: "Non-Defense",
  },
  {
    emoji: "🔭",
    name: "NIH (Medical Research)",
    description: "National Institutes of Health funding for cancer, Alzheimer's, and disease research.",
    percent: 0.7,
    category: "Non-Defense",
  },
  {
    emoji: "🚀",
    name: "NASA",
    description: "Space exploration, Artemis moon program, ISS, and Earth science missions.",
    percent: 0.4,
    category: "Non-Defense",
  },
  {
    emoji: "🛂",
    name: "Border Patrol & ICE",
    description: "Customs and Border Protection, Immigration and Customs Enforcement operations.",
    percent: 0.4,
    category: "Non-Defense",
  },
  {
    emoji: "🌍",
    name: "Foreign Aid (USAID)",
    description: "Development assistance, humanitarian aid, and global health programs abroad.",
    percent: 0.4,
    category: "Non-Defense",
  },
  {
    emoji: "🔴",
    name: "Other Non-Defense Discretionary",
    description: "Courts, Congress, White House, and hundreds of smaller federal programs.",
    percent: 2.7,
    category: "Non-Defense",
  },
  {
    emoji: "🌾",
    name: "Agriculture & Farm Subsidies",
    description: "Crop insurance, conservation programs, rural development, and farm price supports.",
    percent: 0.3,
    category: "Non-Defense",
  },
  {
    emoji: "⚡",
    name: "Energy Dept (Non-Nuclear)",
    description: "Clean energy R&D, grid modernization, and energy efficiency programs.",
    percent: 0.3,
    category: "Non-Defense",
  },
  {
    emoji: "🆘",
    name: "FEMA & Disaster Relief",
    description: "Federal Emergency Management Agency response, recovery, and mitigation grants.",
    percent: 0.3,
    category: "Non-Defense",
  },
  {
    emoji: "🗺️",
    name: "State Dept & Embassies",
    description: "U.S. diplomatic missions, consular services, and international organizations.",
    percent: 0.2,
    category: "Non-Defense",
  },
  {
    emoji: "💼",
    name: "IRS & Treasury Administration",
    description: "Tax collection, financial crimes enforcement, and fiscal operations.",
    percent: 0.2,
    category: "Non-Defense",
  },
  {
    emoji: "👨‍👧",
    name: "Head Start & Early Childhood",
    description: "Preschool and family services for low-income children under age 5.",
    percent: 0.2,
    category: "Non-Defense",
  },
  {
    emoji: "🔫",
    name: "FBI & Federal Law Enforcement",
    description: "FBI, DEA, ATF, U.S. Marshals, and other federal law enforcement agencies.",
    percent: 0.2,
    category: "Non-Defense",
  },
  {
    emoji: "🌿",
    name: "EPA (Environment)",
    description: "Clean Air Act enforcement, Superfund cleanup, and water quality programs.",
    percent: 0.1,
    category: "Non-Defense",
  },
  {
    emoji: "🔬",
    name: "CDC (Disease Control)",
    description: "Public health surveillance, vaccine programs, and disease prevention.",
    percent: 0.1,
    category: "Non-Defense",
  },
  {
    emoji: "⛓️",
    name: "Federal Prisons (BOP)",
    description: "Bureau of Prisons operating ~120 federal facilities housing ~160,000 inmates.",
    percent: 0.1,
    category: "Non-Defense",
  },
  {
    emoji: "🏢",
    name: "SBA & Small Business",
    description: "Small Business Administration loans, grants, and entrepreneurship programs.",
    percent: 0.01,
    category: "Non-Defense",
  },

  // ── Debt ───────────────────────────────────────────────────────────────────
  {
    emoji: "💳",
    name: "Interest on National Debt",
    description: "Net interest payments on $34+ trillion in outstanding federal debt — the fastest growing major expense.",
    percent: 13.2,
    category: "Debt",
  },
];

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  BudgetCategory,
  { label: string; emoji: string; color: string; barColor: string; description: string }
> = {
  Mandatory: {
    label: "Mandatory Spending",
    emoji: "📋",
    color: "border-blue-700/50 bg-blue-950/20",
    barColor: "bg-blue-500",
    description: "Legally required by existing law — Congress must change the law to reduce these.",
  },
  Defense: {
    label: "Defense Discretionary",
    emoji: "🛡️",
    color: "border-green-700/50 bg-green-950/20",
    barColor: "bg-green-500",
    description: "Military spending set annually by Congress via the appropriations process.",
  },
  "Non-Defense": {
    label: "Non-Defense Discretionary",
    emoji: "🏗️",
    color: "border-purple-700/50 bg-purple-950/20",
    barColor: "bg-purple-500",
    description: "Civilian agency budgets set annually — from NASA to education to the FBI.",
  },
  Debt: {
    label: "Interest on the Debt",
    emoji: "💳",
    color: "border-red-700/50 bg-red-950/20",
    barColor: "bg-red-500",
    description: "Mandatory interest payments on $34+ trillion in accumulated federal debt.",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDollars(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatDollarsCompact(n: number): string {
  if (n < 1) return `${(n * 100).toFixed(1)}¢`;
  if (n < 100) return `$${n.toFixed(2)}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── MiniBar ──────────────────────────────────────────────────────────────────

function MiniBar({
  percent,
  maxPercent,
  color,
  animate,
  delay,
}: {
  percent: number;
  maxPercent: number;
  color: string;
  animate: boolean;
  delay: number;
}) {
  const [width, setWidth] = useState(0);
  const target = maxPercent > 0 ? (percent / maxPercent) * 100 : 0;

  useEffect(() => {
    if (!animate) { setWidth(0); return; }
    const t = setTimeout(() => setWidth(target), delay);
    return () => clearTimeout(t);
  }, [animate, target, delay]);

  return (
    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mt-2">
      <div
        className={`h-full ${color} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

// ─── LineItem ─────────────────────────────────────────────────────────────────

function LineItem({
  item,
  federal,
  maxPercent,
  animate,
  delay,
}: {
  item: BudgetItem;
  federal: number;
  maxPercent: number;
  animate: boolean;
  delay: number;
}) {
  const amount = (federal * item.percent) / 100;
  const cfg = CATEGORY_CONFIG[item.category];

  return (
    <div className="flex items-start gap-3 py-3 px-3 rounded-lg hover:bg-gray-800/40 transition-colors">
      <span className="text-xl flex-shrink-0 mt-0.5">{item.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-medium text-gray-200 leading-tight">{item.name}</p>
          <span className={`text-sm font-bold flex-shrink-0 ${cfg.barColor.replace("bg-", "text-")}`}>
            {formatDollarsCompact(amount)}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{item.description}</p>
        <MiniBar
          percent={item.percent}
          maxPercent={maxPercent}
          color={cfg.barColor}
          animate={animate}
          delay={delay}
        />
        <p className="text-xs text-gray-600 mt-1">{item.percent.toFixed(2)}% of federal budget</p>
      </div>
    </div>
  );
}

// ─── CategorySection ──────────────────────────────────────────────────────────

function CategorySection({
  category,
  items,
  federal,
  defaultOpen,
  searchQuery,
}: {
  category: BudgetCategory;
  items: BudgetItem[];
  federal: number;
  defaultOpen: boolean;
  searchQuery: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const cfg = CATEGORY_CONFIG[category];

  const totalPercent = items.reduce((s, i) => s + i.percent, 0);
  const totalAmount = (federal * totalPercent) / 100;
  const maxPercent = Math.max(...items.map((i) => i.percent));

  // When searching, auto-expand
  useEffect(() => {
    if (searchQuery) setOpen(true);
    else setOpen(defaultOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const colorClass = cfg.barColor.replace("bg-", "text-");

  return (
    <div className={`border rounded-xl overflow-hidden ${cfg.color}`}>
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-white/5 transition-colors"
        aria-expanded={open}
      >
        <span className="text-2xl">{cfg.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-bold text-base">{cfg.label}</p>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
              {items.length} programs
            </span>
          </div>
          <p className="text-gray-500 text-xs mt-0.5 leading-snug">{cfg.description}</p>
        </div>
        <div className="text-right flex-shrink-0 mr-2">
          <p className={`font-bold text-lg ${colorClass}`}>{formatDollars(totalAmount)}</p>
          <p className="text-gray-600 text-xs">{totalPercent.toFixed(1)}%</p>
        </div>
        <span className={`text-gray-400 text-sm transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {/* Line items */}
      {open && (
        <div className="border-t border-white/5 px-2 pb-2 divide-y divide-gray-800/60">
          {items.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-4">No matching programs</p>
          ) : (
            items.map((item, i) => (
              <LineItem
                key={item.name}
                item={item}
                federal={federal}
                maxPercent={maxPercent}
                animate={open}
                delay={i * 40}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ResultsView({ data, onReset }: Props) {
  const { federal, socialSecurity, medicare, stateTax, state } = data;
  const totalFica = socialSecurity + medicare;
  const totalTaxes = federal + totalFica + stateTax;

  const [searchQuery, setSearchQuery] = useState("");

  const categories: BudgetCategory[] = ["Mandatory", "Defense", "Non-Defense", "Debt"];

  const filteredByCategory = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const result: Record<BudgetCategory, BudgetItem[]> = {
      Mandatory: [],
      Defense: [],
      "Non-Defense": [],
      Debt: [],
    };
    for (const item of BUDGET_ITEMS) {
      if (
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      ) {
        result[item.category].push(item);
      }
    }
    return result;
  }, [searchQuery]);

  const totalMatches = useMemo(
    () => Object.values(filteredByCategory).reduce((s, arr) => s + arr.length, 0),
    [filteredByCategory]
  );

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-12">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-emerald-400 text-sm font-medium">✅ W2 Analyzed</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Your Tax Breakdown</h1>
          <p className="text-gray-400">Here&apos;s exactly where your money went in 2024</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Federal Income Tax", value: federal, emoji: "🏛️", color: "text-emerald-400" },
            { label: "Social Security", value: socialSecurity, emoji: "👴", color: "text-blue-400" },
            { label: "Medicare", value: medicare, emoji: "🏥", color: "text-cyan-400" },
            { label: `State Tax${state ? ` (${state})` : ""}`, value: stateTax, emoji: "🗺️", color: "text-purple-400" },
          ].map((item) => (
            <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{item.emoji}</div>
              <div className={`text-lg sm:text-xl font-bold ${item.color}`}>{formatDollars(item.value)}</div>
              <div className="text-gray-500 text-xs mt-1 leading-tight">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="bg-gradient-to-r from-emerald-900/30 to-blue-900/30 border border-emerald-800/40 rounded-xl p-5 mb-10 text-center">
          <p className="text-gray-400 text-sm mb-1">Total taxes withheld</p>
          <p className="text-4xl font-bold text-white">{formatDollars(totalTaxes)}</p>
          <p className="text-gray-500 text-xs mt-2">Federal + FICA + State</p>
        </div>

        {/* FICA section */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gray-800" />
            <h2 className="text-white font-bold text-lg whitespace-nowrap">💼 FICA Payroll Taxes</h2>
            <div className="h-px flex-1 bg-gray-800" />
          </div>
          <p className="text-gray-500 text-sm text-center mb-5">
            Your <span className="text-blue-400 font-semibold">{formatDollars(totalFica)}</span> in FICA taxes funds social insurance programs
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: "👴", name: "Social Security", amount: socialSecurity, color: "text-blue-400", bar: "bg-blue-500", desc: "Retirement & disability insurance for workers and families" },
              { emoji: "🏥", name: "Medicare", amount: medicare, color: "text-cyan-400", bar: "bg-cyan-500", desc: "Health insurance for Americans 65+ and disabled individuals" },
            ].map((c) => (
              <div key={c.name} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="text-2xl mb-2">{c.emoji}</div>
                <p className={`text-xl font-bold ${c.color}`}>{formatDollars(c.amount)}</p>
                <p className="text-white font-semibold text-sm mt-1">{c.name}</p>
                <p className="text-gray-500 text-xs mt-1 leading-snug">{c.desc}</p>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full ${c.bar} rounded-full`}
                    style={{ width: `${(c.amount / totalFica) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Federal Budget Breakdown */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gray-800" />
            <h2 className="text-white font-bold text-lg whitespace-nowrap">🏛️ Federal Budget Allocation</h2>
            <div className="h-px flex-1 bg-gray-800" />
          </div>
          <p className="text-gray-500 text-sm text-center mb-5">
            Your <span className="text-emerald-400 font-semibold">{formatDollars(federal)}</span> in federal withholding — broken down across {BUDGET_ITEMS.length} programs by FY2024 budget percentages
          </p>

          {/* Search */}
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search programs (e.g. NASA, SNAP, FBI…)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-10 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-emerald-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-lg leading-none"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-gray-600 text-xs text-center mb-3">
              {totalMatches} program{totalMatches !== 1 ? "s" : ""} match &ldquo;{searchQuery}&rdquo;
            </p>
          )}

          {/* Categories */}
          <div className="space-y-3">
            {categories.map((cat) => (
              <CategorySection
                key={cat}
                category={cat}
                items={filteredByCategory[cat]}
                federal={federal}
                defaultOpen={cat === "Debt"}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        </section>

        {/* Footnote */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 mb-8 text-center">
          <p className="text-gray-400 text-sm">
            <span className="text-yellow-400">💡</span> Percentages based on approximate FY2024 federal outlays (~$6.75T total).
            Your employer also matches your <strong className="text-white">{formatDollars(totalFica)}</strong> in FICA taxes.
          </p>
        </div>

        {/* Reset */}
        <div className="text-center">
          <button
            onClick={onReset}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 px-8 rounded-xl transition-colors duration-150"
          >
            ← Analyze Another W2
          </button>
        </div>
      </div>
    </main>
  );
}
