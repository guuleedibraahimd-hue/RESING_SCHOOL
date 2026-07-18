import { Search, Bell, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Topbar({ teacherName = "Teacher" }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: 90,
        background: "#0B1120",
        borderRadius: 20,
        margin: "20px",
        padding: "0 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#fff",
      }}
    >
      {/* LEFT */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 55,
            height: 55,
            borderRadius: 18,
            background: "linear-gradient(135deg,#6D5DF0,#8B5CF6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <Menu size={28} />
        </div>

        <div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
            Welcome, {teacherName} 👋
          </h2>
          <p style={{ margin: "5px 0 0", color: "#94A3B8" }}>
            Here's what's happening in your classes today.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: 280,
            height: 55,
            borderRadius: 30,
            background: "#111827",
            padding: "0 18px",
          }}
        >
          <Search color="#94A3B8" size={20} />
          <input
            placeholder="Search anything..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: 15,
            }}
          />
        </div>

        <div
          style={{
            width: 55,
            height: 55,
            borderRadius: "50%",
            background: "#111827",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            cursor: "pointer",
          }}
        >
          <Bell />
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#EF4444",
              color: "#fff",
              fontSize: 11,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
            }}
          >
            3
          </span>
        </div>

        <div
          onClick={() => navigate("/teacher/profile")}
          title="Profile"
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: "3px solid #6D5DF0",
            background: "linear-gradient(135deg,#6D5DF0,#8B5CF6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 20,
            cursor: "pointer",
            overflow: "hidden",
          }}
        >
          {localStorage.getItem("teacherPhoto") ? (
            <img
              src={localStorage.getItem("teacherPhoto")}
              alt="Teacher"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            (localStorage.getItem("teacherName") || "T")
              .charAt(0)
              .toUpperCase()
          )}
        </div>
      </div>
    </div>
  );
}