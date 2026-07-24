import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Mail, Calendar, Menu, ChevronDown, Camera } from "lucide-react";
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../firebase/firebase";

import avatar from "../assets/avatar.png";

export default function Topbar() {
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const msgQ = query(collection(db, "messages"), where("read", "==", false));
    const unsubMsg = onSnapshot(
      msgQ,
      (snap) => setUnreadMessages(snap.docs.length),
      (err) => console.log(err)
    );

    const notifQ = query(collection(db, "notifications"), where("read", "==", false));
    const unsubNotif = onSnapshot(
      notifQ,
      (snap) => setUnreadNotifications(snap.docs.length),
      (err) => console.log(err)
    );

    return () => {
      unsubMsg();
      unsubNotif();
    };
  }, []);

  // Load the admin's saved profile photo (admin/admin -> photoUrl) on mount.
  useEffect(() => {
    async function loadAdminPhoto() {
      try {
        const snap = await getDoc(doc(db, "admin", "admin"));
        if (snap.exists() && snap.data().photoUrl) {
          setPhotoUrl(snap.data().photoUrl);
        }
      } catch (err) {
        console.log(err);
      }
    }
    loadAdminPhoto();
  }, []);

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const storage = getStorage();
      const storageRef = ref(storage, `adminPhotos/admin-${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "admin", "admin"), { photoUrl: url });
      setPhotoUrl(url);
    } catch (err) {
      console.error("Khalad sawirka admin-ka la soo shubayay:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      {/* LEFT */}
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: "linear-gradient(135deg,#16a34a,#15803d)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          color: "#fff",
          flexShrink: 0,
        }}
      >
        <Menu size={20} />
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: 240,
            height: 42,
            borderRadius: 30,
            background: "#F9FAFB",
            border: "1.5px solid rgba(17,24,39,0.08)",
            padding: "0 16px",
          }}
        >
          <Search size={16} color="#9CA3AF" />
          <input
            placeholder="Search anything..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#111827",
              fontSize: 13.5,
            }}
          />
        </div>

        <IconButton onClick={() => navigate("/admin/messages")} badge={unreadNotifications} badgeColor="#EF4444">
          <Bell size={18} color="#6B7280" />
        </IconButton>

        <IconButton onClick={() => navigate("/admin/messages")} badge={unreadMessages} badgeColor="#16a34a">
          <Mail size={18} color="#6B7280" />
        </IconButton>

        <IconButton onClick={() => navigate("/admin/reports")}>
          <Calendar size={18} color="#6B7280" />
        </IconButton>

        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              position: "relative",
              width: 40,
              height: 40,
              flexShrink: 0,
              cursor: "pointer",
            }}
            title="Beddel sawirka profile-ka"
          >
            <img
              src={photoUrl || avatar}
              alt="Admin"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                objectFit: "cover",
                opacity: uploading ? 0.5 : 1,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#16a34a",
                border: "2px solid #fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Camera size={9} color="#fff" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>Admin User</div>
            <div style={{ fontSize: 11.5, color: "#9CA3AF" }}>Super Admin</div>
          </div>
          <ChevronDown size={16} color="#9CA3AF" />
        </div>
      </div>
    </div>
  );
}

function IconButton({ children, onClick, badge, badgeColor = "#EF4444" }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 42,
        height: 42,
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
      {children}
      {badge > 0 && (
        <span
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            minWidth: 16,
            height: 16,
            borderRadius: "50%",
            background: badgeColor,
            color: "#fff",
            fontSize: 9.5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 700,
            border: "2px solid #fff",
            padding: "0 3px",
          }}
        >
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </div>
  );
}