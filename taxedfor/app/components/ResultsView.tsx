"use client";

import { useEffect, useState } from "react";
import { W2Data } from "../page";

interface Props {
  data: W2Data;
  onReset: () => void;
}

interface BudgetCategory {
  emoji: string;
  name: string;
  description: string;
  percent: number;
  color: string;
}

const FEDERAL_BUDGET: BudgetCategory[] = [
  {
    emoji: "🏥",
    name: "Social Security & Medicare (Mandatory)",
    description: "Direct retirement and disability payments to Social Security recipients",
    percent: 25,
    color: "bg-blue-500",
  },
  {
    emoji: "💊",
    name: "Medicare & Health Programs",
    description: "Federal health insurance for seniors and the disabled (non-SS portion)",
    percent: 14,
    color: "bg-cyan-500",
  },
  {
    emoji: "🪖",
    name: "Defense & Military",
    description: "Army, Navy, Air Force, Space Force, and military operations worldwide",
    percent: 13,
    color: "bg-green-600",
  },
  {
    emoji: "💸",
    name: "Interest on National Debt",
    description: "Interest payments on $34+ trillion in federal debt",
    percent: 13,
    color: "bg-red-500",
  },
  {
    emoji: "🤝",
    name: "Income Security",
    description: "Unemployment insurance, food stamps (SNAP), housing assistance, and welfare",
    percent: 12,
    color: "bg-orange-500",
  },
  {
    emoji: "🎖️",
    name: "Veterans Benefits",
    description: "Healthcare, pensions, and services for military veterans",
    percent: 4,
    color: "bg-yellow-500",
  },
  {
    emoji: "📚",
    name: "Education",
    description: "Federal student loans, Pell grants, K-12 support, and special education",
    percent: 2,
    color: "bg-purple-500",
  },
  {
    emoji: "🛣️",
    name: "Transportation",
    description: "Highways, bridges, airports, Amtrak, and public transit systems",
    percent: 2,
    color: "bg-indigo-500",
  },
  {
    emoji: "🌍",
    name: "Foreign Aid & International",
    description: "Diplomatic missions, foreign assistance, and international organizations",
    percent: 1,
    color: "bg-pink-500",
  },
  {
    emoji: "🏛️",
    name: "Other Government",
    description: "Science, NASA, agriculture, justice, environment, and general government",
    percent: 14,
    color: "bg-gray-500",
  },
];

interface FicaCategory {
  emoji: string;
  name: string;
  description: string;
  amount: number;
  color: string;
}

function formatDollars(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function BudgetBar({
  category,
  amount,
  maxAmount,
  delay,
}: {
  category: BudgetCategory | FicaCategory;
  amount: number;
  maxAmount: number;
  delay: number;
}) {
  const [width, setWidth] = useState(0);
  const targetWidth = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(targetWidth);
    }, delay);
    return () => clearTimeout(timer);
  }, [targetWidth, delay]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl flex-shrink-0">{category.emoji}</span>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm sm:text-base leading-tight">
              {category.name}
            </p>
            <p className="text-gray-500 text-xs mt-0.5 leading-snug">
              {category.description}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-emerald-400 font-bold text-base sm:text-lg whitespace-nowrap">
            {formatDollars(amount)}
          </p>
          {"percent" in category && (
            <p className="text-gray-600 text-xs">{(category as BudgetCategory).percent}%</p>
          )}
        </div>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${"color" in category ? category.color : "bg-emerald-500"} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function ResultsView({ data, onReset }: Props) {
  const { federal, socialSecurity, medicare, stateTax, state } = data;
  const totalFica = socialSecurity + medicare;

  const ficaCategories: FicaCategory[] = [
    {
      emoji: "👴",
      name: "Social Security",
      description: "Retirement and disability insurance for workers and their families",
      amount: socialSecurity,
      color: "bg-blue-400",
    },
    {
      emoji: "🏥",
      name: "Medicare",
      description: "Health insurance for Americans aged 65+ and certain disabled individuals",
      amount: medicare,
      color: "bg-cyan-400",
    },
  ];

  const maxFederal = Math.max(...FEDERAL_BUDGET.map((c) => (federal * c.percent) / 100));
  const maxFica = Math.max(socialSecurity, medicare);

  const totalTaxes = federal + totalFica + stateTax;

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-emerald-400 text-sm font-medium">✅ W2 Analyzed</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Your Tax Breakdown
          </h1>
          <p className="text-gray-400">
            Here&apos;s exactly where your money went in 2024
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { label: "Federal Income Tax", value: federal, emoji: "🏛️", color: "text-emerald-400" },
            { label: "Social Security", value: socialSecurity, emoji: "👴", color: "text-blue-400" },
            { label: "Medicare", value: medicare, emoji: "🏥", color: "text-cyan-400" },
            { label: `State Tax${state ? ` (${state})` : ""}`, value: stateTax, emoji: "🗺️", color: "text-purple-400" },
          ].map((item) => (
            <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{item.emoji}</div>
              <div className={`text-lg sm:text-xl font-bold ${item.color}`}>
                {formatDollars(item.value)}
              </div>
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

        {/* Federal Budget Breakdown */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gray-800" />
            <h2 className="text-white font-bold text-lg whitespace-nowrap">
              🏛️ Federal Income Tax Allocation
            </h2>
            <div className="h-px flex-1 bg-gray-800" />
          </div>
          <p className="text-gray-500 text-sm text-center mb-5">
            Your <span className="text-emerald-400 font-semibold">{formatDollars(federal)}</span> in federal withholding — broken down by FY2024 budget percentages
          </p>
          <div className="space-y-3">
            {FEDERAL_BUDGET.map((cat, i) => (
              <BudgetBar
                key={cat.name}
                category={cat}
                amount={(federal * cat.percent) / 100}
                maxAmount={maxFederal}
                delay={i * 80}
              />
            ))}
          </div>
        </section>

        {/* FICA Breakdown */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gray-800" />
            <h2 className="text-white font-bold text-lg whitespace-nowrap">
              💼 FICA Payroll Taxes
            </h2>
            <div className="h-px flex-1 bg-gray-800" />
          </div>
          <p className="text-gray-500 text-sm text-center mb-5">
            Your <span className="text-blue-400 font-semibold">{formatDollars(totalFica)}</span> in FICA taxes funds social insurance programs
          </p>
          <div className="space-y-3">
            {ficaCategories.map((cat, i) => (
              <BudgetBar
                key={cat.name}
                category={cat}
                amount={cat.amount}
                maxAmount={maxFica}
                delay={i * 100}
              />
            ))}
          </div>
        </section>

        {/* Fun fact / footnote */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 mb-8 text-center">
          <p className="text-gray-400 text-sm">
            <span className="text-yellow-400">💡</span> Percentages based on approximate FY2024 federal outlays.
            Your employer also pays a matching <strong className="text-white">{formatDollars(socialSecurity + medicare)}</strong> in FICA taxes on your behalf.
          </p>
        </div>

        {/* Reset button */}
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
