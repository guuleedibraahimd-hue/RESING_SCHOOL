import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  School,
  Wallet,
  UserPlus,
  MessageCircle,
  BarChart3,
  CalendarCheck,
} from "lucide-react";

import logo from "../assets/logo.png";

const menus = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { name: "Add Student", icon: UserPlus, path: "/admin/add-student" },
  { name: "Add Teacher", icon: UserPlus, path: "/admin/add-teacher" },
  { name: "Add Cashier", icon: Wallet, path: "/admin/add-cashier" },
  { name: "Class", icon: School, path: "/admin/classes" },
  { name: "Parents", icon: Users, path: "/admin/parents" },
  { name: "Messages", icon: MessageCircle, path: "/admin/messages" },
  { name: "Reports", icon: BarChart3, path: "/admin/reports" },
];

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 270,
        minHeight: "100vh",
        background: "#ffffff",
        color: "#111827",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid rgba(17,24,39,0.06)",
      }}
    >
      <div>
        {/* Logo */}
        <div
          style={{
            padding: "24px 25px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: "linear-gradient(135deg,#6D5DF0,#8B5CF6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <img
              src={logo}
              alt=""
              style={{
                width: "72%",
                height: "72%",
                objectFit: "contain",
              }}
            />
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 16.5,
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.2,
              }}
            >
              Rising Star School
            </h2>
            <small style={{ color: "#9CA3AF", fontSize: 12 }}>
              Management System
            </small>
          </div>
        </div>

        {/* Menu */}
        <div style={{ padding: "8px 18px" }}>
          {menus.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "13px 18px",
                  marginBottom: 6,
                  textDecoration: "none",
                  color: isActive ? "#fff" : "#6B7280",
                  borderRadius: 14,
                  transition: "all .2s ease",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14.5,
                  background: isActive
                    ? "linear-gradient(90deg,#6D5DF0,#8B5CF6)"
                    : "transparent",
                  boxShadow: isActive
                    ? "0 8px 16px rgba(109,93,240,0.28)"
                    : "none",
                })}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Academic year card */}
      <div style={{ padding: 20 }}>
        <div
          style={{
            background: "linear-gradient(145deg,#F5F3FF,#EDE9FE)",
            border: "1px solid rgba(109,93,240,0.15)",
            borderRadius: 18,
            padding: "22px 18px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎓</div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#4C1D95" }}>
            Academic Year
          </div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 17,
              color: "#111827",
              marginTop: 2,
            }}
          >
            2025 - 2026
          </div>

          <div
            style={{
              marginTop: 12,
              height: 6,
              borderRadius: 6,
              background: "rgba(109,93,240,0.15)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "60%",
                height: "100%",
                background: "linear-gradient(90deg,#6D5DF0,#8B5CF6)",
                borderRadius: 6,
              }}
            />
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: "#7C3AED", fontWeight: 600 }}>
            60% Completed
          </div>
        </div>
      </div>
    </aside>
  );
}