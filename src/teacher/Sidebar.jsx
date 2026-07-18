import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck2,
  FileEdit,
  BarChart3,
  GraduationCap,
  User,
  LogOut,
} from "lucide-react";

const menus = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/teacher/dashboard" },
  { name: "Attendance", icon: CalendarCheck2, path: "/teacher/attendance" },
  { name: "Exams", icon: FileEdit, path: "/teacher/exams" },
  { name: "Results", icon: BarChart3, path: "/teacher/results" },
  { name: "Students", icon: GraduationCap, path: "/teacher/students" },
  { name: "Profile", icon: User, path: "/teacher/profile" },
];

export default function Sidebar({ teacherName = "Teacher" }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("teacherId");
    localStorage.removeItem("teacherName");
    localStorage.removeItem("teacherPhoto");
    navigate("/login/teacher");
  };

  return (
    <aside
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
            gap: 15,
          }}
        >
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
            }}
          >
            🏫
          </div>

          <div>
            <h2 style={{ margin: 0, fontSize: 22 }}>
              {localStorage.getItem("teacherName") || "Teacher"}
            </h2>
            <small style={{ color: "#94A3B8" }}>Teacher Panel</small>
          </div>
        </div>

        <div style={{ padding: "10px 18px" }}>
          {menus.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
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
                <span>{item.name}</span>
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
              }}
            >
              {(localStorage.getItem("teacherName") || "T")
                .charAt(0)
                .toUpperCase()}
            </div>
          )}

          <div>
            <div style={{ fontWeight: 700 }}>{teacherName}</div>
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
  );
}