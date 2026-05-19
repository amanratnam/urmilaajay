import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "Urmila & Ajay";
  const sub = searchParams.get("sub") ?? "Remembered with love, always.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#12100E",
          fontFamily: "Georgia, serif",
          gap: 20,
        }}
      >
        {/* Top rule */}
        <div style={{ width: 64, height: 1, background: "#C9A878", marginBottom: 8 }} />

        {/* Title */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 300,
            color: "#F2EDE4",
            letterSpacing: "-2px",
            lineHeight: 0.9,
            textAlign: "center",
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 300,
            color: "#8A8278",
            letterSpacing: "4px",
            textTransform: "uppercase",
            fontStyle: "italic",
            marginTop: 16,
          }}
        >
          {sub}
        </div>

        {/* Bottom rule */}
        <div style={{ width: 64, height: 1, background: "#C9A878", marginTop: 8 }} />

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 13,
            color: "#2A2622",
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          urmilaajay.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
