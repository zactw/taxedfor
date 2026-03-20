"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ResultsView from "./components/ResultsView";

export interface W2Data {
  federal: number;
  socialSecurity: number;
  medicare: number;
  stateTax: number;
  stateWages: number;
  state: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<W2Data | null>(null);
  const [showCursor, setShowCursor] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (results) {
    return <ResultsView data={results} onReset={reset} />;
  }

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
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      }}
    >
      {/* Header */}
      <div className="flicker" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ fontSize: "clamp(1.1rem, 4vw, 1.5rem)", fontWeight: 700, letterSpacing: "0.15em", marginBottom: "0.25rem" }}>
          TAXEDFOR.COM
        </div>
        <div style={{ color: "#555", fontSize: "0.75rem", letterSpacing: "0.1em" }}>
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
        <div style={{ color: "#888", marginTop: "0.75rem", fontSize: "0.9rem" }}>
          Upload your W-2. See the truth.
        </div>
      </div>

      {/* Upload Box */}
      <div style={{ width: "100%", maxWidth: "540px" }}>
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
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              style={{ display: "none" }}
              onChange={onInputChange}
            />
            {/* ASCII Box top */}
            <div style={{ padding: "0 1rem", color: "#444" }}>
              <div>┌{'─'.repeat(45)}┐</div>
            </div>
            <div style={{ padding: "0 1rem" }}>
              <div style={{ borderLeft: "1px solid #444", borderRight: "1px solid #444", padding: "1.5rem 1.5rem", textAlign: "center" }}>
                <div style={{ color: "#888", marginBottom: "0.75rem", fontSize: "0.8rem", letterSpacing: "0.05em" }}>
                  &gt; DROP FILE HERE OR CLICK TO UPLOAD
                </div>
                <div style={{ color: "#333", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                  accepts: .jpg .png .webp .pdf
                </div>
                <div style={{ marginTop: "1.25rem", fontSize: "2rem", color: "#444" }}>[ ▲ ]</div>
              </div>
            </div>
            <div style={{ padding: "0 1rem", color: "#444" }}>
              <div>└{'─'.repeat(45)}┘</div>
            </div>
          </div>
        ) : (
          <div
            style={{
              border: "1px solid #fff",
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            }}
          >
            {/* Top border */}
            <div style={{ borderBottom: "1px solid #333", padding: "0.75rem 1rem", color: "#888", fontSize: "0.8rem" }}>
              ┌─ FILE LOADED ─────────────────────────────────┐
            </div>
            <div style={{ padding: "1rem 1.25rem" }}>
              <div style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                &gt; loaded: <span style={{ color: "#fff" }}>{file.name}</span>
              </div>
              <div style={{ color: "#555", fontSize: "0.75rem" }}>
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
                  <span>[ ANALYZE{showCursor ? "_" : " "} ]</span>
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
      </div>

      {/* Footer */}
      <div style={{ color: "#333", fontSize: "0.7rem", marginTop: "2.5rem", textAlign: "center", maxWidth: "400px" }}>
        &gt; w2 data analyzed via claude ai — never stored
      </div>
    </main>
  );
}
