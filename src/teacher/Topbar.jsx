import { useRef, useState } from "react";
import { Search, Bell, Menu, Mail, MailOpen, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMessages } from "../context/MessagesContext"; // Hubi path-kan

export default function Topbar({ teacherName = "Teacher" }) {
  const navigate = useNavigate();
  const { allMessages, unreadCount, markAsRead, markAllAsRead } = useMessages();

  const [open, setOpen] = useState(false);
  const [openMsg, setOpenMsg] = useState(null);
  const dropdownRef = useRef(null);

  const formatTime = (createdAt) => {
    if (!createdAt) return "";
    const d = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return d.toLocaleString();
  };

  const handleOpenMessage = (msg) => {
    markAsRead(msg);
    setOpenMsg(msg);
    setOpen(false);
  };

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
        position: "relative",
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

        {/* ---- Notification Bell (real, interactive) ---- */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <div
            onClick={() => setOpen(!open)}
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
            {unreadCount > 0 && (
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
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>

          {/* ---- Dropdown ---- */}
          {open && (
            <>
              {/* overlay si loo xiro marka meel kale la taabto */}
              <div
                onClick={() => setOpen(false)}
                style={{ position: "fixed", inset: 0, zIndex: 999 }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 65,
                  right: 0,
                  width: 360,
                  maxHeight: 420,
                  overflowY: "auto",
                  background: "#0B1120",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: 18,
                  boxShadow: "0 20px 50px rgba(0,0,0,.5)",
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    padding: "14px 18px",
                    borderBottom: "1px solid rgba(255,255,255,.06)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <strong style={{ color: "#fff" }}>Fariimaha</strong>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{
                        border: "none",
                        background: "none",
                        color: "#8B5CF6",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Dhammaan calaamadi akhriyay
                    </button>
                  )}
                </div>

                {allMessages.length === 0 ? (
                  <p style={{ padding: 20, color: "#64748B", textAlign: "center" }}>
                    Weli fariin lama helin.
                  </p>
                ) : (
                  allMessages.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleOpenMessage(m)}
                      style={{
                        padding: "12px 18px",
                        borderBottom: "1px solid rgba(255,255,255,.05)",
                        cursor: "pointer",
                        background: m.read ? "transparent" : "rgba(139,92,246,.10)",
                        display: "flex",
                        gap: 10,
                      }}
                    >
                      {m.read ? (
                        <MailOpen size={16} color="#64748B" style={{ marginTop: 2, flexShrink: 0 }} />
                      ) : (
                        <Mail size={16} color="#8B5CF6" style={{ marginTop: 2, flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              color: "#fff",
                              fontWeight: m.read ? 500 : 700,
                              fontSize: 14,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {m.subject || "(Cinwaan la'aan)"}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: "2px 0 0",
                            color: "#94A3B8",
                            fontSize: 12,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {m.body || m.text}
                        </p>
                        <span style={{ fontSize: 11, color: "#475569" }}>
                          {formatTime(m.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
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

      {/* ---- Modal-ka fariinta oo la furay ---- */}
      {openMsg && (
        <div
          onClick={() => setOpenMsg(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0B1120",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 20,
              padding: 28,
              width: "min(480px, 90vw)",
              boxShadow: "0 20px 60px rgba(0,0,0,.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 14,
              }}
            >
              <h2 style={{ margin: 0, color: "#fff", fontSize: 20 }}>
                {openMsg.subject}
              </h2>
              <button
                onClick={() => setOpenMsg(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}
              >
                <X size={22} />
              </button>
            </div>
            <p style={{ color: "#64748B", fontSize: 12, marginBottom: 16 }}>
              {formatTime(openMsg.createdAt)} •{" "}
              {openMsg.scope === "group" ? "Fariin Guud" : "Fariin Gaar ah"}
            </p>
            <p style={{ color: "#CBD5E1", fontSize: 15, lineHeight: 1.6 }}>
              {openMsg.body || openMsg.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}