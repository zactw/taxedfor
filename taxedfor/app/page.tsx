"use client";

import { useState, useRef, useCallback } from "react";
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
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<W2Data | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(f.type)) {
      setError("Please upload a JPG, PNG, WebP, or PDF file.");
      return;
    }
    setError(null);
    setFile(f);
    setResults(null);

    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
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
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (results) {
    return <ResultsView data={results} onReset={reset} />;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-16 bg-gray-950">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
          <span className="text-emerald-400 text-sm font-medium">🇺🇸 2024 Federal Budget Analysis</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
          See exactly where your<br />
          <span className="text-emerald-400">tax dollars go</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Upload your W2 and get a dollar-by-dollar breakdown of how the federal government spent your money.
        </p>
      </div>

      {/* Upload Box */}
      <div className="w-full max-w-lg">
        {!file ? (
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
              ${isDragging
                ? "border-emerald-400 bg-emerald-400/5"
                : "border-gray-700 hover:border-gray-500 hover:bg-gray-900/50"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              className="hidden"
              onChange={onInputChange}
            />
            <div className="text-5xl mb-4">📄</div>
            <p className="text-white font-semibold text-lg mb-1">
              Drop your W2 here
            </p>
            <p className="text-gray-500 text-sm mb-4">
              or click to browse
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {["JPG", "PNG", "WebP", "PDF"].map((fmt) => (
                <span key={fmt} className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded">
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            {preview ? (
              <div className="mb-4 rounded-xl overflow-hidden border border-gray-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="W2 preview" className="w-full max-h-64 object-contain bg-gray-800" />
              </div>
            ) : (
              <div className="mb-4 bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
                <div className="text-4xl mb-2">📑</div>
                <p className="text-gray-400 text-sm">{file.name}</p>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm text-gray-400 mb-5">
              <span className="text-emerald-400">✓</span>
              <span className="truncate font-medium text-gray-200">{file.name}</span>
              <span className="text-gray-600">·</span>
              <span>{(file.size / 1024).toFixed(1)} KB</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={analyze}
                disabled={isLoading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold py-3 px-6 rounded-xl transition-colors duration-150"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Analyzing…
                  </span>
                ) : (
                  "🔍 Analyze W2"
                )}
              </button>
              <button
                onClick={reset}
                disabled={isLoading}
                className="bg-gray-800 hover:bg-gray-700 disabled:opacity-60 text-gray-300 font-medium py-3 px-4 rounded-xl transition-colors duration-150"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Footer note */}
      <p className="text-gray-600 text-xs mt-12 text-center max-w-sm">
        Your W2 is analyzed locally and never stored. Data is sent to Claude AI for extraction only.
      </p>
    </main>
  );
}
