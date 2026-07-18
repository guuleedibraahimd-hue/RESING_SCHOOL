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
  Settings,
  LogOut,
} from "lucide-react";

import logo from "../assets/logo.png";

const menus = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { name: "Students", icon: GraduationCap, path: "/admin/students" },
  { name: "Teachers", icon: Users, path: "/admin/teachers" },
  { name: "Classes", icon: School, path: "/admin/classes" },
  { name: "Attendance", icon: CalendarCheck, path: "/admin/attendance" },
  { name: "Cashiers", icon: Wallet, path: "/admin/cashiers" },
  { name: "Parents", icon: Users, path: "/admin/parents" },
  { name: "Messages", icon: MessageCircle, path: "/admin/messages" },
  { name: "Reports", icon: BarChart3, path: "/admin/reports" },
  { name: "Add Cashier", icon: UserPlus, path: "/admin/add-cashier" },
];

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 270,
        minHeight: "100vh",
        background: "linear-gradient(180deg,#0B1120 0%,#0D1326 100%)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid rgba(139,108,245,0.12)",
      }}
    >
      <div>
        <div
          style={{
            padding: "26px 25px 22px",
            display: "flex",
            alignItems: "center",
            gap: 15,
            borderBottom: "1px solid rgba(139,108,245,0.12)",
          }}
        >
          <div
            style={{
              width: 55,
              height: 55,
              borderRadius: "50%",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 6px 18px rgba(109,93,240,0.35)",
              border: "2px solid rgba(139,108,245,0.5)",
              overflow: "hidden",
            }}
          >
            <img
              src={logo}
              alt=""
              style={{
                width: "88%",
                height: "88%",
                objectFit: "contain",
                borderRadius: "50%",
              }}
            />
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: 0.3,
                background: "linear-gradient(90deg,#fff,#c4b8f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              RESING ERP
            </h2>

            <small
              style={{
                color: "#8b87ad",
                fontSize: 12.5,
              }}
            >
              School Management
            </small>
          </div>
        </div>

        <div
          style={{
            padding: "16px 18px",
          }}
        >
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
                  padding: "13px 18px",
                  marginBottom: 6,
                  textDecoration: "none",
                  color: isActive ? "#fff" : "#9CA3C4",
                  borderRadius: 14,
                  transition: "all .2s ease",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14.5,
                  background: isActive
                    ? "linear-gradient(90deg,#6D5DF0,#8B5CF6)"
                    : "transparent",
                  boxShadow: isActive
                    ? "0 6px 16px rgba(109,93,240,0.35)"
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

      <div
        style={{
          padding: 20,
        }}
      >
        <div
          style={{
            background: "linear-gradient(145deg,#151233,#181341)",
            border: "1px solid rgba(139,108,245,0.25)",
            borderRadius: 18,
            padding: 15,
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 15,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#6D5DF0,#8B5CF6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            A
          </div>

          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14.5,
              }}
            >
              Admin User
            </div>

            <small
              style={{
                color: "#8b87ad",
                fontSize: 12,
              }}
            >
              Super Admin
            </small>
          </div>
        </div>

        <button
          style={{
            width: "100%",
            height: 48,
            border: "1px solid rgba(239,68,68,0.35)",
            borderRadius: 14,
            background: "rgba(239,68,68,0.12)",
            color: "#F87171",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
            fontWeight: 700,
            fontSize: 14.5,
            transition: "all .2s ease",
          }}
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}