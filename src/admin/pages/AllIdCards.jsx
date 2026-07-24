// src/admin/pages/AllIdCards.jsx
// Admin page listing every issued ID card — students (from the
// `studentIdCards` collection) and teachers (from `teacher_id`) — in one
// searchable table. Search matches on ID number/username or full name.
// Selecting a row opens that card (front + back) with Print (native
// browser print dialog) and Download (PNG via html2canvas) controls.

import { useEffect, useMemo, useState } from "react";
import { useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Search, Printer, Download, IdCard, GraduationCap, Users } from "lucide-react";
import html2canvas from "html2canvas";

function formatDate(d) {
  if (!d) return "—";
  const dateObj = d?.seconds ? new Date(d.seconds * 1000) : new Date(d);
  if (isNaN(dateObj.getTime())) return "—";
  return dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const tableCardStyle = {
  background: "#fff",
  borderRadius: 18,
  padding: "22px 24px",
  boxShadow: "0 4px 18px rgba(17,24,39,0.06)",
  border: "1px solid rgba(17,24,39,0.05)",
};

export default function AllIdCards() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all | student | teacher
  const [selected, setSelected] = useState(null); // { type, data }

  const printRef = useRef(null);

  useEffect(() => {
    fetchAllCards();
  }, []);

  async function fetchAllCards() {
    try {
      setLoading(true);
      const [studentSnap, teacherSnap] = await Promise.all([
        getDocs(collection(db, "studentIdCards")),
        getDocs(collection(db, "teacher_id")),
      ]);

      setStudents(
        studentSnap.docs.map((d) => ({ id: d.id, type: "student", ...d.data() }))
      );
      setTeachers(
        teacherSnap.docs.map((d) => ({ id: d.id, type: "teacher", ...d.data() }))
      );
    } catch (err) {
      console.error("Failed to load ID cards:", err);
    } finally {
      setLoading(false);
    }
  }

  const combined = useMemo(() => {
    const all = [...students, ...teachers];
    return all;
  }, [students, teachers]);

  const filtered = useMemo(() => {
    let list = combined;
    if (typeFilter !== "all") {
      list = list.filter((r) => r.type === typeFilter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const idValue = (r.type === "student" ? r.studentId : r.teacherUsername || r.id || "").toString().toLowerCase();
        const nameValue = (r.fullName || r.name || "").toString().toLowerCase();
        return idValue.includes(q) || nameValue.includes(q);
      });
    }
    return list;
  }, [combined, query, typeFilter]);

  function handlePrint() {
    window.print();
  }

  async function handleDownload() {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
    });
    const link = document.createElement("a");
    const label = selected?.type === "teacher"
      ? (selected.data.teacherUsername || selected.data.id)
      : (selected?.data.studentId || selected?.data.id);
    link.download = `id-card-${label || "card"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F3F4F8", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <Sidebar />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ padding: "22px 26px 0" }} className="idcards-print-hide">
          <Topbar />
        </div>

        <div style={{ padding: "26px 30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }} className="idcards-print-hide">
            <IdCard size={22} color="#16a34a" />
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827" }}>
              All ID Cards
            </h1>
          </div>

          {/* Search + filters */}
          <div
            style={{
              ...tableCardStyle,
              display: "flex",
              gap: 14,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 20,
            }}
            className="idcards-print-hide"
          >
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <Search size={16} color="#9CA3AF" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by ID number or name..."
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  borderRadius: 10,
                  border: "1px solid rgba(17,24,39,0.1)",
                  fontSize: 13.5,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {[
                { key: "all", label: "All" },
                { key: "student", label: "Students" },
                { key: "teacher", label: "Teachers" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setTypeFilter(f.key)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    border: "1px solid rgba(22,163,74,0.25)",
                    background: typeFilter === f.key ? "#16a34a" : "transparent",
                    color: typeFilter === f.key ? "#fff" : "#16a34a",
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: "pointer",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: 20 }}>
            {/* Results table */}
            <div style={{ ...tableCardStyle, overflowX: "auto" }} className="idcards-print-hide">
              <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#111827" }}>
                {loading ? "Loading..." : `${filtered.length} card${filtered.length !== 1 ? "s" : ""} found`}
              </h3>

              {!loading && filtered.length === 0 && (
                <p style={{ fontSize: 13, color: "#9CA3AF" }}>Wax natiijo ah lama helin.</p>
              )}

              {filtered.length > 0 && (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 420 }}>
                  <thead>
                    <tr style={{ color: "#9CA3AF", textAlign: "left" }}>
                      <th style={{ fontWeight: 600, paddingBottom: 8 }}>Type</th>
                      <th style={{ fontWeight: 600, paddingBottom: 8 }}>ID</th>
                      <th style={{ fontWeight: 600, paddingBottom: 8 }}>Name</th>
                      <th style={{ fontWeight: 600, paddingBottom: 8 }}>Issued</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => {
                      const idValue = r.type === "student" ? r.studentId : (r.teacherUsername || r.id);
                      const nameValue = r.fullName || r.name || "—";
                      const isSelected = selected?.data.id === r.id && selected?.type === r.type;
                      return (
                        <tr
                          key={`${r.type}-${r.id}`}
                          onClick={() => setSelected({ type: r.type, data: r })}
                          style={{
                            borderTop: "1px solid #F3F4F6",
                            cursor: "pointer",
                            background: isSelected ? "#EFFBF3" : "transparent",
                          }}
                        >
                          <td style={{ padding: "10px 0" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "3px 9px",
                                borderRadius: 20,
                                background: r.type === "student" ? "#E6F5EC" : "#EDE9FE",
                                color: r.type === "student" ? "#16a34a" : "#7c3aed",
                              }}
                            >
                              {r.type === "student" ? <GraduationCap size={12} /> : <Users size={12} />}
                              {r.type === "student" ? "Student" : "Teacher"}
                            </span>
                          </td>
                          <td style={{ color: "#111827", fontWeight: 700 }}>{idValue || "—"}</td>
                          <td style={{ color: "#374151" }}>{nameValue}</td>
                          <td style={{ color: "#9CA3AF" }}>{formatDate(r.issuedAt || r.idIssuedAt || r.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Selected card preview */}
            {selected && (
              <div style={tableCardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }} className="idcards-print-hide">
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>
                    {selected.type === "student" ? "Student" : "Teacher"} ID Card
                  </h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={handlePrint}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 14px",
                        borderRadius: 10,
                        border: "none",
                        background: "#14532d",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 12.5,
                        cursor: "pointer",
                      }}
                    >
                      <Printer size={14} /> Print
                    </button>
                    <button
                      onClick={handleDownload}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 14px",
                        borderRadius: 10,
                        border: "1px solid rgba(20,83,45,0.3)",
                        background: "transparent",
                        color: "#14532d",
                        fontWeight: 700,
                        fontSize: 12.5,
                        cursor: "pointer",
                      }}
                    >
                      <Download size={14} /> Download
                    </button>
                  </div>
                </div>

                <div ref={printRef} id="idcards-printable">
                  <SelectedCardPreview selected={selected} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .idcards-print-hide { display: none !important; }
          body * { visibility: hidden; }
          #idcards-printable, #idcards-printable * { visibility: visible; }
          #idcards-printable {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

// Lightweight inline preview (front side summary) for the selected card.
// Reuses the same field layout as the student/teacher card components so
// it's visually consistent, but stays self-contained here since the
// admin view only needs a compact reference, not the full front+back
// card component tree.
function SelectedCardPreview({ selected }) {
  const { type, data } = selected;

  if (type === "student") {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          margin: "0 auto",
          border: "1px solid rgba(17,24,39,0.08)",
          borderRadius: 14,
          padding: 20,
          fontFamily: "'Poppins','Inter',sans-serif",
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 800, color: "#1c6b3a", marginBottom: 12 }}>
          RISING STAR SCHOOL
        </div>
        <Row label="STUDENT ID" value={data.studentId} />
        <Row label="NAME" value={data.fullName} />
        <Row label="CLASS" value={data.className} />
        <Row label="SHIFT" value={data.shift} />
        <Row label="ISSUE DATE" value={formatDate(data.issuedAt || data.idIssuedAt)} />
        <Row label="EXPIRY DATE" value={formatDate(data.expireDate)} />
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        margin: "0 auto",
        border: "1px solid rgba(17,24,39,0.08)",
        borderRadius: 14,
        padding: 20,
        fontFamily: "'Poppins','Inter',sans-serif",
      }}
    >
      <div style={{ fontSize: 17, fontWeight: 800, color: "#14532d", marginBottom: 12 }}>
        RISING STAR SCHOOL — TEACHER
      </div>
      <Row label="TEACHER ID" value={data.teacherUsername || data.id} />
      <Row label="NAME" value={data.fullName} />
      <Row label="MOTHER'S NAME" value={data.matherName || data.motherName || data.parentName} />
      <Row label="PHONE" value={data.phone || data.phoneNumber} />
      <Row label="SUBJECT" value={Array.isArray(data.subjects) ? data.subjects.join(", ") : data.subject} />
      <Row label="ISSUED" value={formatDate(data.issuedAt)} />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", gap: 10, fontSize: 13, marginBottom: 8 }}>
      <span style={{ fontWeight: 700, color: "#16202b", minWidth: 110 }}>{label}</span>
      <span style={{ fontWeight: 700, color: "#1c6b3a" }}>: {value || "—"}</span>
    </div>
  );
}