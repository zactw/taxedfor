"use client";

import { useState, useEffect } from "react";

const PRO_DISMISSED_KEY = "taxedfor_pro_dismissed";

const PRO_FEATURES = [
  { emoji: "🗺️", name: "State tax breakdown", badge: null, free: false },
  { emoji: "📊", name: "Bill impact simulator", badge: "Coming Soon", free: false },
  { emoji: "📈", name: "Year-over-year comparison", badge: "Coming Soon", free: false },
  { emoji: "✨", name: "Premium share card with your name", badge: null, free: false },
  { emoji: "🏛️", name: "Federal breakdown", badge: null, free: true },
  { emoji: "📤", name: "Basic share card", badge: null, free: true },
];

export default function ProUpgrade() {
  const [visible, setVisible] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(PRO_DISMISSED_KEY);
    const pro = localStorage.getItem("isPro") === "true";
    setIsPro(pro);
    // Show only if not dismissed this session and not already pro
    if (!dismissed && !pro) {
      setVisible(true);
    }
  }, []);

  function handleDismiss() {
    sessionStorage.setItem(PRO_DISMISSED_KEY, "1");
    setVisible(false);
  }

  // Don't render if already pro or dismissed
  if (!visible || isPro) return null;

  return (
    <div className="bg-gradient-to-br from-gray-900 via-indigo-950/30 to-gray-900 border border-indigo-700/40 rounded-2xl p-6 mb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-500/30 rounded-full px-3 py-1 mb-3">
            <span className="text-indigo-400 text-xs font-semibold tracking-wide uppercase">TaxedFor Pro</span>
          </div>
          <h3 className="text-white font-bold text-xl leading-tight">
            Unlock the full picture
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            One-time payment. No subscription. No nonsense.
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-3xl font-black text-white">$4.99</div>
          <div className="text-gray-500 text-xs">one-time</div>
        </div>
      </div>

      {/* Features list */}
      <div className="space-y-2 mb-6">
        {PRO_FEATURES.map((feature) => (
          <div
            key={feature.name}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${
              feature.free
                ? "bg-gray-800/40 opacity-60"
                : "bg-indigo-900/20 border border-indigo-800/30"
            }`}
          >
            <span className={feature.free ? "text-gray-500 text-base" : "text-indigo-400 font-bold text-sm"}>
              {feature.free ? "✓" : "⭐"}
            </span>
            <span className="text-sm flex-1" style={{ color: feature.free ? "#6b7280" : "#e2e8f0" }}>
              {feature.emoji} {feature.name}
            </span>
            {feature.badge && (
              <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5 font-medium">
                {feature.badge}
              </span>
            )}
            {feature.free && (
              <span className="text-xs text-gray-600 italic">free</span>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <a
          href="#stripe-checkout"
          className="w-full sm:w-auto flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-150 shadow-lg shadow-indigo-900/40 text-center"
        >
          <span>⭐</span>
          Upgrade Now — $4.99
        </a>
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-400 text-sm transition-colors py-2 px-4"
        >
          Maybe Later
        </button>
      </div>

      <p className="text-gray-700 text-xs text-center mt-3">
        Secure checkout via Stripe. Instant access after payment.
      </p>
    </div>
  );
}
