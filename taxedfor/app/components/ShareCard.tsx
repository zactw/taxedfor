"use client";

import { useRef, useState } from "react";

interface ShareCardProps {
  federal: number;
  socialSecurity: number;
  medicare: number;
  stateTax: number;
  state?: string;
}

const HIGHLIGHT_ITEMS = [
  { name: "Defense & Military", percent: 13.1 },
  { name: "Interest on Nat'l Debt", percent: 13.2 },
  { name: "Medicare", percent: 14.8 },
  { name: "Social Security", percent: 20.0 },
  { name: "Foreign Aid (USAID)", percent: 0.4 },
  { name: "NASA", percent: 0.4 },
  { name: "SNAP (Food Stamps)", percent: 1.7 },
  { name: "Education", percent: 1.2 },
];

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

// ASCII dollar sign art
const DOLLAR_ART = [
  "  ██████  ",
  " ██  ████ ",
  " ██ ██    ",
  "  ████    ",
  "    ████  ",
  " ████  ██ ",
  "  ██████  ",
];

export default function ShareCard({ federal, socialSecurity, medicare, stateTax, state }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  const totalTaxes = federal + socialSecurity + medicare + stateTax;

  async function handleShare() {
    if (!cardRef.current || sharing) return;
    setSharing(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#000000",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/png");
      });

      const file = new File([blob], "my-tax-breakdown-2024.png", { type: "image/png" });

      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Where My Tax Dollars Went — 2024",
          text: `I paid ${formatDollars(totalTaxes)} in taxes in 2024. Here's the breakdown. taxedfor.com`,
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "my-tax-breakdown-2024.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      setSharing(false);
    }
  }

  const mono = "'JetBrains Mono', 'Courier New', monospace";

  return (
    <div style={{ marginBottom: "2rem" }}>
      {/* The shareable card */}
      <div
        ref={cardRef}
        style={{
          backgroundColor: "#000000",
          border: "1px solid #ffffff",
          padding: "1.5rem",
          fontFamily: mono,
          color: "#ffffff",
        }}
      >
        {/* ASCII box top */}
        <div style={{ color: "#777", fontSize: "0.7rem", marginBottom: "0.5rem" }}>
          ┌{'─'.repeat(48)}┐
        </div>

        {/* Dollar ASCII art */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          {DOLLAR_ART.map((line, i) => (
            <div key={i} style={{ fontSize: "0.65rem", letterSpacing: "0.05em", color: "#fff", lineHeight: "1.3" }}>
              {line}
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "0.7rem", color: "#888", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>
            ── 2024 TAX YEAR ──────────────────────────────
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "0.1em" }}>
            YOUR TAX BREAKDOWN 2024
          </div>
          <div style={{ fontSize: "0.7rem", color: "#bbb", marginTop: "0.2rem" }}>
            federal withholding breakdown
          </div>
        </div>

        {/* Total */}
        <div style={{ border: "1px solid #333", padding: "0.75rem 1rem", textAlign: "center", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "0.7rem", color: "#aaa", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>
            TOTAL FEDERAL WITHHELD
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            {formatDollars(federal)}
          </div>
          {stateTax > 0 && (
            <div style={{ fontSize: "0.7rem", color: "#aaa", marginTop: "0.25rem" }}>
              + {formatDollars(stateTax)} state{state ? ` (${state})` : ""} · {formatDollars(socialSecurity + medicare)} FICA
            </div>
          )}
        </div>

        {/* Line items */}
        <div style={{ fontSize: "0.75rem" }}>
          {HIGHLIGHT_ITEMS.map((item) => {
            const amount = (federal * item.percent) / 100;
            return (
              <div
                key={item.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "0.5rem",
                  padding: "0.3rem 0",
                  borderBottom: "1px solid #111",
                }}
              >
                <span style={{ color: "#e0e0e0" }}>{item.name}</span>
                <span style={{ color: "#fff", fontWeight: 700, textAlign: "right" }}>
                  {formatCompact(amount)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "1.25rem", borderTop: "1px solid #222", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.7rem", color: "#444" }}>
          <span style={{ color: "#aaa" }}>FY2024 federal outlays (~$6.75T total)</span>
          <span style={{ color: "#fff", fontWeight: 700, letterSpacing: "0.1em" }}>TAXEDFOR.COM</span>
        </div>

        {/* ASCII box bottom */}
        <div style={{ color: "#777", fontSize: "0.7rem", marginTop: "0.5rem" }}>
          └{'─'.repeat(48)}┘
        </div>
      </div>

      {/* Share button */}
      <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
        <button
          onClick={handleShare}
          disabled={sharing}
          className="btn-terminal"
          style={{
            padding: "0.6rem 1.5rem",
            fontSize: "0.85rem",
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            letterSpacing: "0.05em",
          }}
        >
          {sharing ? "[ GENERATING... ]" : "[ SHARE MY BREAKDOWN ]"}
        </button>
        <div style={{ color: "#888", fontSize: "0.7rem", marginTop: "0.4rem" }}>
          &gt; saves as PNG — perfect for twitter or reddit
        </div>
      </div>
    </div>
  );
}
