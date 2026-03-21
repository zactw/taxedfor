"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import ResultsView from "./components/ResultsView";

export interface W2Data {
  federal: number;
  socialSecurity: number;
  medicare: number;
  stateTax: number;
  stateWages: number;
  state: string;
}

type InputMode = "manual" | "upload";

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[$,\s]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

export default function Home() {
  const [inputMode, setInputMode] = useState<InputMode>("manual");

  // Manual entry fields
  const [box2, setBox2] = useState("");
  const [box4, setBox4] = useState("");
  const [box6, setBox6] = useState("");
  const [box16, setBox16] = useState("");
  const [box17, setBox17] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);

  // Upload fields
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [results, setResults] = useState<W2Data | null>(null);
  const [showCursor, setShowCursor] = useState(true);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  // ─── Manual submit ───────────────────────────────────────────────────────────
  const handleManualSubmit = () => {
    setManualError(null);
    const federal = parseAmount(box2);
    if (!box2.trim()) {
      setManualError("> ERROR: Box 2 (Federal income tax withheld) is required");
      return;
    }
    const data: W2Data = {
      federal,
      socialSecurity: parseAmount(box4),
      medicare: parseAmount(box6),
      stateWages: parseAmount(box16),
      stateTax: parseAmount(box17),
      state: stateCode.trim().toUpperCase().slice(0, 2),
    };
    setResults(data);
  };

  // ─── Upload handlers ─────────────────────────────────────────────────────────
  const handleFile = useCallback((f: File) => {
    if (!f) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(f.type)) {
      setError("> ERROR: accepts .jpg .png .webp .pdf only");
      return;
    }
    setError(null);
    setFile(f);
    setResults(null);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const analyze = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const data: W2Data = await res.json();
      setResults(data);
    } catch (err: unknown) {
      setError(`> ERROR: ${err instanceof Error ? err.message : "Something went wrong. Please try again."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResults(null);
    setError(null);
    setManualError(null);
    setBox2("");
    setBox4("");
    setBox6("");
    setBox16("");
    setBox17("");
    setStateCode("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (results) {
    return <ResultsView data={results} onReset={reset} />;
  }

  // ─── Shared styles ────────────────────────────────────────────────────────────
  const mono: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
  };

  const inputStyle: React.CSSProperties = {
    background: "#000",
    border: "1px solid #444",
    color: "#fff",
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    fontSize: "0.85rem",
    padding: "0.3rem 0.5rem",
    width: "100%",
    outline: "none",
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem 1rem",
        backgroundColor: "#000",
        color: "#fff",
        ...mono,
      }}
    >
      {/* Header */}
      <div className="flicker" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ fontSize: "clamp(1.1rem, 4vw, 1.5rem)", fontWeight: 700, letterSpacing: "0.15em", marginBottom: "0.25rem" }}>
          TAXEDFOR.COM
        </div>
        <div style={{ color: "#777", fontSize: "0.75rem", letterSpacing: "0.1em" }}>
          ══════════════════════════════════════════
        </div>
        <div style={{ marginTop: "1.25rem", fontSize: "clamp(1.4rem, 5vw, 2.2rem)", fontWeight: 700 }}>
          <span>&gt; WHERE YOUR TAX DOLLARS GO</span>
          <span
            style={{
              marginLeft: "2px",
              opacity: showCursor ? 1 : 0,
              transition: "opacity 0.1s",
            }}
          >
            _
          </span>
        </div>
        <div style={{ color: "#bbb", marginTop: "0.75rem", fontSize: "0.9rem" }}>
          Enter your W-2 numbers. See the truth.
        </div>
      </div>

      {/* Input Area */}
      <div style={{ width: "100%", maxWidth: "540px" }}>

        {/* Mode Toggle */}
        <div style={{ marginBottom: "1.25rem", fontSize: "0.8rem", letterSpacing: "0.05em" }}>
          <span style={{ color: "#aaa" }}>&gt; INPUT METHOD: </span>
          <button
            onClick={() => setInputMode("manual")}
            style={{
              background: inputMode === "manual" ? "#fff" : "#000",
              color: inputMode === "manual" ? "#000" : "#aaa",
              border: `1px solid ${inputMode === "manual" ? "#fff" : "#666"}`,
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: "0.78rem",
              padding: "0.2rem 0.7rem",
              cursor: "pointer",
              letterSpacing: "0.05em",
              marginRight: "0.25rem",
            }}
          >
            [MANUAL ENTRY]
          </button>
          <button
            onClick={() => setInputMode("upload")}
            style={{
              background: inputMode === "upload" ? "#fff" : "#000",
              color: inputMode === "upload" ? "#000" : "#aaa",
              border: `1px solid ${inputMode === "upload" ? "#fff" : "#666"}`,
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: "0.78rem",
              padding: "0.2rem 0.7rem",
              cursor: "pointer",
              letterSpacing: "0.05em",
            }}
          >
            [UPLOAD W2]
          </button>
        </div>

        {/* ── Manual Entry Form ── */}
        {inputMode === "manual" && (
          <div
            style={{
              border: "1px solid #444",
              ...mono,
            }}
          >
            {/* Header row */}
            <div style={{ borderBottom: "1px solid #333", padding: "0.6rem 1rem", color: "#bbb", fontSize: "0.78rem" }}>
              &gt; ENTER YOUR W-2 BOX NUMBERS
            </div>
            <div style={{ color: "#555", padding: "0 1rem", fontSize: "0.75rem", paddingTop: "0.3rem" }}>
              {'─'.repeat(55)}
            </div>

            {/* Form rows */}
            <div style={{ padding: "0.5rem 1rem 1rem" }}>
              {/* Box 2 */}
              <div style={{ display: "grid", gridTemplateColumns: "4.5rem 1fr 7rem", gap: "0.5rem", alignItems: "center", padding: "0.35rem 0", borderBottom: "1px solid #111" }}>
                <span style={{ color: "#aaa", fontSize: "0.75rem" }}>Box 2</span>
                <span style={{ color: "#ddd", fontSize: "0.78rem" }}>Federal income tax withheld</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                  <span style={{ color: "#aaa" }}>$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={box2}
                    onChange={(e) => setBox2(e.target.value)}
                    placeholder="0.00"
                    style={{ ...inputStyle, width: "5.5rem" }}
                  />
                </div>
              </div>

              {/* Box 4 */}
              <div style={{ display: "grid", gridTemplateColumns: "4.5rem 1fr 7rem", gap: "0.5rem", alignItems: "center", padding: "0.35rem 0", borderBottom: "1px solid #111" }}>
                <span style={{ color: "#aaa", fontSize: "0.75rem" }}>Box 4</span>
                <span style={{ color: "#ddd", fontSize: "0.78rem" }}>Social Security tax</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                  <span style={{ color: "#aaa" }}>$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={box4}
                    onChange={(e) => setBox4(e.target.value)}
                    placeholder="0.00"
                    style={{ ...inputStyle, width: "5.5rem" }}
                  />
                </div>
              </div>

              {/* Box 6 */}
              <div style={{ display: "grid", gridTemplateColumns: "4.5rem 1fr 7rem", gap: "0.5rem", alignItems: "center", padding: "0.35rem 0", borderBottom: "1px solid #111" }}>
                <span style={{ color: "#aaa", fontSize: "0.75rem" }}>Box 6</span>
                <span style={{ color: "#ddd", fontSize: "0.78rem" }}>Medicare tax</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                  <span style={{ color: "#aaa" }}>$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={box6}
                    onChange={(e) => setBox6(e.target.value)}
                    placeholder="0.00"
                    style={{ ...inputStyle, width: "5.5rem" }}
                  />
                </div>
              </div>

              {/* Box 16 */}
              <div style={{ display: "grid", gridTemplateColumns: "4.5rem 1fr 7rem", gap: "0.5rem", alignItems: "center", padding: "0.35rem 0", borderBottom: "1px solid #111" }}>
                <span style={{ color: "#aaa", fontSize: "0.75rem" }}>Box 16</span>
                <span style={{ color: "#ddd", fontSize: "0.78rem" }}>State wages</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                  <span style={{ color: "#aaa" }}>$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={box16}
                    onChange={(e) => setBox16(e.target.value)}
                    placeholder="0.00"
                    style={{ ...inputStyle, width: "5.5rem" }}
                  />
                </div>
              </div>

              {/* Box 17 */}
              <div style={{ display: "grid", gridTemplateColumns: "4.5rem 1fr 7rem", gap: "0.5rem", alignItems: "center", padding: "0.35rem 0", borderBottom: "1px solid #111" }}>
                <span style={{ color: "#aaa", fontSize: "0.75rem" }}>Box 17</span>
                <span style={{ color: "#ddd", fontSize: "0.78rem" }}>State income tax withheld</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                  <span style={{ color: "#aaa" }}>$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={box17}
                    onChange={(e) => setBox17(e.target.value)}
                    placeholder="0.00"
                    style={{ ...inputStyle, width: "5.5rem" }}
                  />
                </div>
              </div>

              {/* State */}
              <div style={{ display: "grid", gridTemplateColumns: "4.5rem 1fr 7rem", gap: "0.5rem", alignItems: "center", padding: "0.35rem 0" }}>
                <span style={{ color: "#aaa", fontSize: "0.75rem" }}>State</span>
                <span style={{ color: "#ddd", fontSize: "0.78rem" }}>e.g. AZ, CA, TX</span>
                <input
                  type="text"
                  maxLength={2}
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value.toUpperCase())}
                  placeholder="--"
                  style={{ ...inputStyle, width: "3rem", textTransform: "uppercase", letterSpacing: "0.1em" }}
                />
              </div>
            </div>

            {/* Required note */}
            <div style={{ padding: "0 1rem 0.5rem", color: "#888", fontSize: "0.7rem" }}>
              &gt; Box 2 required — all other fields optional
            </div>

            {/* Submit */}
            <div style={{ borderTop: "1px solid #333", padding: "0.75rem 1rem" }}>
              <button
                onClick={handleManualSubmit}
                className="btn-terminal"
                style={{ width: "100%", padding: "0.6rem 1rem", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.08em" }}
              >
                [ CALCULATE ]
              </button>
            </div>

            {manualError && (
              <div style={{ padding: "0.5rem 1rem 0.75rem", color: "#aaa", fontSize: "0.78rem" }}>
                {manualError}
              </div>
            )}
          </div>
        )}

        {/* ── Upload W2 Form ── */}
        {inputMode === "upload" && (
          <div>
            {!file ? (
              <div
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `1px solid ${isDragging ? "#fff" : "#444"}`,
                  padding: "0",
                  cursor: "pointer",
                  backgroundColor: isDragging ? "#111" : "#000",
                  transition: "all 0.15s",
                  ...mono,
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  style={{ display: "none" }}
                  onChange={onInputChange}
                />
                <div style={{ padding: "2rem 1.5rem", textAlign: "center" }}>
                  <div style={{ color: "#ccc", marginBottom: "0.75rem", fontSize: "0.8rem", letterSpacing: "0.05em" }}>
                    &gt; DROP FILE HERE OR CLICK TO UPLOAD
                  </div>
                  <div style={{ color: "#999", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                    accepts: .jpg .png .webp .pdf
                  </div>
                  <div style={{ marginTop: "1.25rem", fontSize: "2rem", color: "#888" }}>[ ▲ ]</div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  border: "1px solid #fff",
                  ...mono,
                }}
              >
                <div style={{ borderBottom: "1px solid #333", padding: "0.75rem 1rem", color: "#bbb", fontSize: "0.8rem" }}>
                  ┌─ FILE LOADED ─────────────────────────────────┐
                </div>
                <div style={{ padding: "1rem 1.25rem" }}>
                  <div style={{ color: "#ddd", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                    &gt; loaded: <span style={{ color: "#fff" }}>{file.name}</span>
                  </div>
                  <div style={{ color: "#999", fontSize: "0.75rem" }}>
                    size: {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <div style={{ borderTop: "1px solid #333", padding: "0.75rem 1.25rem", display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={analyze}
                    disabled={isLoading}
                    className="btn-terminal"
                    style={{ flex: 1, padding: "0.6rem 1rem", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.08em" }}
                  >
                    {isLoading ? (
                      <span>[ ANALYZING... ]</span>
                    ) : (
                      <span>[ ANALYZE ]</span>
                    )}
                  </button>
                  <button
                    onClick={reset}
                    disabled={isLoading}
                    className="btn-terminal"
                    style={{ padding: "0.6rem 1rem", fontSize: "0.85rem", color: "#888", borderColor: "#444" }}
                  >
                    [ X ]
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  marginTop: "0.75rem",
                  border: "1px solid #555",
                  padding: "0.75rem 1rem",
                  color: "#aaa",
                  fontSize: "0.8rem",
                }}
              >
                {error}
              </div>
            )}

            {/* Privacy note */}
            <div style={{ marginTop: "0.75rem", color: "#888", fontSize: "0.72rem", ...mono }}>
              <div>&gt; NOTE: Your W2 is processed by Claude AI and never stored.</div>
              <div>&gt; For maximum privacy, use manual entry above.</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ color: "#777", fontSize: "0.7rem", marginTop: "2.5rem", textAlign: "center", maxWidth: "400px", ...mono }}>
        &gt; w2 data processed locally or via claude ai — never stored
      </div>

      {/* Legal disclaimer footer */}
      <div
        style={{
          marginTop: "2rem",
          width: "100%",
          maxWidth: "600px",
          borderTop: "1px solid #222",
          borderBottom: "1px solid #222",
          padding: "0.75rem 1rem",
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
    </main>
  );
}
