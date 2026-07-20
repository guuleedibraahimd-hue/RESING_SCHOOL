import { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  Clock,
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Users,
  Loader2,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

// Fixed class order: 1 -> 8 (primary), then F1 -> F4 (secondary/form)
const CLASS_ORDER = ["1", "2", "3", "4", "5", "6", "7", "8", "F1", "F2", "F3", "F4"];
function classRank(className) {
  const idx = CLASS_ORDER.indexOf(String(className || "").toUpperCase());
  return idx === -1 ? 999 : idx;
}

const DAYS = [
  { key: "Monday", label: "Isniin" },
  { key: "Tuesday", label: "Talaado" },
  { key: "Wednesday", label: "Arbaco" },
  { key: "Thursday", label: "Khamiis" },
  { key: "Friday", label: "Jimce" },
  { key: "Saturday", label: "Sabti" },
];

function emptySession() {
  return {
    id: `s_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    startTime: "08:00",
    endTime: "08:45",
    teacherId: "",
    subject: "",
  };
}

function ResponsiveStyles() {
  return (
    <style>{`
      .tt-layout { display: flex; min-height: 100vh; background: #0b0a1c; }
      .tt-content { flex: 1; min-width: 0; }
      .tt-class-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 18px; }
      .tt-day-tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
      .tt-session-row { display: grid; grid-template-columns: 110px 110px 1fr 1fr 40px; gap: 10px; align-items: center; }
      .tt-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }

      @media (max-width: 900px) {
        .tt-page-pad { padding: 16px !important; }
        .tt-header-row { gap: 10px !important; }
        .tt-header-title { font-size: 20px !important; }
        .tt-class-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
        .tt-toolbar { flex-direction: column; align-items: stretch !important; }
        .tt-session-row { grid-template-columns: 1fr 1fr; }
      }
      @media (max-width: 480px) {
        .tt-class-grid { grid-template-columns: 1fr; }
      }
    `}</style>
  );
}

export default function Timetable() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teachers, setTeachers] = useState({}); // id -> { fullName, photoUrl, subject }
  const [timetableDocs, setTimetableDocs] = useState({}); // `${className}__${day}` -> { sessions: [] }
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeDay, setActiveDay] = useState(DAYS[0].key);
  const [draftSessions, setDraftSessions] = useState([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const [teachersSnap, ttSnap] = await Promise.all([
        getDocs(collection(db, "teachers")),
        getDocs(collection(db, "timetable")),
      ]);

      const teacherMap = {};
      teachersSnap.docs.forEach((d) => {
        const data = d.data();
        teacherMap[d.id] = {
          fullName: data.fullName || data.username || d.id,
          photoUrl: data.photoUrl || data.photoURL || data.avatar || "",
          subject: data.subject || data.subjectName || "",
        };
      });
      setTeachers(teacherMap);

      const ttMap = {};
      ttSnap.docs.forEach((d) => {
        ttMap[d.id] = d.data();
      });
      setTimetableDocs(ttMap);
    } catch (err) {
      console.log(err);
      alert("Khalad ayaa dhacay marka xogta la soo qaadanayay: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const classes = useMemo(() => {
    return [...CLASS_ORDER].sort((a, b) => classRank(a) - classRank(b));
  }, []);

  // Whenever the selected class or active day changes, load the draft
  // sessions for that class/day from the loaded timetable docs.
  useEffect(() => {
    if (!selectedClass) return;
    const key = `${selectedClass}__${activeDay}`;
    const existing = timetableDocs[key];
    setDraftSessions(
      existing?.sessions?.length
        ? existing.sessions.map((s) => ({ ...s }))
        : [emptySession()]
    );
    setDirty(false);
  }, [selectedClass, activeDay, timetableDocs]);

  function openClass(cls) {
    setSelectedClass(cls);
    setActiveDay(DAYS[0].key);
  }

  function updateSession(index, field, value) {
    setDraftSessions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setDirty(true);
  }

  function addSession() {
    setDraftSessions((prev) => [...prev, emptySession()]);
    setDirty(true);
  }

  function removeSession(index) {
    setDraftSessions((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
  }

  async function saveDay() {
    if (!selectedClass) return;
    setSaving(true);
    const key = `${selectedClass}__${activeDay}`;

    // Skip rows with no teacher selected to avoid saving blank sessions.
    const cleanSessions = draftSessions.filter(
      (s) => s.teacherId && s.teacherId.trim() !== ""
    );

    try {
      if (cleanSessions.length === 0) {
        await deleteDoc(doc(db, "timetable", key));
      } else {
        await setDoc(doc(db, "timetable", key), {
          className: selectedClass,
          day: activeDay,
          sessions: cleanSessions,
          updatedAt: new Date(),
        });
      }
      setTimetableDocs((prev) => {
        const next = { ...prev };
        if (cleanSessions.length === 0) {
          delete next[key];
        } else {
          next[key] = { className: selectedClass, day: activeDay, sessions: cleanSessions };
        }
        return next;
      });
      setDraftSessions(cleanSessions.length ? cleanSessions : [emptySession()]);
      setDirty(false);
    } catch (err) {
      console.log(err);
      alert("Khalad ayaa dhacay marka la kaydinayay: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  // Count sessions scheduled per class (across all days) for the class cards.
  const sessionCountByClass = useMemo(() => {
    const counts = {};
    Object.values(timetableDocs).forEach((docData) => {
      const cls = docData.className;
      const n = (docData.sessions || []).length;
      counts[cls] = (counts[cls] || 0) + n;
    });
    return counts;
  }, [timetableDocs]);

  const daysScheduledByClass = useMemo(() => {
    const counts = {};
    Object.entries(timetableDocs).forEach(([key, docData]) => {
      if ((docData.sessions || []).length > 0) {
        counts[docData.className] = (counts[docData.className] || 0) + 1;
      }
    });
    return counts;
  }, [timetableDocs]);

  return (
    <div className="tt-layout">
      <ResponsiveStyles />
      <Sidebar />

      <div className="tt-content">
        <div style={{ padding: "20px 24px 0" }}>
          <Topbar />
        </div>

        <div className="tt-page-pad" style={{ padding: "26px 30px" }}>
          {/* Header */}
          <div
            className="tt-header-row"
            style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}
          >
            <div
              style={{
                width: 55,
                height: 55,
                borderRadius: 15,
                background: "linear-gradient(135deg,#6d5df0,#8b6cf5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CalendarDays color="#fff" size={26} />
            </div>
            <div>
              <h1 className="tt-header-title" style={{ margin: 0, fontSize: 26, color: "#fff" }}>
                Jadwalka (Timetable)
              </h1>
              <div style={{ color: "#8b87ad", fontSize: 14 }}>
                Samee jadwalka xiisadaha maalinlaha ah ee fasal kasta iyo macalinka xiisad walba
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ color: "#8b87ad", textAlign: "center", padding: 60 }}>
              Xogta ayaa la soo qaadayaa...
            </div>
          ) : !selectedClass ? (
            <div className="tt-class-grid">
              {classes.map((cls) => {
                const sessionCount = sessionCountByClass[cls] || 0;
                const dayCount = daysScheduledByClass[cls] || 0;
                return (
                  <button
                    key={cls}
                    onClick={() => openClass(cls)}
                    style={{
                      background: "linear-gradient(160deg,#151233,#181341)",
                      border: "1px solid rgba(139,108,245,0.25)",
                      borderRadius: 20,
                      padding: "20px 22px",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 13,
                          background: "linear-gradient(135deg,#22C55E,#16A34A)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {cls}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>
                          Fasalka: {cls}
                        </div>
                        <div style={{ fontSize: 12.5, color: "#8b87ad", marginTop: 2 }}>
                          {dayCount} maalmood oo la sameeyay
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          background: "rgba(139,108,245,0.1)",
                          border: "1px solid rgba(139,108,245,0.25)",
                          borderRadius: 20,
                          padding: "5px 12px",
                          color: "#c4b8f7",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        <Clock size={13} /> {sessionCount} Xiisadood
                      </span>
                    </div>

                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#8B5CF6",
                        marginTop: 2,
                      }}
                    >
                      Samee/Wax ka beddel jadwalka{" "}
                      <ChevronDown size={15} style={{ transform: "rotate(-90deg)" }} />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              {/* Toolbar */}
              <div
                className="tt-toolbar"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 18,
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <button
                  onClick={() => setSelectedClass(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "transparent",
                    border: "none",
                    color: "#8B5CF6",
                    fontWeight: 700,
                    fontSize: 13.5,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <ChevronUp size={16} style={{ transform: "rotate(-90deg)" }} /> Dhamaan Fasallada
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {dirty && (
                    <span style={{ color: "#F59E0B", fontSize: 12.5, fontWeight: 600 }}>
                      Wax lama kaydin
                    </span>
                  )}
                  <button
                    onClick={saveDay}
                    disabled={saving}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 18px",
                      borderRadius: 12,
                      border: "none",
                      background: saving
                        ? "rgba(139,108,245,0.35)"
                        : "linear-gradient(135deg,#6d5df0,#8b6cf5)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: saving ? "not-allowed" : "pointer",
                    }}
                  >
                    {saving ? <Loader2 size={15} /> : <Save size={15} />}
                    {saving ? "Kaydinaya..." : "Kaydi Maalinta"}
                  </button>
                </div>
              </div>

              {/* Class title */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    background: "linear-gradient(135deg,#22C55E,#16A34A)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 15,
                    flexShrink: 0,
                  }}
                >
                  {selectedClass}
                </div>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: 18 }}>
                  Fasalka: {selectedClass}
                </div>
              </div>

              {/* Day tabs */}
              <div className="tt-day-tabs" style={{ marginBottom: 20 }}>
                {DAYS.map((d) => {
                  const isActive = d.key === activeDay;
                  const hasSessions =
                    (timetableDocs[`${selectedClass}__${d.key}`]?.sessions || []).length > 0;
                  return (
                    <button
                      key={d.key}
                      onClick={() => setActiveDay(d.key)}
                      style={{
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px 18px",
                        borderRadius: 12,
                        border: isActive
                          ? "1px solid rgba(139,108,245,0.6)"
                          : "1px solid rgba(139,108,245,0.2)",
                        background: isActive
                          ? "linear-gradient(135deg,#6d5df0,#8b6cf5)"
                          : "rgba(255,255,255,0.02)",
                        color: isActive ? "#fff" : "#c4b8f7",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      {d.label}
                      {hasSessions && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: isActive ? "#fff" : "#22C55E",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Sessions editor */}
              <div
                style={{
                  background: "linear-gradient(160deg,#151233,#181341)",
                  border: "1px solid rgba(139,108,245,0.25)",
                  borderRadius: 20,
                  padding: "22px 26px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Clock size={16} color="#8B5CF6" /> Xiisadaha —{" "}
                    {DAYS.find((d) => d.key === activeDay)?.label}
                  </h3>
                  <button
                    onClick={addSession}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(34,197,94,0.15)",
                      border: "1px solid rgba(34,197,94,0.35)",
                      color: "#22C55E",
                      padding: "8px 14px",
                      borderRadius: 10,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={14} /> Ku dar Xiisad
                  </button>
                </div>

                <div
                  className="tt-session-row"
                  style={{
                    marginBottom: 6,
                    color: "#8b87ad",
                    fontSize: 11.5,
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  <div>Bilow</div>
                  <div>Dhamaad</div>
                  <div>Macalinka</div>
                  <div>Maadada</div>
                  <div></div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {draftSessions.map((session, index) => (
                    <div
                      key={session.id}
                      className="tt-session-row"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(139,108,245,0.18)",
                        borderRadius: 12,
                        padding: "10px 12px",
                      }}
                    >
                      <input
                        type="time"
                        value={session.startTime}
                        onChange={(e) => updateSession(index, "startTime", e.target.value)}
                        style={fieldStyle}
                      />
                      <input
                        type="time"
                        value={session.endTime}
                        onChange={(e) => updateSession(index, "endTime", e.target.value)}
                        style={fieldStyle}
                      />
                      <select
                        value={session.teacherId}
                        onChange={(e) => {
                          const tid = e.target.value;
                          updateSession(index, "teacherId", tid);
                          const info = teachers[tid];
                          if (info?.subject && !session.subject) {
                            updateSession(index, "subject", info.subject);
                          }
                        }}
                        style={{ ...fieldStyle, cursor: "pointer" }}
                      >
                        <option value="">-- Dooro Macalin --</option>
                        {Object.entries(teachers).map(([tid, info]) => (
                          <option key={tid} value={tid}>
                            {info.fullName}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Maadada"
                        value={session.subject}
                        onChange={(e) => updateSession(index, "subject", e.target.value)}
                        style={fieldStyle}
                      />
                      <button
                        onClick={() => removeSession(index)}
                        title="Ka saar"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          border: "1px solid rgba(239,68,68,0.35)",
                          background: "rgba(239,68,68,0.12)",
                          color: "#EF4444",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                {draftSessions.length === 0 && (
                  <div style={{ color: "#8b87ad", fontSize: 13, textAlign: "center", padding: 20 }}>
                    Weli xiisad lama darin maalintan.
                  </div>
                )}
              </div>

              {/* Read-only summary of the saved week for this class */}
              <WeekSummary
                selectedClass={selectedClass}
                timetableDocs={timetableDocs}
                teachers={teachers}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WeekSummary({ selectedClass, timetableDocs, teachers }) {
  const rows = DAYS.map((d) => {
    const key = `${selectedClass}__${d.key}`;
    const sessions = (timetableDocs[key]?.sessions || [])
      .slice()
      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
    return { day: d, sessions };
  });

  const anySessions = rows.some((r) => r.sessions.length > 0);
  if (!anySessions) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <h3
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <Users size={16} color="#8B5CF6" /> Jadwalka Toddobaadka — Fasalka {selectedClass}
      </h3>

      <div className="tt-table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
          <thead>
            <tr>
              <th style={thStyle}>Maalinta</th>
              <th style={thStyle}>Xiisadaha</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ day, sessions }) => (
              <tr key={day.key} style={{ borderTop: "1px solid rgba(139,108,245,0.12)" }}>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{day.label}</td>
                <td style={tdStyle}>
                  {sessions.length === 0 ? (
                    <span style={{ color: "#8b87ad" }}>Ma jiraan xiisad</span>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {sessions.map((s) => {
                        const teacherName = teachers[s.teacherId]?.fullName || s.teacherId;
                        return (
                          <span
                            key={s.id}
                            style={{
                              background: "rgba(139,108,245,0.1)",
                              border: "1px solid rgba(139,108,245,0.25)",
                              borderRadius: 20,
                              padding: "5px 12px",
                              color: "#c4b8f7",
                              fontWeight: 600,
                              fontSize: 12,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {s.startTime}–{s.endTime} · {teacherName}
                            {s.subject ? ` (${s.subject})` : ""}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const fieldStyle = {
  width: "100%",
  padding: "8px 10px",
  boxSizing: "border-box",
  border: "1px solid rgba(139,108,245,0.3)",
  borderRadius: 8,
  fontSize: 13,
  color: "#e5e3f7",
  outline: "none",
  background: "rgba(255,255,255,0.03)",
};

const thStyle = {
  textAlign: "left",
  padding: "10px 14px",
  color: "#8b87ad",
  fontSize: 12,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "10px 14px",
  color: "#e5e3f7",
  fontSize: 13,
};