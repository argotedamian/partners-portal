import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          padding: 64,
          fontFamily: "Nunito Sans, Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 48,
            background: "linear-gradient(135deg, #EFF0FF 0%, #FFFFFF 60%)",
            border: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 64,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                background: "#FF366C",
              }}
            />
            <div style={{ fontSize: 34, fontWeight: 800, color: "#0F0054" }}>Hoggax</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#28a745" }}>(partners)</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 64, fontWeight: 900, color: "#0F0054", lineHeight: 1.05 }}>
              Hoggax Partners
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#171717", marginTop: 18 }}>
              Portal de cotización
            </div>
          </div>

          <div style={{ fontSize: 22, fontWeight: 700, color: "#FF366C" }}>partners.hoggax.com</div>
        </div>
      </div>
    ),
    size,
  );
}

