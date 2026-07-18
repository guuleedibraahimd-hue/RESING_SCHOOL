import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { LogOut } from "lucide-react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Profile() {
  const navigate = useNavigate();
  const teacherId = localStorage.getItem("teacherId") || "";

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    loadTeacher();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTeacher = async () => {
    try {
      setLoading(true);

      if (!teacherId) {
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "teachers", teacherId));
      if (snap.exists()) {
        const data = snap.data();
        setTeacher(data);
        setUsername(data.username || "");
        setPhotoUrl(data.photoUrl || "");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    if (!username.trim()) {
      alert("Username cannot be empty");
      return;
    }

    try {
      setSavingProfile(true);

      await updateDoc(doc(db, "teachers", teacherId), {
        username,
        photoUrl,
        updatedAt: new Date(),
      });

      localStorage.setItem("teacherName", username);
      localStorage.setItem("teacherPhoto", photoUrl);
      alert("Profile updated successfully");
    } catch (err) {
      console.log(err);
      alert(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill all password fields");
      return;
    }

    if (teacher && teacher.password && currentPassword !== teacher.password) {
      alert("Current password is incorrect");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    try {
      setSavingPassword(true);

      await updateDoc(doc(db, "teachers", teacherId), {
        password: newPassword,
        updatedAt: new Date(),
      });

      alert("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.log(err);
      alert(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("teacherId");
    localStorage.removeItem("teacherName");
    navigate("/login/teacher");
  };

  const teacherName = localStorage.getItem("teacherName") || "Teacher";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#05070D" }}>
      <Sidebar teacherName={teacherName} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar teacherName={teacherName} />

        <div style={{ padding: "0 20px 30px", maxWidth: 640 }}>
          {loading ? (
            <p style={{ color: "#94A3B8" }}>Loading profile...</p>
          ) : (
            <>
              <div style={section}>
                <h3 style={sectionTitle}>Photo & Username</h3>

                <div style={photoRow}>
                  {photoUrl ? (
                    <img src={photoUrl} alt="Profile" style={photoImg} />
                  ) : (
                    <div style={photoPlaceholder}>
                      {(username || "T").charAt(0).toUpperCase()}
                    </div>
                  )}

                  <label style={uploadBtn}>
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>

                <label style={label}>Username</label>
                <input
                  style={input}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  style={{ ...btnPrimary, marginTop: 16 }}
                >
                  {savingProfile ? "Saving..." : "Save Profile"}
                </button>
              </div>

              <div style={section}>
                <h3 style={sectionTitle}>Change Password</h3>

                <label style={label}>Current Password</label>
                <input
                  style={input}
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />

                <label style={label}>New Password</label>
                <input
                  style={input}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <label style={label}>Confirm New Password</label>
                <input
                  style={input}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button
                  onClick={changePassword}
                  disabled={savingPassword}
                  style={{ ...btnPrimary, marginTop: 16 }}
                >
                  {savingPassword ? "Saving..." : "Change Password"}
                </button>
              </div>

              <button onClick={logout} style={btnLogout}>
                <LogOut size={18} />
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const section = {
  background: "#0B1120",
  border: "1px solid rgba(255,255,255,.06)",
  borderRadius: 20,
  padding: 24,
  marginBottom: 24,
};
const sectionTitle = {
  marginTop: 0,
  color: "#fff",
};
const photoRow = {
  display: "flex",
  alignItems: "center",
  gap: 20,
  marginBottom: 20,
};
const photoImg = {
  width: 80,
  height: 80,
  borderRadius: "50%",
  objectFit: "cover",
  border: "3px solid #6D5DF0",
};
const photoPlaceholder = {
  width: 80,
  height: 80,
  borderRadius: "50%",
  background: "linear-gradient(135deg,#6D5DF0,#8B5CF6)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 28,
  fontWeight: "bold",
};
const uploadBtn = {
  background: "#111827",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 10,
  padding: "10px 16px",
  cursor: "pointer",
  fontSize: 14,
  color: "#fff",
};
const label = {
  display: "block",
  fontWeight: "bold",
  marginTop: 12,
  marginBottom: 6,
  color: "#94A3B8",
  fontSize: 13,
};
const input = {
  width: "100%",
  padding: "10px 12px",
  boxSizing: "border-box",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 10,
  background: "#111827",
  color: "#fff",
};
const btnPrimary = {
  background: "linear-gradient(90deg,#6D5DF0,#8B5CF6)",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "12px 24px",
  cursor: "pointer",
  fontWeight: "bold",
};
const btnLogout = {
  background: "#EF4444",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "12px 24px",
  cursor: "pointer",
  fontWeight: "bold",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  marginBottom: 30,
};