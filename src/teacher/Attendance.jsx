import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  setDoc,
  doc,
} from "firebase/firestore";
import { Users, UserCheck, UserX, Clock } from "lucide-react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Attendance() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [existingSessions, setExistingSessions] = useState([]);
  const [sessionSaved, setSessionSaved] = useState(false);

  const teacherId = localStorage.getItem("teacherId") || "";
  const teacherName = localStorage.getItem("teacherName") || "Teacher";

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass);
    } else {
      setStudents([]);
      setAttendance({});
      setExistingSessions([]);
      setSessionSaved(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, date]);

  const loadClasses = async () => {
    try {
      const snap = await getDocs(collection(db, "teachers"));
      const allClassNames = new Set();

      snap.docs.forEach((d) => {
        const data = d.data();
        const teacherClasses = Array.isArray(data.classes) ? data.classes : [];
        teacherClasses.forEach((c) => {
          if (c.className) allClassNames.add(c.className);
        });
      });

      const uniqueClasses = Array.from(allClassNames)
        .sort()
        .map((className) => ({ id: className, className }));

      setClasses(uniqueClasses);
    } catch (err) {
      console.log(err);
    }
  };

  const loadStudents = async (className) => {
    try {
      setLoading(true);
      setSessionSaved(false);

      const snap = await getDocs(
        query(collection(db, "students"), where("className", "==", className))
      );
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStudents(list);

      // Check Firestore itself (not local state) for any attendance already
      // saved today for this class + teacher. This is what makes the lock
      // survive a page refresh — sessionSaved was previously just local
      // React state, so reloading the page reset it to false and let the
      // teacher save a duplicate session for the same day.
      const existingSnap = await getDocs(
        query(
          collection(db, "attendance"),
          where("className", "==", className),
          where("date", "==", date),
          where("teacherId", "==", teacherId)
        )
      );

      const sessionNumbers = new Set();
      existingSnap.docs.forEach((d) => {
        const data = d.data();
        if (typeof data.sessionNumber === "number") {
          sessionNumbers.add(data.sessionNumber);
        }
      });
      const sessionsArr = Array.from(sessionNumbers).sort((a, b) => a - b);
      setExistingSessions(sessionsArr);

      const alreadySavedToday = sessionsArr.length > 0;
      setSessionSaved(alreadySavedToday);

      if (alreadySavedToday) {
        // Show what was actually recorded instead of resetting to "Present".
        const latestSession = Math.max(...sessionsArr);
        const savedMap = {};
        existingSnap.docs.forEach((d) => {
          const data = d.data();
          if (data.sessionNumber === latestSession) {
            savedMap[data.studentId] = data.status;
          }
        });
        setAttendance(savedMap);
      } else {
        const initial = {};
        list.forEach((s) => {
          initial[s.id] = "Present";
        });
        setAttendance(initial);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const setStatus = (studentId, status) => {
    if (sessionSaved) return;
    setAttendance({ ...attendance, [studentId]: status });
  };

  const markAll = (status) => {
    if (sessionSaved) return;
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendance(updated);
  };

  const saveAttendance = async () => {
    if (!selectedClass) {
      alert("Please select a class first");
      return;
    }

    if (sessionSaved) {
      alert("Xiisaddan horey ayaa loo kaydiyay. Ma kaydin kartid mar labaad.");
      return;
    }

    try {
      setSaving(true);

      const nextSessionNumber =
        existingSessions.length > 0 ? Math.max(...existingSessions) + 1 : 1;

      const sessionStartTime = new Date();
      const timeLabel = sessionStartTime.toLocaleTimeString();

      for (const student of students) {
        const docId = `${selectedClass}_${student.id}_${date}_s${nextSessionNumber}`;

        await setDoc(doc(db, "attendance", docId), {
          studentId: student.id,
          studentName: student.fullName,
          className: selectedClass,
          teacherId,
          date,
          sessionNumber: nextSessionNumber,
          sessionTime: timeLabel,
          status: attendance[student.id] || "Present",
          updatedAt: new Date(),
        });
      }

      setExistingSessions([...existingSessions, nextSessionNumber]);
      setSessionSaved(true);

      alert(
        `Attendance saved successfully (Xiisadda #${nextSessionNumber} - ${timeLabel})`
      );
    } catch (err) {
      console.log(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter((s) => attendance[s.id] === "Present").length;
  const absentCount = students.filter((s) => attendance[s.id] === "Absent").length;
  const totalCount = students.length;
  const presentPct = totalCount ? ((presentCount / totalCount) * 100).toFixed(2) : "0.00";
  const absentPct = totalCount ? ((absentCount / totalCount) * 100).toFixed(2) : "0.00";

  const filteredStudents = students.filter((s) =>
    (s.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.studentId || s.id || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#05070D" }}>
      <Sidebar teacherName={teacherName} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar teacherName={teacherName} />

        <div style={{ padding: "0 20px 30px" }}>
          {sessionSaved && (
            <div style={lockedBanner}>
              🔒 Xaadirintii maalintan ({date}) waa la kaydiyay ee waa la
              xiray. Waxaad mar kale furan kartaa maalinta soo socota.
            </div>
          )}

          {/* Summary cards */}
          <div style={cardsRow}>
            <div style={card}>
              <div style={{ ...iconCircle, background: "rgba(109,93,240,0.15)" }}>
                <Users size={20} color="#6D5DF0" />
              </div>
              <div>
                <div style={cardValue}>{totalCount}</div>
                <div style={cardLabel}>Total Students</div>
              </div>
            </div>

            <div style={card}>
              <div style={{ ...iconCircle, background: "rgba(34,197,94,0.15)" }}>
                <UserCheck size={20} color="#22C55E" />
              </div>
              <div>
                <div style={cardValue}>{presentCount}</div>
                <div style={cardLabel}>Present ({presentPct}%)</div>
              </div>
            </div>

            <div style={card}>
              <div style={{ ...iconCircle, background: "rgba(239,68,68,0.15)" }}>
                <UserX size={20} color="#EF4444" />
              </div>
              <div>
                <div style={cardValue}>{absentCount}</div>
                <div style={cardLabel}>Absent ({absentPct}%)</div>
              </div>
            </div>

            <div style={card}>
              <div style={{ ...iconCircle, background: "rgba(23,162,184,0.15)" }}>
                <Clock size={20} color="#17A2B8" />
              </div>
              <div>
                <div style={cardValue}>{existingSessions.length}</div>
                <div style={cardLabel}>Xiisadaha Maanta</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={filterCard}>
            <div style={filtersRow}>
              <div>
                <label style={label}>Class</label>
                <select
                  style={input}
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.className}>
                      {c.className}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={label}>Date</label>
                <input
                  type="date"
                  style={input}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div style={{ flex: 1, minWidth: 220 }}>
                <label style={label}>Search Student</label>
                <input
                  style={input}
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button
                style={{
                  ...btnAction,
                  background: "#22C55E",
                  opacity: sessionSaved ? 0.5 : 1,
                  cursor: sessionSaved ? "not-allowed" : "pointer",
                }}
                onClick={() => markAll("Present")}
                disabled={sessionSaved}
              >
                ✓ Mark All Present
              </button>
              <button
                style={{
                  ...btnAction,
                  background: "#EF4444",
                  opacity: sessionSaved ? 0.5 : 1,
                  cursor: sessionSaved ? "not-allowed" : "pointer",
                }}
                onClick={() => markAll("Absent")}
                disabled={sessionSaved}
              >
                ✕ Mark All Absent
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={tableCard}>
            {loading ? (
              <p style={{ padding: 20, color: "#94A3B8" }}>Loading students...</p>
            ) : students.length === 0 ? (
              <p style={{ padding: 20, color: "#94A3B8" }}>
                {selectedClass
                  ? "No students found in this class."
                  : "Select a class to load students."}
              </p>
            ) : (
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>#</th>
                    <th style={th}>Student Name</th>
                    <th style={th}>Student ID</th>
                    <th style={th}>Status</th>
                    <th style={th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, i) => (
                    <tr key={s.id}>
                      <td style={td}>{i + 1}</td>
                      <td style={{ ...td, display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            ...avatar,
                            background: s.studentPhoto
                              ? `url(${s.studentPhoto}) center/cover`
                              : "linear-gradient(135deg,#6D5DF0,#8B5CF6)",
                          }}
                        >
                          {!s.studentPhoto &&
                            (s.fullName || "?").charAt(0).toUpperCase()}
                        </div>
                        {s.fullName}
                      </td>
                      <td style={td}>
                        <span style={idBadge}>{s.studentId || s.id}</span>
                      </td>
                      <td style={td}>
                        <span
                          style={{
                            ...statusBadge,
                            background:
                              attendance[s.id] === "Present"
                                ? "rgba(34,197,94,0.15)"
                                : "rgba(239,68,68,0.15)",
                            color:
                              attendance[s.id] === "Present" ? "#22C55E" : "#EF4444",
                          }}
                        >
                          ● {attendance[s.id] || "Present"}
                        </span>
                      </td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => setStatus(s.id, "Present")}
                            disabled={sessionSaved}
                            title="Present"
                            style={{
                              ...circleBtn,
                              background:
                                attendance[s.id] === "Present" ? "#22C55E" : "#1F2937",
                              color: attendance[s.id] === "Present" ? "white" : "#94A3B8",
                              cursor: sessionSaved ? "not-allowed" : "pointer",
                              opacity: sessionSaved ? 0.6 : 1,
                            }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setStatus(s.id, "Absent")}
                            disabled={sessionSaved}
                            title="Absent"
                            style={{
                              ...circleBtn,
                              background:
                                attendance[s.id] === "Absent" ? "#EF4444" : "#1F2937",
                              color: attendance[s.id] === "Absent" ? "white" : "#94A3B8",
                              cursor: sessionSaved ? "not-allowed" : "pointer",
                              opacity: sessionSaved ? 0.6 : 1,
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {students.length > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button
                onClick={saveAttendance}
                disabled={saving || sessionSaved}
                style={{
                  ...btnPrimary,
                  opacity: sessionSaved ? 0.6 : 1,
                  cursor: sessionSaved ? "not-allowed" : "pointer",
                }}
              >
                {saving
                  ? "Saving..."
                  : sessionSaved
                  ? "✅ Xiisaddan waa la Kaydiyay"
                  : "💾 Save Attendance"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const lockedBanner = {
  background: "rgba(239,68,68,0.12)",
  border: "1px solid rgba(239,68,68,0.3)",
  color: "#FCA5A5",
  padding: "12px 16px",
  borderRadius: 12,
  marginBottom: 20,
  fontSize: 14,
  fontWeight: "bold",
};
const cardsRow = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 20,
  marginBottom: 24,
};
const card = {
  background: "#0B1120",
  border: "1px solid rgba(255,255,255,.06)",
  borderRadius: 20,
  padding: 20,
  display: "flex",
  alignItems: "center",
  gap: 16,
};
const iconCircle = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
const cardValue = {
  fontSize: 26,
  fontWeight: "bold",
  color: "#fff",
};
const cardLabel = {
  color: "#94A3B8",
  fontSize: 13,
};
const filterCard = {
  background: "#0B1120",
  border: "1px solid rgba(255,255,255,.06)",
  borderRadius: 20,
  padding: 20,
  marginBottom: 20,
};
const filtersRow = {
  display: "flex",
  gap: 20,
  flexWrap: "wrap",
};
const label = {
  display: "block",
  fontWeight: "bold",
  marginBottom: 6,
  fontSize: 13,
  color: "#94A3B8",
};
const input = {
  padding: "10px 12px",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 10,
  minWidth: 200,
  width: "100%",
  boxSizing: "border-box",
  background: "#111827",
  color: "#fff",
};
const btnAction = {
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "10px 18px",
  fontWeight: "bold",
  fontSize: 14,
};
const tableCard = {
  background: "#0B1120",
  border: "1px solid rgba(255,255,255,.06)",
  borderRadius: 20,
  overflowX: "auto",
};
const table = {
  width: "100%",
  borderCollapse: "collapse",
};
const th = {
  textAlign: "left",
  padding: "14px 16px",
  borderBottom: "1px solid rgba(255,255,255,.08)",
  color: "#94A3B8",
  fontSize: 13,
};
const td = {
  padding: "14px 16px",
  borderBottom: "1px solid rgba(255,255,255,.05)",
  fontSize: 14,
  color: "#E5E7EB",
};
const avatar = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  background: "linear-gradient(135deg,#6D5DF0,#8B5CF6)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  fontSize: 13,
};
const idBadge = {
  background: "rgba(109,93,240,0.15)",
  color: "#8B5CF6",
  padding: "4px 10px",
  borderRadius: 6,
  fontSize: 13,
  fontWeight: "bold",
};
const statusBadge = {
  padding: "6px 12px",
  borderRadius: 20,
  fontSize: 13,
  fontWeight: "bold",
};
const circleBtn = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "none",
  fontWeight: "bold",
};
const btnPrimary = {
  background: "linear-gradient(90deg,#6D5DF0,#8B5CF6)",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "14px 28px",
  fontWeight: "bold",
  fontSize: 15,
};