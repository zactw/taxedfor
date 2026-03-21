"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { W2Data } from "../page";
import ShareCard from "./ShareCard";
import StateTaxBreakdown from "./StateTaxBreakdown";
import ProUpgrade from "./ProUpgrade";

interface Props {
  data: W2Data;
  onReset: () => void;
}

// ─── Budget Data ──────────────────────────────────────────────────────────────

type BudgetCategory = "Mandatory" | "Defense" | "Non-Defense" | "Debt";

interface BudgetItem {
  name: string;
  description: string;
  percent: number;
  category: BudgetCategory;
}

const BUDGET_ITEMS: BudgetItem[] = [
  { name: "Social Security (OASDI)", description: "Monthly retirement, survivor, and disability payments to ~70 million Americans.", percent: 20.0, category: "Mandatory" },
  { name: "Medicare", description: "Federal health insurance for Americans 65+ and certain disabled individuals.", percent: 14.8, category: "Mandatory" },
  { name: "Medicaid & CHIP", description: "Health coverage for low-income adults, children, pregnant women, and people with disabilities.", percent: 9.1, category: "Mandatory" },
  { name: "SNAP (Food Stamps)", description: "Nutrition assistance for ~42 million low-income Americans each month.", percent: 1.7, category: "Mandatory" },
  { name: "Federal Civilian Retirement", description: "Pension and disability payments for retired federal government employees.", percent: 2.3, category: "Mandatory" },
  { name: "Veterans Comp & Pensions", description: "Disability compensation and pension payments to eligible military veterans.", percent: 2.1, category: "Mandatory" },
  { name: "ACA Health Subsidies", description: "Premium tax credits helping individuals buy coverage on ACA marketplace exchanges.", percent: 1.3, category: "Mandatory" },
  { name: "Earned Income Tax Credit", description: "Refundable tax credit for low- and moderate-income working families.", percent: 1.0, category: "Mandatory" },
  { name: "Supplemental Security Inc.", description: "Cash assistance to aged, blind, and disabled people with limited income.", percent: 0.9, category: "Mandatory" },
  { name: "Child Tax Credit", description: "Refundable portion of the Child Tax Credit for qualifying families.", percent: 0.5, category: "Mandatory" },
  { name: "Student Loan Subsidies", description: "Interest subsidies and income-driven repayment forgiveness for federal student loans.", percent: 0.4, category: "Mandatory" },
  { name: "Unemployment Insurance", description: "Temporary income support for workers who lose their jobs through no fault of their own.", percent: 0.4, category: "Mandatory" },
  { name: "TANF & Family Support", description: "Block grants to states for cash assistance and services for low-income families.", percent: 0.3, category: "Mandatory" },
  { name: "Other Mandatory Spending", description: "Flood insurance, deposit insurance, Pension Benefit Guaranty, and other entitlement programs.", percent: 4.4, category: "Mandatory" },
  { name: "Air Force & Space Force", description: "Personnel, aircraft, satellites, cyber operations, and ICBM forces.", percent: 3.2, category: "Defense" },
  { name: "Navy & Marine Corps", description: "Aircraft carriers, submarines, destroyers, amphibious forces, and naval aviation.", percent: 3.1, category: "Defense" },
  { name: "Army Operations", description: "Ground forces, combat units, training, and Army installation operations.", percent: 2.7, category: "Defense" },
  { name: "Defense R&D", description: "Advanced weapons R&D, DARPA projects, next-generation military technology.", percent: 1.8, category: "Defense" },
  { name: "Defense Agencies (NSA, DIA)", description: "Intelligence agencies, logistics commands, and joint Pentagon-wide programs.", percent: 1.8, category: "Defense" },
  { name: "Nuclear Weapons (NNSA)", description: "Design, production, and maintenance of the U.S. nuclear stockpile.", percent: 0.3, category: "Defense" },
  { name: "Military Construction", description: "Building and modernizing bases, barracks, and facilities worldwide.", percent: 0.2, category: "Defense" },
  { name: "VA Healthcare", description: "Medical care, mental health, and rehabilitation for 9+ million enrolled veterans.", percent: 1.7, category: "Non-Defense" },
  { name: "Transportation (FAA, Amtrak)", description: "Federal Highway Administration, airports, air traffic control, and passenger rail.", percent: 1.6, category: "Non-Defense" },
  { name: "Education (K-12 & Pell)", description: "Title I funding for low-income schools, Pell grants, and special education.", percent: 1.2, category: "Non-Defense" },
  { name: "Housing Assistance (HUD)", description: "Section 8 vouchers, public housing, and community development grants.", percent: 1.1, category: "Non-Defense" },
  { name: "NIH (Medical Research)", description: "National Institutes of Health funding for cancer, Alzheimer's, and disease research.", percent: 0.7, category: "Non-Defense" },
  { name: "NASA", description: "Space exploration, Artemis moon program, ISS, and Earth science missions.", percent: 0.4, category: "Non-Defense" },
  { name: "Border Patrol & ICE", description: "Customs and Border Protection, Immigration and Customs Enforcement operations.", percent: 0.4, category: "Non-Defense" },
  { name: "Foreign Aid (USAID)", description: "Development assistance, humanitarian aid, and global health programs abroad.", percent: 0.4, category: "Non-Defense" },
  { name: "Agriculture & Farm Subsidies", description: "Crop insurance, conservation programs, rural development, and farm price supports.", percent: 0.3, category: "Non-Defense" },
  { name: "Energy Dept (Non-Nuclear)", description: "Clean energy R&D, grid modernization, and energy efficiency programs.", percent: 0.3, category: "Non-Defense" },
  { name: "FEMA & Disaster Relief", description: "Federal Emergency Management Agency response, recovery, and mitigation grants.", percent: 0.3, category: "Non-Defense" },
  { name: "State Dept & Embassies", description: "U.S. diplomatic missions, consular services, and international organizations.", percent: 0.2, category: "Non-Defense" },
  { name: "IRS & Treasury Admin", description: "Tax collection, financial crimes enforcement, and fiscal operations.", percent: 0.2, category: "Non-Defense" },
  { name: "Head Start & Early Childhood", description: "Preschool and family services for low-income children under age 5.", percent: 0.2, category: "Non-Defense" },
  { name: "FBI & Federal Law Enforcement", description: "FBI, DEA, ATF, U.S. Marshals, and other federal law enforcement agencies.", percent: 0.2, category: "Non-Defense" },
  { name: "EPA (Environment)", description: "Clean Air Act enforcement, Superfund cleanup, and water quality programs.", percent: 0.1, category: "Non-Defense" },
  { name: "CDC (Disease Control)", description: "Public health surveillance, vaccine programs, and disease prevention.", percent: 0.1, category: "Non-Defense" },
  { name: "Federal Prisons (BOP)", description: "Bureau of Prisons operating ~120 federal facilities housing ~160,000 inmates.", percent: 0.1, category: "Non-Defense" },
  { name: "SBA & Small Business", description: "Small Business Administration loans, grants, and entrepreneurship programs.", percent: 0.01, category: "Non-Defense" },
  { name: "Other Non-Defense Discr.", description: "Courts, Congress, White House, and hundreds of smaller federal programs.", percent: 2.7, category: "Non-Defense" },
  { name: "Interest on National Debt", description: "Net interest payments on $34+ trillion in outstanding federal debt — the fastest growing major expense.", percent: 13.2, category: "Debt" },
];

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<BudgetCategory, { label: string; description: string }> = {
  Mandatory: {
    label: "MANDATORY SPENDING",
    description: "Legally required by existing law — Congress must change the law to reduce these.",
  },
  Defense: {
    label: "DEFENSE DISCRETIONARY",
    description: "Military spending set annually by Congress via the appropriations process.",
  },
  "Non-Defense": {
    label: "NON-DEFENSE DISCRETIONARY",
    description: "Civilian agency budgets set annually — from NASA to education to the FBI.",
  },
  Debt: {
    label: "INTEREST ON THE DEBT",
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
  if (n < 1) return `${(n * 100).toFixed(1)}c`;
  if (n < 100) return `$${n.toFixed(2)}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/** Build a 28-char block progress bar: █ for filled, ░ for empty */
function blockBar(filled: number, total: number = 28): string {
  const f = Math.round((filled / total) * total);
  return "█".repeat(f) + "░".repeat(total - f);
}

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1500, delay = 0): number {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    timeout = setTimeout(() => {
      const animate = (ts: number) => {
        if (startTime.current === null) startTime.current = ts;
        const elapsed = ts - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        // ease out quart
        const eased = 1 - Math.pow(1 - progress, 4);
        setValue(target * eased);
        if (progress < 1) {
          rafId.current = requestAnimationFrame(animate);
        } else {
          setValue(target);
        }
      };
      rafId.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      startTime.current = null;
    };
  }, [target, duration, delay]);

  return value;
}

// ─── AnimatedDollar ───────────────────────────────────────────────────────────

function AnimatedDollar({ value, delay = 0 }: { value: number; delay?: number }) {
  const animated = useCountUp(value, 1500, delay);
  return <span>{formatDollars(animated)}</span>;
}

// ─── BlockProgressBar ─────────────────────────────────────────────────────────

function BlockProgressBar({
  percent,
  maxPercent,
  delay = 0,
}: {
  percent: number;
  maxPercent: number;
  delay?: number;
}) {
  const BAR_WIDTH = 28;
  const [filled, setFilled] = useState(0);
  const targetFilled = maxPercent > 0 ? Math.round((percent / maxPercent) * BAR_WIDTH) : 0;

  useEffect(() => {
    const t = setTimeout(() => {
      let current = 0;
      const step = () => {
        current++;
        setFilled(current);
        if (current < targetFilled) requestAnimationFrame(step);
      };
      if (targetFilled > 0) requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(t);
  }, [targetFilled, delay]);

  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0" }}>
      {"█".repeat(filled)}{"░".repeat(BAR_WIDTH - filled)}
    </span>
  );
}

// ─── LineItem ─────────────────────────────────────────────────────────────────

function LineItem({
  item,
  federal,
  maxPercent,
  delay,
}: {
  item: BudgetItem;
  federal: number;
  maxPercent: number;
  delay: number;
}) {
  const amount = (federal * item.percent) / 100;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) auto auto auto",
        gap: "0.5rem 0.75rem",
        alignItems: "center",
        padding: "0.35rem 0",
        borderBottom: "1px solid #1a1a1a",
        fontSize: "0.8rem",
      }}
    >
      <div style={{ color: "#e0e0e0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {item.name}
      </div>
      <div style={{ color: "#bbb", fontSize: "0.72rem", whiteSpace: "nowrap" }}>
        <BlockProgressBar percent={item.percent} maxPercent={maxPercent} delay={delay} />
      </div>
      <div style={{ color: "#ccc", textAlign: "right", whiteSpace: "nowrap" }}>
        {item.percent.toFixed(1)}%
      </div>
      <div style={{ color: "#fff", fontWeight: 700, textAlign: "right", whiteSpace: "nowrap" }}>
        {formatDollarsCompact(amount)}
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
  sectionDelay,
}: {
  category: BudgetCategory;
  items: BudgetItem[];
  federal: number;
  defaultOpen: boolean;
  searchQuery: string;
  sectionDelay: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const cfg = CATEGORY_CONFIG[category];

  const totalPercent = items.reduce((s, i) => s + i.percent, 0);
  const totalAmount = (federal * totalPercent) / 100;
  const maxPercent = Math.max(...items.map((i) => i.percent), 0.01);

  useEffect(() => {
    if (searchQuery) setOpen(true);
    else setOpen(defaultOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  return (
    <div
      className="section-fade"
      style={{
        "--section-delay": `${sectionDelay}ms`,
        border: "1px solid #333",
        marginBottom: "0.75rem",
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      } as React.CSSProperties}
    >
      {/* Category header */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.7rem 1rem",
          background: "#000",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: "0.8rem",
          textAlign: "left",
          borderBottom: open ? "1px solid #333" : "none",
        }}
        aria-expanded={open}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "#888" }}>{open ? "[-]" : "[+]"}</span>
          <span style={{ fontWeight: 700, letterSpacing: "0.08em" }}>{cfg.label}</span>
          <span style={{ color: "#888", fontSize: "0.7rem" }}>({items.length} programs)</span>
        </div>
        <div style={{ textAlign: "right", fontWeight: 700 }}>
          {formatDollars(totalAmount)}
        </div>
      </button>

      {/* Description */}
      {open && (
        <div style={{ padding: "0.4rem 1rem", borderBottom: "1px solid #1a1a1a", color: "#999", fontSize: "0.72rem" }}>
          {cfg.description}
        </div>
      )}

      {/* Items */}
      {open && (
        <div style={{ padding: "0 1rem 0.5rem" }}>
          {items.length === 0 ? (
            <div style={{ color: "#888", fontSize: "0.75rem", textAlign: "center", padding: "1rem 0" }}>
              &gt; no matching programs
            </div>
          ) : (
            items.map((item, i) => (
              <LineItem
                key={item.name}
                item={item}
                federal={federal}
                maxPercent={maxPercent}
                delay={i * 40 + sectionDelay}
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

  const mono: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "#fff",
        padding: "2rem 1rem",
        ...mono,
      }}
    >
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>

        {/* Analysis Complete Box */}
        <div
          className="section-fade"
          style={{
            "--section-delay": "0ms",
            border: "1px solid #fff",
            marginBottom: "2rem",
            ...mono,
          } as React.CSSProperties}
        >
          <div style={{ borderBottom: "1px solid #333", padding: "0.6rem 1rem", color: "#bbb", fontSize: "0.75rem" }}>
            ┌─ ANALYSIS COMPLETE ─────────────────────────────────┐
          </div>
          <div style={{ padding: "1rem 1.25rem" }}>
            <div style={{ fontSize: "0.8rem", color: "#777", marginBottom: "0.75rem", letterSpacing: "0.1em" }}>
              ══════════════════════════════════════════
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.3rem 1rem", fontSize: "0.85rem" }}>
              <span style={{ color: "#ddd" }}>Federal Withheld:</span>
              <span style={{ color: "#fff", textAlign: "right" }}><AnimatedDollar value={federal} delay={100} /></span>

              <span style={{ color: "#ddd" }}>Social Security:</span>
              <span style={{ color: "#fff", textAlign: "right" }}><AnimatedDollar value={socialSecurity} delay={200} /></span>

              <span style={{ color: "#ddd" }}>Medicare:</span>
              <span style={{ color: "#fff", textAlign: "right" }}><AnimatedDollar value={medicare} delay={300} /></span>

              <span style={{ color: "#ddd" }}>State {state ? `(${state})` : "Tax"}:</span>
              <span style={{ color: "#fff", textAlign: "right" }}><AnimatedDollar value={stateTax} delay={400} /></span>
            </div>
            <div style={{ borderTop: "1px solid #333", marginTop: "0.75rem", paddingTop: "0.75rem", display: "grid", gridTemplateColumns: "1fr auto", fontSize: "0.95rem", fontWeight: 700 }}>
              <span>TOTAL EXTRACTED:</span>
              <span style={{ textAlign: "right" }}><AnimatedDollar value={totalTaxes} delay={500} /></span>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #333", padding: "0.4rem 1rem", color: "#777", fontSize: "0.75rem" }}>
            └─────────────────────────────────────────────────────┘
          </div>
        </div>

        {/* Disclaimer notice */}
        <div
          className="section-fade"
          style={{
            "--section-delay": "50ms",
            border: "1px solid #333",
            padding: "0.6rem 1rem",
            marginBottom: "1.5rem",
            color: "#aaa",
            fontSize: "0.72rem",
            lineHeight: "1.6",
            ...mono,
          } as React.CSSProperties}
        >
          &gt; ⚠ NOTICE: Figures are estimates based on FY2024 federal budget allocations.
          AI parsing and public data sources may have slight inconsistencies with
          real-world tax figures. Not tax advice.
        </div>

        {/* Share Card */}
        <ShareCard
          federal={federal}
          socialSecurity={socialSecurity}
          medicare={medicare}
          stateTax={stateTax}
          state={state}
        />

        {/* FICA Section */}
        <section
          className="section-fade"
          style={{
            "--section-delay": "200ms",
            border: "1px solid #333",
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            ...mono,
          } as React.CSSProperties}
        >
          <div style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "0.75rem", color: "#fff" }}>
            [FICA PAYROLL TAXES] ───────────────────── <AnimatedDollar value={totalFica} delay={300} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.8rem" }}>
            {[
              { name: "Social Security", amount: socialSecurity, delay: 350 },
              { name: "Medicare", amount: medicare, delay: 450 },
            ].map((c) => (
              <div key={c.name} style={{ border: "1px solid #222", padding: "0.75rem" }}>
                <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{c.name}</div>
                <div style={{ color: "#fff", fontSize: "1rem", fontWeight: 700 }}>
                  <AnimatedDollar value={c.amount} delay={c.delay} />
                </div>
                <div style={{ color: "#999", fontSize: "0.7rem", marginTop: "0.25rem" }}>
                  {((c.amount / totalFica) * 100).toFixed(1)}% of FICA
                </div>
                <div style={{ marginTop: "0.5rem", fontSize: "0.65rem", color: "#bbb" }}>
                  <BlockProgressBar percent={c.amount} maxPercent={totalFica} delay={c.delay} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Federal Budget Breakdown */}
        <section style={{ marginBottom: "1.5rem" }}>
          <div
            className="section-fade"
            style={{
              "--section-delay": "300ms",
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              marginBottom: "1rem",
              padding: "0.5rem 0",
              borderTop: "1px solid #333",
              borderBottom: "1px solid #333",
              ...mono,
            } as React.CSSProperties}
          >
            [FEDERAL BUDGET ALLOCATION] — {BUDGET_ITEMS.length} programs — {formatDollars(federal)}
          </div>

          {/* Search */}
          <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", ...mono }}>
            <span style={{ color: "#bbb" }}>&gt; SEARCH PROGRAMS:</span>
            <input
              type="text"
              placeholder="e.g. NASA, SNAP, FBI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-terminal"
              style={{
                flex: 1,
                padding: "0.35rem 0.6rem",
                fontSize: "0.8rem",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="btn-terminal"
                style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", borderColor: "#555", color: "#888" }}
              >
                [X]
              </button>
            )}
          </div>
          {searchQuery && (
            <div style={{ color: "#aaa", fontSize: "0.7rem", marginBottom: "0.5rem" }}>
              &gt; {totalMatches} result{totalMatches !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
            </div>
          )}

          {/* Categories */}
          <div>
            {categories.map((cat, idx) => (
              <CategorySection
                key={cat}
                category={cat}
                items={filteredByCategory[cat]}
                federal={federal}
                defaultOpen={cat === "Debt"}
                searchQuery={searchQuery}
                sectionDelay={idx * 100 + 400}
              />
            ))}
          </div>
        </section>

        {/* State Tax Breakdown */}
        <StateTaxBreakdown stateTax={stateTax} stateCode={state} />

        {/* Footnote */}
        <div
          style={{
            border: "1px solid #222",
            padding: "0.75rem 1rem",
            marginBottom: "1.5rem",
            color: "#999",
            fontSize: "0.72rem",
            ...mono,
          }}
        >
          &gt; Percentages based on approximate FY2024 federal outlays (~$6.75T total).
          Your employer also matches your {formatDollars(totalFica)} in FICA taxes.
        </div>

        {/* Pro Upgrade */}
        <ProUpgrade />

        {/* Reset */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <button
            onClick={onReset}
            className="btn-terminal"
            style={{ padding: "0.6rem 2rem", fontSize: "0.85rem", letterSpacing: "0.05em" }}
          >
            [ &larr; ANALYZE ANOTHER W-2 ]
          </button>
        </div>

        {/* Legal disclaimer footer */}
        <div
          style={{
            borderTop: "1px solid #222",
            borderBottom: "1px solid #222",
            padding: "0.75rem 1rem",
            marginBottom: "1.5rem",
            color: "#888",
            fontSize: "0.7rem",
            lineHeight: "1.6",
            ...mono,
          }}
        >
          <div style={{ color: "#555", marginBottom: "0.25rem" }}>{'─'.repeat(60)}</div>
          <div>
            &gt; DISCLAIMER: Budget allocations are approximations based on publicly available federal spending data and may not reflect exact real-time figures. AI parsing may contain errors. Not financial or tax advice.{" "}
            <Link href="/privacy" style={{ color: "#aaa", textDecoration: "underline" }}>[PRIVACY]</Link>{" "}
            <Link href="/terms" style={{ color: "#aaa", textDecoration: "underline" }}>[TERMS]</Link>
          </div>
          <div style={{ color: "#555", marginTop: "0.25rem" }}>{'─'.repeat(60)}</div>
        </div>
      </div>
    </main>
  );
}
