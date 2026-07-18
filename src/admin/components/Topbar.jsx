import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Menu,
} from "lucide-react";
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
        background: "linear-gradient(160deg,#151233,#181341)",
        border: "1px solid rgba(139,108,245,0.2)",
        borderRadius: 22,
        padding: "22px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 20,
        color: "#fff",
      }}
    >
      {/* LEFT */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 15,
            background: "linear-gradient(135deg,#6D5DF0,#8B5CF6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(109,93,240,0.35)",
          }}
        >
          <Menu size={24} />
        </div>

        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            Ku Soo Dhawoow, Admin! 👋
          </h2>

          <p
            style={{
              margin: "4px 0 0",
              color: "#8b87ad",
              fontSize: 13.5,
            }}
          >
            Halkaan waxaad ka maamuli kartaa iskuulkaaga.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: 280,
            height: 48,
            borderRadius: 30,
            background: "rgba(255,255,255,0.03)",
            border: "1.5px solid rgba(139,108,245,0.25)",
            padding: "0 18px",
          }}
        >
          <Search size={17} color="#8b87ad" />

          <input
            placeholder="Search anything..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
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
            background: "rgba(255,255,255,0.03)",
            border: "1.5px solid rgba(139,108,245,0.25)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            cursor: "pointer",
          }}
        >
          <Bell size={19} color="#c4b8f7" />

          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 17,
                height: 17,
                borderRadius: "50%",
                background: "#EF4444",
                color: "#fff",
                fontSize: 10.5,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: 700,
                border: "2px solid #181341",
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