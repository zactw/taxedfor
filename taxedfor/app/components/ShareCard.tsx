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
  { emoji: "🛡️", name: "Defense & Military", percent: 13.1 },
  { emoji: "💳", name: "Interest on Nat'l Debt", percent: 13.2 },
  { emoji: "🏥", name: "Medicare", percent: 14.8 },
  { emoji: "👴", name: "Social Security", percent: 20.0 },
  { emoji: "🌍", name: "Foreign Aid (USAID)", percent: 0.4 },
  { emoji: "🚀", name: "NASA", percent: 0.4 },
  { emoji: "🍎", name: "SNAP (Food Stamps)", percent: 1.7 },
  { emoji: "📚", name: "Education", percent: 1.2 },
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
  if (n < 1) return `${(n * 100).toFixed(1)}¢`;
  if (n < 100) return `$${n.toFixed(2)}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

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
        backgroundColor: null,
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
          text: `I paid ${formatDollars(totalTaxes)} in taxes in 2024. Here's the breakdown. 🇺🇸 taxedfor.com`,
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

  return (
    <div className="mb-10">
      {/* The shareable card */}
      <div
        ref={cardRef}
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          borderRadius: "20px",
          padding: "32px",
          border: "1px solid rgba(99,102,241,0.3)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              display: "inline-block",
              background: "rgba(99,102,241,0.2)",
              border: "1px solid rgba(99,102,241,0.4)",
              borderRadius: "999px",
              padding: "4px 16px",
              color: "#a5b4fc",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            🇺🇸 2024 Tax Year
          </div>
          <h2
            style={{
              color: "#fff",
              fontSize: "28px",
              fontWeight: 800,
              margin: "0 0 4px",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            Where My Tax Dollars Went
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
            Federal withholding breakdown
          </p>
        </div>

        {/* Total box */}
        <div
          style={{
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: "12px",
            padding: "16px",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <p style={{ color: "#6ee7b7", fontSize: "12px", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Total Federal Withheld
          </p>
          <p style={{ color: "#fff", fontSize: "36px", fontWeight: 900, margin: 0, letterSpacing: "-0.03em" }}>
            {formatDollars(federal)}
          </p>
          <p style={{ color: "#64748b", fontSize: "11px", margin: "4px 0 0" }}>
            {state ? `+ ${formatDollars(stateTax)} state (${state}) · ` : ""}
            {formatDollars(socialSecurity + medicare)} FICA
          </p>
        </div>

        {/* Line items grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
          {HIGHLIGHT_ITEMS.map((item) => {
            const amount = (federal * item.percent) / 100;
            return (
              <div
                key={item.name}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "18px", flexShrink: 0 }}>{item.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#cbd5e1", fontSize: "11px", margin: "0 0 2px", fontWeight: 600, lineHeight: 1.2 }}>
                    {item.name}
                  </p>
                  <p style={{ color: "#a5b4fc", fontSize: "13px", fontWeight: 700, margin: 0 }}>
                    {formatCompact(amount)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Watermark footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "14px",
          }}
        >
          <p style={{ color: "#475569", fontSize: "11px", margin: 0 }}>
            Based on FY2024 federal outlays (~$6.75T total)
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "14px" }}>🦞</span>
            <span style={{ color: "#6366f1", fontSize: "13px", fontWeight: 700, letterSpacing: "-0.01em" }}>
              taxedfor.com
            </span>
          </div>
        </div>
      </div>

      {/* Share button */}
      <div className="text-center mt-4">
        <button
          onClick={handleShare}
          disabled={sharing}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-150 shadow-lg shadow-indigo-900/40"
        >
          {sharing ? (
            <>
              <span className="animate-spin text-lg">⏳</span>
              Generating...
            </>
          ) : (
            <>
              <span className="text-lg">📤</span>
              Share My Breakdown
            </>
          )}
        </button>
        <p className="text-gray-600 text-xs mt-2">Saves as PNG — perfect for Twitter or Reddit</p>
      </div>
    </div>
  );
}
