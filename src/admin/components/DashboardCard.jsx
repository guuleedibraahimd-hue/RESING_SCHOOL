import { MoreVertical } from "lucide-react";

export default function DashboardCard({
  title,
  value,
  color,
  icon,
  percent = "0%",
}) {
  return (
    <div
      style={{
        background: "linear-gradient(160deg,#151233,#181341)",
        border: `1px solid ${color}33`,
        borderRadius: 22,
        padding: 26,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        minHeight: 200,
        boxShadow: `0 10px 30px rgba(0,0,0,0.25)`,
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: `${color}18`,
          filter: "blur(10px)",
        }}
      />

      {/* Top */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 16,
            background: `${color}1f`,
            border: `1.5px solid ${color}55`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 26,
          }}
        >
          {icon}
        </div>

        <MoreVertical size={20} color="#8b87ad" />
      </div>

      {/* Number */}
      <div
        style={{
          marginTop: 20,
          position: "relative",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: -1,
          }}
        >
          {value}
        </h1>

        <h3
          style={{
            margin: "6px 0 0",
            fontWeight: 500,
            fontSize: 15,
            color: "#8b87ad",
          }}
        >
          {title}
        </h3>

        <p
          style={{
            color,
            fontWeight: 700,
            marginTop: 14,
            fontSize: 13.5,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          ↑ {percent}
          <span
            style={{
              color: "#6b6890",
              fontWeight: 400,
            }}
          >
            this month
          </span>
        </p>
      </div>

      {/* Bottom Wave */}
      <svg
        viewBox="0 0 400 50"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: 44,
          opacity: 0.7,
        }}
      >
        <path
          d="
            M0,30
            C20,10 40,10 60,30
            S100,50 120,30
            S160,10 180,30
            S220,50 240,30
            S280,10 300,30
            S340,50 360,30
            S390,10 400,30
          "
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}