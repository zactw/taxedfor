"use client";

import { useState, useEffect } from "react";

interface StateTaxBreakdownProps {
  stateTax: number;
  stateCode?: string;
}

interface StateLineItem {
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
      { name: "K-12 Education", percent: 38.0 },
      { name: "Medi-Cal (Medicaid)", percent: 18.0 },
      { name: "Higher Education (UC/CSU)", percent: 8.0 },
      { name: "Transportation & Highways", percent: 7.5 },
      { name: "Corrections & Rehab", percent: 6.5 },
      { name: "Natural Resources & Parks", percent: 4.0 },
      { name: "Housing & Community Dev", percent: 3.5 },
      { name: "General Government", percent: 14.5 },
    ],
  },
  TX: {
    name: "Texas",
    items: [
      { name: "K-12 Education", percent: 34.0 },
      { name: "Health & Human Services", percent: 24.0 },
      { name: "Transportation (TxDOT)", percent: 12.0 },
      { name: "Higher Education", percent: 9.0 },
      { name: "Criminal Justice (TDCJ)", percent: 6.5 },
      { name: "Agriculture & Rural Dev", percent: 2.5 },
      { name: "General Government", percent: 12.0 },
    ],
  },
  FL: {
    name: "Florida",
    items: [
      { name: "K-12 Education", percent: 31.0 },
      { name: "Medicaid & Health", percent: 27.0 },
      { name: "Transportation (FDOT)", percent: 11.0 },
      { name: "Higher Education", percent: 8.5 },
      { name: "Corrections (FDC)", percent: 5.5 },
      { name: "Environmental Protection", percent: 3.5 },
      { name: "General Government", percent: 13.5 },
    ],
  },
  NY: {
    name: "New York",
    items: [
      { name: "Medicaid & Health", percent: 32.0 },
      { name: "K-12 Education", percent: 25.0 },
      { name: "Higher Education (SUNY/CUNY)", percent: 7.0 },
      { name: "Transportation (MTA/DOT)", percent: 9.0 },
      { name: "Housing & Community Dev", percent: 5.0 },
      { name: "Corrections (DOCCS)", percent: 5.5 },
      { name: "Environment & Parks", percent: 2.5 },
      { name: "General Government", percent: 14.0 },
    ],
  },
  PA: {
    name: "Pennsylvania",
    items: [
      { name: "Human Services (Medicaid)", percent: 31.0 },
      { name: "K-12 Education", percent: 27.0 },
      { name: "Transportation (PennDOT)", percent: 12.0 },
      { name: "Higher Education", percent: 5.5 },
      { name: "Corrections (DOC)", percent: 6.5 },
      { name: "Environment & Natural Resources", percent: 2.5 },
      { name: "General Government", percent: 15.5 },
    ],
  },
  IL: {
    name: "Illinois",
    items: [
      { name: "K-12 Education", percent: 29.0 },
      { name: "Healthcare & Family Svcs", percent: 26.0 },
      { name: "Transportation (IDOT)", percent: 10.0 },
      { name: "Higher Education", percent: 7.5 },
      { name: "Corrections (IDOC)", percent: 7.0 },
      { name: "Housing & Community Svcs", percent: 3.5 },
      { name: "General Government", percent: 17.0 },
    ],
  },
  OH: {
    name: "Ohio",
    items: [
      { name: "Medicaid & Health", percent: 33.0 },
      { name: "K-12 Education", percent: 26.0 },
      { name: "Transportation (ODOT)", percent: 10.0 },
      { name: "Higher Education", percent: 6.5 },
      { name: "Rehabilitation & Corrections", percent: 5.5 },
      { name: "Agriculture & Natural Resources", percent: 2.0 },
      { name: "General Government", percent: 17.0 },
    ],
  },
  GA: {
    name: "Georgia",
    items: [
      { name: "K-12 Education", percent: 33.0 },
      { name: "Medicaid & Health", percent: 22.0 },
      { name: "Transportation (GDOT)", percent: 11.0 },
      { name: "Higher Education (USG)", percent: 9.0 },
      { name: "Corrections (GDC)", percent: 6.5 },
      { name: "Natural Resources", percent: 2.5 },
      { name: "General Government", percent: 16.0 },
    ],
  },
  NC: {
    name: "North Carolina",
    items: [
      { name: "K-12 Education", percent: 34.0 },
      { name: "Health & Human Services", percent: 23.0 },
      { name: "Transportation (NCDOT)", percent: 11.0 },
      { name: "Higher Education (UNC)", percent: 9.5 },
      { name: "Corrections (NCDPS)", percent: 5.5 },
      { name: "Environment & Natural Resources", percent: 2.5 },
      { name: "General Government", percent: 14.5 },
    ],
  },
  MI: {
    name: "Michigan",
    items: [
      { name: "K-12 Education (School Aid)", percent: 31.0 },
      { name: "Medicaid & Health", percent: 27.0 },
      { name: "Transportation (MDOT)", percent: 10.5 },
      { name: "Higher Education", percent: 7.5 },
      { name: "Corrections (MDOC)", percent: 6.0 },
      { name: "Environment, Great Lakes & Energy", percent: 3.0 },
      { name: "General Government", percent: 15.0 },
    ],
  },
  AZ: {
    name: "Arizona",
    items: [
      { name: "K-12 Education", percent: 36.0 },
      { name: "Medicaid (AHCCCS)", percent: 20.0 },
      { name: "Higher Education (ASU/UA)", percent: 9.0 },
      { name: "Transportation (ADOT)", percent: 10.0 },
      { name: "Corrections (ADC)", percent: 7.0 },
      { name: "Child Safety & Family Svcs", percent: 3.5 },
      { name: "General Government", percent: 14.5 },
    ],
  },
};

function formatDollars(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatCompact(n: number): string {
  if (n < 1) return `${(n * 100).toFixed(1)}c`;
  if (n < 100) return `$${n.toFixed(2)}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function BlockBar({ percent, maxPercent, delay = 0 }: { percent: number; maxPercent: number; delay?: number }) {
  const BAR_WIDTH = 24;
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
    <span style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0", fontSize: "0.72rem", color: "#bbb" }}>
      {"█".repeat(filled)}{"░".repeat(BAR_WIDTH - filled)}
    </span>
  );
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

  if (!code && !stateTax) return null;

  const mono = "'JetBrains Mono', 'Courier New', monospace";

  function renderBreakdown(blurred = false) {
    if (!stateData) return null;
    const maxPercent = Math.max(...stateData.items.map((i) => i.percent));

    return (
      <div style={blurred ? { filter: "blur(4px)", pointerEvents: "none", userSelect: "none" } : {}}>
        <div>
          {stateData.items.map((item, i) => {
            const amount = (stateTax * item.percent) / 100;
            return (
              <div
                key={item.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0,1fr) auto auto",
                  gap: "0.5rem 0.75rem",
                  alignItems: "center",
                  padding: "0.35rem 0",
                  borderBottom: "1px solid #1a1a1a",
                  fontSize: "0.75rem",
                  fontFamily: mono,
                }}
              >
                <div style={{ color: "#e0e0e0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.name}
                </div>
                <div>
                  <BlockBar percent={item.percent} maxPercent={maxPercent} delay={i * 50} />
                  <span style={{ color: "#bbb", fontSize: "0.72rem", marginLeft: "0.4rem" }}>
                    {item.percent.toFixed(1)}%
                  </span>
                </div>
                <div style={{ color: "#fff", fontWeight: 700, textAlign: "right", whiteSpace: "nowrap" }}>
                  {formatCompact(amount)}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ color: "#888", fontSize: "0.7rem", textAlign: "center", marginTop: "0.75rem", fontFamily: mono }}>
          &gt; approx. based on {stateData.name} FY2024 enacted budget
        </div>
      </div>
    );
  }

  return (
    <section style={{ marginBottom: "1.5rem", fontFamily: mono }}>
      <div style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "1rem", padding: "0.5rem 0", borderTop: "1px solid #333", borderBottom: "1px solid #333" }}>
        [STATE TAX BREAKDOWN{code ? ` — ${code}` : ""}] ─── {formatDollars(stateTax)}
      </div>

      <div style={{ border: "1px solid #333", padding: "1rem 1.25rem" }}>
        {/* Total */}
        <div style={{ textAlign: "center", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid #222" }}>
          <div style={{ fontSize: "0.7rem", color: "#aaa", marginBottom: "0.2rem" }}>STATE TAX WITHHELD</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff" }}>{formatDollars(stateTax)}</div>
          {stateData && <div style={{ fontSize: "0.7rem", color: "#aaa", marginTop: "0.2rem" }}>{stateData.name}</div>}
        </div>

        {/* Not supported */}
        {!isSupported && code && (
          <div style={{ textAlign: "center", padding: "1.5rem 0", border: "1px solid #222" }}>
            <div style={{ color: "#bbb", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
              &gt; {code} breakdown coming soon
            </div>
            <div style={{ color: "#999", fontSize: "0.75rem" }}>
              adding all 50 states — check back soon
            </div>
          </div>
        )}

        {/* Full pro view */}
        {isSupported && showFull && renderBreakdown(false)}

        {/* Preview/locked */}
        {isSupported && !showFull && (
          <div>
            {!showPreview ? (
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => setShowPreview(true)}
                  className="btn-terminal"
                  style={{ padding: "0.5rem 1.25rem", fontSize: "0.8rem", borderColor: "#888", color: "#ccc" }}
                >
                  [ PREVIEW STATE BREAKDOWN (PRO) ]
                </button>
                <div style={{ color: "#888", fontSize: "0.7rem", marginTop: "0.4rem" }}>
                  &gt; see a preview with upgrade option
                </div>
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                {renderBreakdown(true)}
                {/* Lock overlay */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(0,0,0,0.85)",
                  border: "1px solid #333",
                }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>[ LOCKED ]</div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                    Pro Feature
                  </div>
                  <div style={{ color: "#bbb", fontSize: "0.75rem", marginBottom: "1rem", textAlign: "center", maxWidth: "280px" }}>
                    Unlock state breakdowns and more with TaxedFor Pro
                  </div>
                  <a
                    href="#stripe-checkout"
                    style={{
                      display: "inline-block",
                      backgroundColor: "#fff",
                      color: "#000",
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      padding: "0.5rem 1.25rem",
                      textDecoration: "none",
                      letterSpacing: "0.05em",
                    }}
                  >
                    [ UPGRADE — $4.99 ]
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
