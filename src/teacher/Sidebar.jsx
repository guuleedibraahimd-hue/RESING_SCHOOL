// src/teacher/Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  CalendarCheck2,
  FileEdit,
  BarChart3,
  GraduationCap,
  Mail,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useMessages } from "../context/MessagesContext"; // Hubi path-kan

const menus = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/teacher/dashboard" },
  { name: "Attendance", icon: CalendarCheck2, path: "/teacher/attendance" },
  { name: "Messages", icon: Mail, path: "/teacher/messages" },
  { name: "Exams", icon: FileEdit, path: "/teacher/exams" },
  { name: "Results", icon: BarChart3, path: "/teacher/results" },
  { name: "Students", icon: GraduationCap, path: "/teacher/students" },
  { name: "Profile", icon: User, path: "/teacher/profile" },
];

function SidebarStyles() {
  return (
    <style>{`
      .tsb-mobile-topbar { display: none; }
      .tsb-overlay { display: none; }

      @media (max-width: 900px) {
        /* Sidebar-ka desktop-ka waa la qariyaa gabi ahaanba marka uusan open ahayn,
           si uusan u qabsan meel ka mid ah bogga (dhibaatada sawirka 1) */
        .tsb-aside {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 60;
          width: 260px !important;
          box-shadow: 0 0 40px rgba(0,0,0,.5);
        }
        .tsb-aside.open {
          display: flex;
        }
        .tsb-mobile-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          background: #0B1120;
          border-bottom: 1px solid rgba(255,255,255,.08);
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .tsb-overlay {
          display: block;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.55);
          z-index: 50;
        }
        .tsb-close-btn { display: flex !important; }
      }
    `}</style>
  );
}

export default function Sidebar({ teacherName = "Teacher" }) {
  const navigate = useNavigate();
  const { unreadCount } = useMessages();
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("teacherId");
    localStorage.removeItem("teacherName");
    localStorage.removeItem("teacherPhoto");
    navigate("/login/teacher");
  };

  const closeMenu = () => setOpen(false);

  return (
    <>
      <SidebarStyles />

      {/* Mobile top bar with hamburger */}
      <div className="tsb-mobile-topbar">
        <button
          onClick={() => setOpen(true)}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,.15)",
            borderRadius: 10,
            color: "#fff",
            padding: 8,
            display: "flex",
            cursor: "pointer",
          }}
        >
          <Menu size={20} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "linear-gradient(135deg,#6D5DF0,#8B5CF6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            🏫
          </div>
          <div
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 160,
            }}
          >
            {teacherName}
          </div>
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* Overlay for mobile drawer */}
      {open && <div className="tsb-overlay" onClick={closeMenu} />}

      <aside
        className={`tsb-aside${open ? " open" : ""}`}
        style={{
          width: 270,
          minHeight: "100vh",
          background: "#0B1120",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRight: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <div>
          <div
            style={{
              padding: 25,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 15,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 15, minWidth: 0 }}>
              <div
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: 15,
                  background: "linear-gradient(135deg,#6D5DF0,#8B5CF6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  flexShrink: 0,
                }}
              >
                🏫
              </div>

              <div style={{ minWidth: 0 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 22,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {localStorage.getItem("teacherName") || "Teacher"}
                </h2>
                <small style={{ color: "#94A3B8" }}>Teacher Panel</small>
              </div>
            </div>

            <button
              onClick={closeMenu}
              className="tsb-close-btn"
              style={{
                background: "transparent",
                border: "none",
                color: "#94A3B8",
                cursor: "pointer",
                display: "none",
                flexShrink: 0,
              }}
            >
              <X size={22} />
            </button>
          </div>

          <div style={{ padding: "10px 18px", overflowY: "auto" }}>
            {menus.map((item) => {
              const Icon = item.icon;
              const isMessages = item.path === "/teacher/messages";

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMenu}
                  style={({ isActive }) => ({
                    display: "flex",
                    alignItems: "center",
                    gap: 15,
                    padding: "14px 18px",
                    marginBottom: 8,
                    textDecoration: "none",
                    color: "#fff",
                    borderRadius: 15,
                    transition: ".3s",
                    background: isActive
                      ? "linear-gradient(90deg,#6D5DF0,#8B5CF6)"
                      : "transparent",
                  })}
                >
                  <Icon size={20} />
                  <span style={{ flex: 1 }}>{item.name}</span>
                  {isMessages && unreadCount > 0 && (
                    <span
                      style={{
                        background: "#EF4444",
                        color: "#fff",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        minWidth: 18,
                        textAlign: "center",
                      }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        <div style={{ padding: 20 }}>
          <div
            style={{
              background: "#111827",
              borderRadius: 18,
              padding: 15,
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 15,
            }}
          >
            {localStorage.getItem("teacherPhoto") ? (
              <img
                src={localStorage.getItem("teacherPhoto")}
                alt="Teacher"
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #6D5DF0",
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#6D5DF0,#8B5CF6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {(localStorage.getItem("teacherName") || "T")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {teacherName}
              </div>
              <small style={{ color: "#94A3B8" }}>Teacher</small>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              width: "100%",
              height: 50,
              border: "none",
              borderRadius: 15,
              background: "#EF4444",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}