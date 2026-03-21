"use client";

import { useState, useEffect } from "react";

const PRO_DISMISSED_KEY = "taxedfor_pro_dismissed";

const PRO_FEATURES = [
  { name: "State breakdown", free: false },
  { name: "Bill impact simulator", badge: "coming soon", free: false },
  { name: "Year-over-year comparison", badge: "coming soon", free: false },
  { name: "Premium share card", free: false },
  { name: "Federal breakdown", free: true },
  { name: "Basic share card", free: true },
];

export default function ProUpgrade() {
  const [visible, setVisible] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(PRO_DISMISSED_KEY);
    const pro = localStorage.getItem("isPro") === "true";
    setIsPro(pro);
    if (!dismissed && !pro) {
      setVisible(true);
    }
  }, []);

  function handleDismiss() {
    sessionStorage.setItem(PRO_DISMISSED_KEY, "1");
    setVisible(false);
  }

  if (!visible || isPro) return null;

  const mono = "'JetBrains Mono', 'Courier New', monospace";

  return (
    <div
      style={{
        border: "1px solid #fff",
        marginBottom: "1.5rem",
        fontFamily: mono,
      }}
    >
      {/* Top border label */}
      <div style={{ borderBottom: "1px solid #333", padding: "0.6rem 1rem", color: "#bbb", fontSize: "0.75rem" }}>
        ┌─ UNLOCK TAXEDFOR PRO ───────────────────────────┐
      </div>

      <div style={{ padding: "1rem 1.25rem" }}>
        {/* Separator */}
        <div style={{ color: "#555", fontSize: "0.75rem", marginBottom: "0.75rem", letterSpacing: "0.05em" }}>
          ─────────────────────────────────────────────────
        </div>

        {/* Features */}
        <div style={{ marginBottom: "1rem" }}>
          {PRO_FEATURES.map((f) => (
            <div
              key={f.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.3rem 0",
                fontSize: "0.8rem",
                color: f.free ? "#888" : "#ddd",
                borderBottom: "1px solid #111",
              }}
            >
              <span style={{ color: f.free ? "#777" : "#fff", fontWeight: 700, flexShrink: 0 }}>
                {f.free ? "[ ]" : "[✓]"}
              </span>
              <span style={{ flex: 1 }}>{f.name}</span>
              {f.badge && (
                <span style={{ fontSize: "0.65rem", color: "#aaa", border: "1px solid #555", padding: "0 0.35rem" }}>
                  {f.badge}
                </span>
              )}
              {f.free && (
                <span style={{ fontSize: "0.65rem", color: "#888", fontStyle: "italic" }}>free</span>
              )}
            </div>
          ))}
        </div>

        {/* Price */}
        <div style={{ textAlign: "center", marginBottom: "1rem", padding: "0.75rem", border: "1px solid #333" }}>
          <div style={{ fontSize: "0.7rem", color: "#aaa", marginBottom: "0.2rem" }}>ONE-TIME PAYMENT</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>$4.99</div>
          <div style={{ fontSize: "0.65rem", color: "#999" }}>no subscription. no nonsense.</div>
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <a
            href="#stripe-checkout"
            style={{
              flex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.6rem 1rem",
              backgroundColor: "#fff",
              color: "#000",
              fontFamily: mono,
              fontSize: "0.82rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textDecoration: "none",
              border: "1px solid #fff",
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            [ UPGRADE NOW ]
          </a>
          <button
            onClick={handleDismiss}
            className="btn-terminal"
            style={{
              padding: "0.6rem 1rem",
              fontSize: "0.8rem",
              borderColor: "#444",
              color: "#666",
            }}
          >
            [ MAYBE LATER ]
          </button>
        </div>
      </div>

      {/* Bottom border label */}
      <div style={{ borderTop: "1px solid #333", padding: "0.4rem 1rem", color: "#777", fontSize: "0.75rem" }}>
        └─────────────────────────────────────────────────┘
      </div>
    </div>
  );
}
