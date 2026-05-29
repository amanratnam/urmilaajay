import Link from "next/link";

export default function PhotoNotFound() {
  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        background: "var(--bg)",
        color: "var(--fg)",
        textAlign: "center",
        padding: "40px",
      }}
    >
      <h1
        style={{
          fontFamily: "Fraunces, Georgia, serif",
          fontSize: "clamp(48px, 8vw, 96px)",
          fontWeight: 300,
          color: "var(--fg)",
          lineHeight: 0.9,
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        This moment
        <br />
        <span style={{ color: "var(--fg-muted)", fontStyle: "italic" }}>has moved on.</span>
      </h1>
      <Link
        href="/"
        style={{
          fontFamily: "Outfit, sans-serif",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
          textDecoration: "none",
          marginTop: 16,
        }}
      >
        ← Back to the archive
      </Link>
    </div>
  );
}
