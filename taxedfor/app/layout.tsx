import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaxedFor — See exactly where your tax dollars go",
  description:
    "Upload your W2 and see a visual breakdown of exactly where your federal tax dollars were spent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#000000",
          color: "#ffffff",
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        }}
      >
        {children}
      </body>
    </html>
  );
}
