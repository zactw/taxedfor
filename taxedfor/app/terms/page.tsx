import Link from "next/link";

const mono: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
};

export default function TermsPage() {
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
            &gt; TERMS OF SERVICE
          </div>
          <div style={{ color: "#444", fontSize: "0.72rem", marginTop: "0.5rem" }}>
            Effective: March 2026
          </div>
          <div style={{ color: "#333", fontSize: "0.75rem", marginTop: "0.5rem" }}>
            {'─'.repeat(60)}
          </div>
        </div>

        {/* Section: Acceptance */}
        <div style={{ border: "1px solid #333", marginBottom: "1rem" }}>
          <div style={{ borderBottom: "1px solid #222", padding: "0.5rem 1rem", color: "#888", fontSize: "0.75rem" }}>
            [01] ACCEPTANCE OF TERMS
          </div>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", lineHeight: "1.8", color: "#ccc" }}>
            <p style={{ margin: 0 }}>
              &gt; By accessing or using TaxedFor (&quot;the Service&quot;), you agree
              to be bound by these Terms of Service. If you do not agree, do
              not use the Service.
            </p>
          </div>
        </div>

        {/* Section: Description */}
        <div style={{ border: "1px solid #333", marginBottom: "1rem" }}>
          <div style={{ borderBottom: "1px solid #222", padding: "0.5rem 1rem", color: "#888", fontSize: "0.75rem" }}>
            [02] SERVICE DESCRIPTION
          </div>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", lineHeight: "1.8", color: "#ccc" }}>
            <p style={{ margin: 0 }}>
              &gt; TaxedFor is an educational tool that provides approximate
              breakdowns of how your tax dollars are allocated across federal
              and state budget categories. Data is derived from publicly
              available government spending information.
            </p>
          </div>
        </div>

        {/* Section: Accuracy — PROMINENT */}
        <div
          style={{
            border: "2px solid #fff",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              borderBottom: "1px solid #555",
              padding: "0.5rem 1rem",
              backgroundColor: "#111",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            [03] ⚠  ACCURACY DISCLAIMER — READ CAREFULLY
          </div>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", lineHeight: "1.9", color: "#ccc" }}>
            <p style={{ margin: "0 0 0.5rem", color: "#fff", fontWeight: 700 }}>
              &gt; IMPORTANT: TaxedFor provides ESTIMATES only. Read all of the following:
            </p>
            <div style={{ color: "#333", margin: "0.25rem 0" }}>{'─'.repeat(58)}</div>
            <p style={{ margin: "0.5rem 0" }}>
              &gt; Budget allocation percentages are APPROXIMATIONS derived from
              publicly available federal and state spending data. They may not
              reflect the most current fiscal year allocations.
            </p>
            <p style={{ margin: "0.5rem 0" }}>
              &gt; AI-powered W-2 parsing may contain errors or misread values
              from your document. Always verify extracted numbers match your
              actual W-2 before relying on any output.
            </p>
            <p style={{ margin: "0.5rem 0" }}>
              &gt; Online data sources may not be updated in real time and may
              not reflect recent legislative budget changes.
            </p>
            <div style={{ color: "#333", margin: "0.25rem 0" }}>{'─'.repeat(58)}</div>
            <p style={{ margin: "0.5rem 0", color: "#fff", fontWeight: 700 }}>
              &gt; TaxedFor is NOT a tax preparation service.
            </p>
            <p style={{ margin: "0.5rem 0", color: "#fff", fontWeight: 700 }}>
              &gt; TaxedFor does NOT provide tax, legal, or financial advice.
            </p>
            <p style={{ margin: "0.5rem 0", color: "#fff", fontWeight: 700 }}>
              &gt; Results should NOT be used for tax filing, financial
              planning, or legal purposes.
            </p>
            <div style={{ color: "#333", margin: "0.25rem 0" }}>{'─'.repeat(58)}</div>
            <p style={{ margin: "0.5rem 0" }}>
              &gt; Always consult a qualified tax professional or CPA for
              official tax matters, filing assistance, or financial advice.
            </p>
          </div>
        </div>

        {/* Section: User Responsibilities */}
        <div style={{ border: "1px solid #333", marginBottom: "1rem" }}>
          <div style={{ borderBottom: "1px solid #222", padding: "0.5rem 1rem", color: "#888", fontSize: "0.75rem" }}>
            [04] USER RESPONSIBILITIES
          </div>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", lineHeight: "1.8", color: "#ccc" }}>
            <p style={{ margin: "0 0 0.5rem" }}>
              &gt; You are solely responsible for the accuracy of information
              you enter or upload into TaxedFor.
            </p>
            <p style={{ margin: 0 }}>
              &gt; Do NOT upload W-2 documents or tax information belonging to
              other individuals without their explicit consent. Misuse of this
              Service for unauthorized access to others&apos; tax information is
              prohibited and may be illegal.
            </p>
          </div>
        </div>

        {/* Section: Intellectual Property */}
        <div style={{ border: "1px solid #333", marginBottom: "1rem" }}>
          <div style={{ borderBottom: "1px solid #222", padding: "0.5rem 1rem", color: "#888", fontSize: "0.75rem" }}>
            [05] INTELLECTUAL PROPERTY
          </div>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", lineHeight: "1.8", color: "#ccc" }}>
            <p style={{ margin: 0 }}>
              &gt; TaxedFor, its design, content, and codebase are owned by the
              operator. All rights reserved. Unauthorized reproduction,
              modification, or distribution is prohibited.
            </p>
          </div>
        </div>

        {/* Section: Limitation of Liability */}
        <div style={{ border: "1px solid #333", marginBottom: "1rem" }}>
          <div style={{ borderBottom: "1px solid #222", padding: "0.5rem 1rem", color: "#888", fontSize: "0.75rem" }}>
            [06] LIMITATION OF LIABILITY
          </div>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", lineHeight: "1.8", color: "#ccc" }}>
            <p style={{ margin: "0 0 0.5rem" }}>
              &gt; The Service is provided &quot;AS IS&quot; without warranties of any
              kind, express or implied.
            </p>
            <p style={{ margin: 0 }}>
              &gt; To the fullest extent permitted by law, the operator shall
              not be liable for any inaccuracies in budget data, AI parsing
              errors, damages, losses, or consequences arising from your use
              of this Service — including but not limited to reliance on
              figures for tax filing or financial decisions.
            </p>
          </div>
        </div>

        {/* Section: Indemnification */}
        <div style={{ border: "1px solid #333", marginBottom: "1rem" }}>
          <div style={{ borderBottom: "1px solid #222", padding: "0.5rem 1rem", color: "#888", fontSize: "0.75rem" }}>
            [07] INDEMNIFICATION
          </div>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", lineHeight: "1.8", color: "#ccc" }}>
            <p style={{ margin: 0 }}>
              &gt; You agree to indemnify, defend, and hold harmless the
              operator and its affiliates from any claims, damages, or expenses
              (including legal fees) arising from your misuse of the Service
              or violation of these Terms.
            </p>
          </div>
        </div>

        {/* Section: Governing Law */}
        <div style={{ border: "1px solid #333", marginBottom: "1rem" }}>
          <div style={{ borderBottom: "1px solid #222", padding: "0.5rem 1rem", color: "#888", fontSize: "0.75rem" }}>
            [08] GOVERNING LAW
          </div>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", lineHeight: "1.8", color: "#ccc" }}>
            <p style={{ margin: 0 }}>
              &gt; These Terms shall be governed by and construed in accordance
              with the laws of the State of Arizona, USA, without regard to
              its conflict of law provisions.
            </p>
          </div>
        </div>

        {/* Section: Disputes */}
        <div style={{ border: "1px solid #333", marginBottom: "1rem" }}>
          <div style={{ borderBottom: "1px solid #222", padding: "0.5rem 1rem", color: "#888", fontSize: "0.75rem" }}>
            [09] DISPUTE RESOLUTION
          </div>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", lineHeight: "1.8", color: "#ccc" }}>
            <p style={{ margin: "0 0 0.5rem" }}>
              &gt; In the event of a dispute, both parties agree to first attempt
              resolution through good faith negotiation.
            </p>
            <p style={{ margin: 0 }}>
              &gt; If negotiation fails, disputes shall be resolved through
              binding arbitration in Maricopa County, Arizona, under the rules
              of a mutually agreed arbitration body.
            </p>
          </div>
        </div>

        {/* Section: Termination */}
        <div style={{ border: "1px solid #333", marginBottom: "1rem" }}>
          <div style={{ borderBottom: "1px solid #222", padding: "0.5rem 1rem", color: "#888", fontSize: "0.75rem" }}>
            [10] TERMINATION
          </div>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", lineHeight: "1.8", color: "#ccc" }}>
            <p style={{ margin: 0 }}>
              &gt; We reserve the right to suspend or terminate access to the
              Service at any time, with or without notice, for any violation
              of these Terms or for any other reason at our sole discretion.
            </p>
          </div>
        </div>

        {/* Section: Contact */}
        <div style={{ border: "1px solid #333", marginBottom: "2rem" }}>
          <div style={{ borderBottom: "1px solid #222", padding: "0.5rem 1rem", color: "#888", fontSize: "0.75rem" }}>
            [11] CONTACT
          </div>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", lineHeight: "1.8", color: "#ccc" }}>
            <p style={{ margin: 0 }}>
              &gt; Questions about these Terms? Contact us at:
              <br />
              <a href="mailto:hello@taxedfor.com" style={{ color: "#fff", textDecoration: "underline" }}>
                hello@taxedfor.com
              </a>
            </p>
          </div>
        </div>

        {/* Footer nav */}
        <div style={{ color: "#444", fontSize: "0.72rem", textAlign: "center", marginBottom: "1rem" }}>
          {'─'.repeat(60)}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", fontSize: "0.75rem", marginBottom: "2rem" }}>
          <Link href="/" style={{ color: "#888", textDecoration: "none" }}>[ HOME ]</Link>
          <Link href="/privacy" style={{ color: "#888", textDecoration: "none" }}>[ PRIVACY ]</Link>
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
            &gt; DISCLAIMER: Budget allocations are approximations based on publicly available federal spending data and may not reflect exact real-time figures. AI parsing may contain errors. Not financial or tax advice.{" "}
            <Link href="/privacy" style={{ color: "#555", textDecoration: "underline" }}>[PRIVACY]</Link>{" "}
            <Link href="/terms" style={{ color: "#555", textDecoration: "underline" }}>[TERMS]</Link>
          </div>
          <div style={{ color: "#333", marginTop: "0.25rem" }}>{'─'.repeat(60)}</div>
        </div>

      </div>
    </main>
  );
}
