import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Menu } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebase";

import avatar from "../assets/avatar.png";

export default function Topbar() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "messages"), where("read", "==", false));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setUnreadCount(snap.docs.length);
      },
      (err) => {
        console.log(err);
      }
    );

    return () => unsub();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 20,
      }}
    >
      {/* LEFT */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "linear-gradient(135deg,#6D5DF0,#8B5CF6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            color: "#fff",
            boxShadow: "0 8px 18px rgba(109,93,240,0.3)",
            flexShrink: 0,
          }}
        >
          <Menu size={22} />
        </div>

        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 800,
              color: "#111827",
            }}
          >
            Ku Soo Dhawoow, Admin! 👋
          </h2>

          <p
            style={{
              margin: "4px 0 0",
              color: "#9CA3AF",
              fontSize: 13.5,
            }}
          >
            Halkaan waxaad ka maamuli kartaa iskuulkaaga.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: 280,
            height: 48,
            borderRadius: 30,
            background: "#F9FAFB",
            border: "1.5px solid rgba(17,24,39,0.08)",
            padding: "0 18px",
          }}
        >
          <Search size={17} color="#9CA3AF" />

          <input
            placeholder="Search anything..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#111827",
              fontSize: 14,
            }}
          />
        </div>

        <div
          onClick={() => navigate("/admin/messages")}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#F9FAFB",
            border: "1.5px solid rgba(17,24,39,0.08)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            cursor: "pointer",
          }}
        >
          <Bell size={19} color="#6D5DF0" />

          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#EF4444",
                color: "#fff",
                fontSize: 10.5,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: 700,
                border: "2px solid #fff",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>

        <img
          src={avatar}
          alt="Admin"
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            border: "2.5px solid #6D5DF0",
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  );
}