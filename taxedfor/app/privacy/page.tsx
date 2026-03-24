import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "TaxedFor privacy policy. Learn how we handle your W-2 data and protect your privacy. Your tax documents are processed securely and never stored.",
  openGraph: {
    title: "Privacy Policy | TaxedFor",
    description: "Learn how TaxedFor handles your W-2 data and protects your privacy.",
  },
};

const mono: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
};

export default function PrivacyPage() {
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

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ color: "#555", fontSize: "0.75rem", letterSpacing: "0.1em" }}>
            ══════════════════════════════════════════
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, letterSpacing: "0.1em", margin: "0.75rem 0 0.25rem" }}>
            TAXEDFOR.COM
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "0.15em", color: "#aaa" }}>
            &gt; PRIVACY POLICY
          </div>
          <div style={{ color: "#444", fontSize: "0.72rem", marginTop: "0.5rem" }}>
            Effective: March 2026
          </div>
          <div style={{ color: "#333", fontSize: "0.75rem", marginTop: "0.5rem" }}>
            {'─'.repeat(60)}
          </div>
        </div>

        {/* Section: Data Collection */}
        <div style={{ border: "1px solid #333", marginBottom: "1rem" }}>
          <div style={{ borderBottom: "1px solid #222", padding: "0.5rem 1rem", color: "#888", fontSize: "0.75rem" }}>
            [01] DATA COLLECTION
          </div>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", lineHeight: "1.8", color: "#ccc" }}>
            <p style={{ margin: 0 }}>
              &gt; We do NOT collect, store, or retain any W-2 data, tax
              information, or personal information entered or uploaded into
              TaxedFor. Your tax information stays yours.
            </p>
          </div>
        </div>

        {/* Section: W2 Uploads */}
        <div style={{ border: "1px solid #333", marginBottom: "1rem" }}>
          <div style={{ borderBottom: "1px solid #222", padding: "0.5rem 1rem", color: "#888", fontSize: "0.75rem" }}>
            [02] W-2 UPLOADS
          </div>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", lineHeight: "1.8", color: "#ccc" }}>
            <p style={{ margin: "0 0 0.5rem" }}>
              &gt; W-2 images you upload are processed in-memory only.
            </p>
            <p style={{ margin: "0 0 0.5rem" }}>
              &gt; Files are NEVER written to disk or stored in any database.
            </p>
            <p style={{ margin: 0 }}>
              &gt; Your document is immediately discarded after analysis is
              complete. No copies are retained on our servers.
            </p>
          </div>
        </div>

        {/* Section: Manual Entry */}
        <div style={{ border: "1px solid #333", marginBottom: "1rem" }}>
          <div style={{ borderBottom: "1px solid #222", padding: "0.5rem 1rem", color: "#888", fontSize: "0.75rem" }}>
            [03] MANUAL ENTRY
          </div>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", lineHeight: "1.8", color: "#ccc" }}>
            <p style={{ margin: 0 }}>
              &gt; Numbers entered manually are processed client-side in your
              browser and are never transmitted to our servers. The budget
              breakdown calculation happens entirely on your device.
            </p>
          </div>
        </div>

        {/* Section: API Processing */}
        <div style={{ border: "1px solid #333", marginBottom: "1rem" }}>
          <div style={{ borderBottom: "1px solid #222", padding: "0.5rem 1rem", color: "#888", fontSize: "0.75rem" }}>
            [04] W-2 UPLOAD PROCESSING
          </div>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", lineHeight: "1.8", color: "#ccc" }}>
            <p style={{ margin: "0 0 0.5rem" }}>
              &gt; When you upload a W-2, it is processed using AWS Textract,
              an OCR (Optical Character Recognition) service.
            </p>
            <p style={{ margin: "0 0 0.5rem" }}>
              &gt; <strong style={{ color: "#fff" }}>NO AI or LLM (Large Language Model) is used.</strong> Your
              tax document is NEVER sent to any artificial intelligence system.
            </p>
            <p style={{ margin: "0 0 0.5rem" }}>
              &gt; AWS Textract processes documents in-memory only and does NOT
              store any document data. Processing is instantaneous and data is
              immediately discarded after extraction.
            </p>
            <p style={{ margin: 0 }}>
              &gt; AWS Textract privacy:{" "}
              <a href="https://aws.amazon.com/textract/faqs/" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", textDecoration: "underline" }}>
                https://aws.amazon.com/textract/faqs/
              </a>
            </p>
          </div>
        </div>

        {/* Section: Cookies & Analytics */}
        <div style={{ border: "1px solid #333", marginBottom: "1rem" }}>
          <div style={{ borderBottom: "1px solid #222", padding: "0.5rem 1rem", color: "#888", fontSize: "0.75rem" }}>
            [05] COOKIES & ANALYTICS
          </div>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", lineHeight: "1.8", color: "#ccc" }}>
            <p style={{ margin: 0 }}>
              &gt; TaxedFor does not use tracking cookies or third-party
              analytics by default. No behavioral data, session data, or
              usage patterns are collected or sold.
            </p>
          </div>
        </div>

        {/* Section: Third Parties */}
        <div style={{ border: "1px solid #333", marginBottom: "1rem" }}>
          <div style={{ borderBottom: "1px solid #222", padding: "0.5rem 1rem", color: "#888", fontSize: "0.75rem" }}>
            [06] THIRD-PARTY SERVICES
          </div>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", lineHeight: "1.8", color: "#ccc" }}>
            <p style={{ margin: "0 0 0.5rem" }}>
              &gt; AWS Textract — OCR-based W-2 document parsing. This is NOT
              an AI/LLM service. Documents are processed in-memory only and
              never stored by AWS.
            </p>
            <p style={{ margin: 0 }}>
              &gt; Stripe — Payment processing for Pro upgrades (if purchased).
              Stripe&apos;s privacy policy applies to any payment transactions:
              <br />
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", textDecoration: "underline" }}>
                https://stripe.com/privacy
              </a>
            </p>
          </div>
        </div>

        {/* Section: Children */}
        <div style={{ border: "1px solid #333", marginBottom: "1rem" }}>
          <div style={{ borderBottom: "1px solid #222", padding: "0.5rem 1rem", color: "#888", fontSize: "0.75rem" }}>
            [07] CHILDREN&apos;S PRIVACY
          </div>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", lineHeight: "1.8", color: "#ccc" }}>
            <p style={{ margin: 0 }}>
              &gt; TaxedFor is not intended for users under the age of 13. We
              do not knowingly collect any information from children. If you
              believe a child has submitted information, contact us immediately.
            </p>
          </div>
        </div>

        {/* Section: Contact */}
        <div style={{ border: "1px solid #333", marginBottom: "1rem" }}>
          <div style={{ borderBottom: "1px solid #222", padding: "0.5rem 1rem", color: "#888", fontSize: "0.75rem" }}>
            [08] CONTACT
          </div>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", lineHeight: "1.8", color: "#ccc" }}>
            <p style={{ margin: 0 }}>
              &gt; For privacy concerns or questions, contact us at:
              <br />
              <a href="mailto:hello@taxedfor.com" style={{ color: "#fff", textDecoration: "underline" }}>
                hello@taxedfor.com
              </a>
            </p>
          </div>
        </div>

        {/* Section: Changes */}
        <div style={{ border: "1px solid #333", marginBottom: "2rem" }}>
          <div style={{ borderBottom: "1px solid #222", padding: "0.5rem 1rem", color: "#888", fontSize: "0.75rem" }}>
            [09] POLICY CHANGES
          </div>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", lineHeight: "1.8", color: "#ccc" }}>
            <p style={{ margin: 0 }}>
              &gt; This privacy policy may be updated from time to time.
              Continued use of TaxedFor after changes are posted constitutes
              acceptance of the revised policy. Check this page periodically
              for updates.
            </p>
          </div>
        </div>

        {/* Footer nav */}
        <div style={{ color: "#444", fontSize: "0.72rem", textAlign: "center", marginBottom: "1rem" }}>
          {'─'.repeat(60)}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", fontSize: "0.75rem", marginBottom: "2rem" }}>
          <Link href="/" style={{ color: "#888", textDecoration: "none" }}>[ HOME ]</Link>
          <Link href="/terms" style={{ color: "#888", textDecoration: "none" }}>[ TERMS ]</Link>
        </div>

        {/* Disclaimer footer */}
        <div
          style={{
            borderTop: "1px solid #222",
            borderBottom: "1px solid #222",
            padding: "0.75rem 1rem",
            color: "#444",
            fontSize: "0.7rem",
            lineHeight: "1.6",
          }}
        >
          <div style={{ color: "#333", marginBottom: "0.25rem" }}>{'─'.repeat(60)}</div>
          <div>
            &gt; DISCLAIMER: Budget allocations are approximations based on publicly available federal spending data. OCR parsing may contain errors. Not financial or tax advice.{" "}
            <Link href="/privacy" style={{ color: "#555", textDecoration: "underline" }}>[PRIVACY]</Link>{" "}
            <Link href="/terms" style={{ color: "#555", textDecoration: "underline" }}>[TERMS]</Link>
          </div>
          <div style={{ color: "#333", marginTop: "0.25rem" }}>{'─'.repeat(60)}</div>
        </div>

      </div>
    </main>
  );
}
