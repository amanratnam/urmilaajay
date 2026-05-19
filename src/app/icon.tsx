import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#12100E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
          fontSize: 22,
          fontWeight: 300,
          color: "#C9A878",
          fontStyle: "italic",
        }}
      >
        &amp;
      </div>
    ),
    { ...size }
  );
}
