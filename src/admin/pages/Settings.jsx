// src/admin/pages/Settings.jsx
import { useState, useEffect } from "react";
import {
  getAuth,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, updateDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

/*
  Sida ay u shaqeyso:
  1. Admin-ku wuxuu geliyaa password-kiisa hadda jira (currentPassword) si loo
     xaqiijiyo (reauthenticate) — Firebase Auth waxay ku qasabtaa tan marka
     email/password la beddelayo, si kuma-jirin session dhow.
  2. Haddii uu doonayo inuu beddelo email -> updateEmail() ayaa Auth-ka lagu
     beddelaa, ka dibna Firestore-ka doc-ga admin-ka (collection "admins",
     ama halkaad ku keydsatay xogta admin-ka) ayaa lagu update gareeyaa
     si labada xog ay is le'ekaadaan.
  3. Haddii uu doonayo inuu beddelo password -> updatePassword() ayaa loo
     isticmaalaa, taas oo si toos ah u beddesha password-ka session-ka soo
     socda ee login-ka (Firebase Auth ayaa xafidda password-ka, ma aha
     Firestore — sidaas ayay u shaqeysaa si ammaan ah).
*/

export default function Settings() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text }

  useEffect(() => {
    if (user?.email) {
      setCurrentEmail(user.email);
    }
  }, [user]);

  async function findAdminDocByUid(uid) {
    // Isticmaal collection "admins" — beddel magaca collection-ka haddii
    // xogta admin-ka lagu keydiyay meel kale (tusaale: "users").
    const q = query(collection(db, "admins"), where("uid", "==", uid));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0];
    return null;
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage(null);

    if (!user) {
      setMessage({ type: "error", text: "Ma jiro isticmaale la soo galay (session dhamaatay). Fadlan mar kale soo gal." });
      return;
    }

    const wantsEmailChange = newEmail.trim() !== "" && newEmail.trim() !== currentEmail;
    const wantsPasswordChange = newPassword.trim() !== "";

    if (!wantsEmailChange && !wantsPasswordChange) {
      setMessage({ type: "error", text: "Fadlan geli email cusub ama password cusub si aad wax u beddesho." });
      return;
    }

    if (!currentPassword) {
      setMessage({ type: "error", text: "Waxaad u baahan tahay inaad gelisid password-kaaga hadda jira si loo xaqiijiyo isbedelka." });
      return;
    }

    if (wantsPasswordChange) {
      if (newPassword.length < 6) {
        setMessage({ type: "error", text: "Password-ka cusub waa inuu ka koobnaadaa ugu yaraan 6 xaraf." });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({ type: "error", text: "Password-ka cusub iyo xaqiijinta password-ku isku mid ma aha." });
        return;
      }
    }

    setLoading(true);
    try {
      // 1) Reauthenticate — waajib ah marka la beddelayo email/password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // 2) Beddel email haddii loo baahan yahay
      if (wantsEmailChange) {
        await updateEmail(user, newEmail.trim());

        // Sii u beddel Firestore si xogta admin-ka ay isku mid noqdaan
        const adminDoc = await findAdminDocByUid(user.uid);
        if (adminDoc) {
          await updateDoc(doc(db, "admins", adminDoc.id), {
            email: newEmail.trim(),
          });
        }
        setCurrentEmail(newEmail.trim());
      }

      // 3) Beddel password haddii loo baahan yahay
      if (wantsPasswordChange) {
        await updatePassword(user, newPassword);
      }

      setMessage({ type: "success", text: "Xogta si guul leh ayaa loo cusboonaysiiyay. Marka aad mar kale soo gasho, xogtan cusub ayaa loo isticmaali doonaa." });
      setNewEmail("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Khalad settings update:", err);
      let text = "Khalad ayaa dhacay. Fadlan isku day mar kale.";
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        text = "Password-ka hadda jira ee aad gelisay sax ma aha.";
      } else if (err.code === "auth/email-already-in-use") {
        text = "Email-kan horay ayaa loo isticmaalay account kale.";
      } else if (err.code === "auth/invalid-email") {
        text = "Email-ka aad gelisay sax ma aha.";
      } else if (err.code === "auth/requires-recent-login") {
        text = "Fadlan mar kale soo gal (log out/log in) kadibna isku day mar kale.";
      } else if (err.code === "auth/weak-password") {
        text = "Password-ku waa mid daacad ah — geli mid adag oo ka koobnaada ugu yaraan 6 xaraf.";
      }
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F3F4F8",
        fontFamily: "'Inter','Segoe UI',sans-serif",
      }}
    >
      <Sidebar />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ padding: "22px 26px 0" }}>
          <Topbar />
        </div>

        <div style={{ padding: "26px 30px", maxWidth: 640 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>
            Settings
          </h1>
          <p style={{ fontSize: 13.5, color: "#6B7280", margin: "0 0 24px" }}>
            Halkan ka beddel email-ka iyo password-ka account-ka admin-ka.
          </p>

          <form
            onSubmit={handleSave}
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: "26px 26px",
              boxShadow: "0 4px 18px rgba(17,24,39,0.06)",
              border: "1px solid rgba(17,24,39,0.05)",
            }}
          >
            {/* Current email display */}
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Email-ka Hadda</label>
              <div style={{ ...inputWrapStyle, background: "#F9FAFB" }}>
                <Mail size={16} color="#9CA3AF" />
                <input
                  type="email"
                  value={currentEmail}
                  disabled
                  style={{ ...inputStyle, color: "#6B7280" }}
                />
              </div>
            </div>

            {/* New email */}
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Email Cusub (ka bogeeya haddii aadan beddelin)</label>
              <div style={inputWrapStyle}>
                <Mail size={16} color="#9CA3AF" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="tusaale@resing.edu"
                  style={inputStyle}
                />
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #F3F4F6", margin: "22px 0" }} />

            {/* New password */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Password Cusub (ka bogeeya haddii aadan beddelin)</label>
              <div style={inputWrapStyle}>
                <Lock size={16} color="#9CA3AF" />
                <input
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ugu yaraan 6 xaraf"
                  style={inputStyle}
                />
                <button type="button" onClick={() => setShowNewPw((s) => !s)} style={eyeBtnStyle}>
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Xaqiiji Password Cusub</label>
              <div style={inputWrapStyle}>
                <Lock size={16} color="#9CA3AF" />
                <input
                  type={showNewPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ku celi password-ka cusub"
                  style={inputStyle}
                />
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #F3F4F6", margin: "22px 0" }} />

            {/* Current password (required for both) */}
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>
                <ShieldCheck size={14} style={{ marginRight: 4, verticalAlign: "-2px" }} />
                Password-ka Hadda Jira (waajib si loo xaqiijiyo)
              </label>
              <div style={inputWrapStyle}>
                <Lock size={16} color="#9CA3AF" />
                <input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Geli password-kaaga hadda"
                  style={inputStyle}
                />
                <button type="button" onClick={() => setShowCurrentPw((s) => !s)} style={eyeBtnStyle}>
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {message && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  marginBottom: 18,
                  background: message.type === "success" ? "#DCFCE7" : "#FEE2E2",
                  color: message.type === "success" ? "#166534" : "#DC2626",
                  fontWeight: 600,
                }}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px 0",
                borderRadius: 12,
                border: "none",
                background: loading ? "#86efac" : "#16a34a",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Kaydinaya..." : "Kaydi Isbedelada"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 700,
  color: "#374151",
  marginBottom: 8,
};

const inputWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  padding: "11px 14px",
  background: "#fff",
};

const inputStyle = {
  border: "none",
  outline: "none",
  flex: 1,
  fontSize: 13.5,
  color: "#111827",
  background: "transparent",
};

const eyeBtnStyle = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "#9CA3AF",
  display: "flex",
  alignItems: "center",
};