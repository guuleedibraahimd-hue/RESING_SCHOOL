import { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import {
  CalendarCheck,
  Users,
  School,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  Check,
  X,
  Loader2,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [teachers, setTeachers] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [expandedDate, setExpandedDate] = useState({});
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const teachersSnap = await getDocs(collection(db, "teachers"));
      const teacherMap = {};
      teachersSnap.docs.forEach((d) => {
        const data = d.data();
        teacherMap[d.id] = data.fullName || data.username || d.id;
      });
      setTeachers(teacherMap);

      const attSnap = await getDocs(collection(db, "attendance"));
      const list = attSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRecords(list);
    } catch (err) {
      console.log(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Group: teacherId -> className -> { dates: Set, records: [] }
  const grouped = useMemo(() => {
    const map = {};

    records.forEach((r) => {
      const teacherId = r.teacherId || "Unknown";
      const className = r.className || "-";

      if (!map[teacherId]) map[teacherId] = {};
      if (!map[teacherId][className]) {
        map[teacherId][className] = { dates: new Set(), records: [] };
      }

      if (r.date) map[teacherId][className].dates.add(r.date);
      map[teacherId][className].records.push(r);
    });

    return map;
  }, [records]);

  const teacherIds = useMemo(() => {
    return Object.keys(grouped)
      .filter((tid) => {
        if (!search.trim()) return true;
        const name = teachers[tid] || tid;
        return (
          name.toLowerCase().includes(search.toLowerCase()) ||
          tid.toLowerCase().includes(search.toLowerCase())
        );
      })
      .sort();
  }, [grouped, search, teachers]);

  const toggleExpand = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDate = (key) => {
    setExpandedDate((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateStatus = async (record, newStatus) => {
    if (record.status === newStatus || savingId === record.id) return;

    const prevStatus = record.status;
    setSavingId(record.id);
    setRecords((prev) =>
      prev.map((r) => (r.id === record.id ? { ...r, status: newStatus } : r))
    );

    try {
      await updateDoc(doc(db, "attendance", record.id), {
        status: newStatus,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.log(err);
      alert("Khalad ayaa dhacay marka la kaydinayay: " + err.message);
      setRecords((prev) =>
        prev.map((r) => (r.id === record.id ? { ...r, status: prevStatus } : r))
      );
    } finally {
      setSavingId(null);
    }
  };

  const totalTeachers = Object.keys(grouped).length;
  const totalClasses = new Set(
    records.map((r) => r.className).filter(Boolean)
  ).size;
  const totalSessions = records.length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0b0a1c" }}>
      <Sidebar />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ padding: "20px 24px 0" }}>
          <Topbar />
        </div>

        <div style={{ padding: "26px 30px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div
              style={{
                width: 55,
                height: 55,
                borderRadius: 15,
                background: "linear-gradient(135deg,#6d5df0,#8b6cf5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CalendarCheck color="#fff" size={26} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, color: "#fff" }}>Attendance</h1>
              <div style={{ color: "#8b87ad", fontSize: 14 }}>
                Xaadirinta Macallimiinta oo dhan iyo Fasalladooda
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
              marginBottom: 30,
            }}
          >
            <SummaryCard
              icon={Users}
              label="Macallimiinta Xaadiriyay"
              value={totalTeachers}
              color="#6d5df0"
            />
            <SummaryCard
              icon={School}
              label="Fasallada la Xaadiriyay"
              value={totalClasses}
              color="#22C55E"
            />
            <SummaryCard
              icon={CalendarCheck}
              label="Wadarta Xiisaduhu (Sessions)"
              value={totalSessions}
              color="#F59E0B"
            />
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 24, maxWidth: 420 }}>
            <Search
              size={17}
              color="#8b87ad"
              style={{ position: "absolute", left: 14, top: 13 }}
            />
            <input
              style={{ ...inputStyle, paddingLeft: 40 }}
              placeholder="Raadi macalin magaciisa ama username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ color: "#8b87ad", textAlign: "center", padding: 60 }}>
              Soo raraya xogta...
            </div>
          ) : teacherIds.length === 0 ? (
            <div style={{ color: "#8b87ad", textAlign: "center", padding: 60 }}>
              Ma jiraan xaadirin la helay.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {teacherIds.map((teacherId) => {
                const classesMap = grouped[teacherId];
                const classNames = Object.keys(classesMap).sort();
                const teacherName = teachers[teacherId] || teacherId;
                const totalDaysForTeacher = new Set(
                  classNames.flatMap((c) => Array.from(classesMap[c].dates))
                ).size;

                return (
                  <div
                    key={teacherId}
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
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg,#6D5DF0,#8B5CF6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 16,
                            flexShrink: 0,
                          }}
                        >
                          {teacherName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "#fff", fontSize: 17 }}>
                            {teacherName}
                          </div>
                          <div style={{ color: "#8b87ad", fontSize: 13 }}>
                            username: {teacherId}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <Pill icon={School} text={`${classNames.length} Fasal`} />
                        <Pill
                          icon={CalendarCheck}
                          text={`${totalDaysForTeacher} Maalmood`}
                        />
                      </div>
                    </div>

                    {/* Classes for this teacher */}
                    <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                      {classNames.map((className) => {
                        const info = classesMap[className];
                        const sortedDates = Array.from(info.dates).sort();
                        const key = `${teacherId}__${className}`;
                        const isOpen = !!expanded[key];

                        return (
                          <div
                            key={key}
                            style={{
                              background: "rgba(255,255,255,0.02)",
                              border: "1px solid rgba(139,108,245,0.18)",
                              borderRadius: 14,
                              padding: "14px 18px",
                            }}
                          >
                            <div
                              onClick={() => toggleExpand(key)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                cursor: "pointer",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <School size={16} color="#8b6cf5" />
                                <span style={{ color: "#fff", fontWeight: 600, fontSize: 14.5 }}>
                                  Fasalka: {className}
                                </span>
                                <span
                                  style={{
                                    background: "rgba(109,93,240,0.18)",
                                    color: "#8B5CF6",
                                    padding: "3px 10px",
                                    borderRadius: 20,
                                    fontSize: 12,
                                    fontWeight: 700,
                                  }}
                                >
                                  {sortedDates.length} maalmood
                                </span>
                              </div>
                              {isOpen ? (
                                <ChevronUp size={18} color="#8b87ad" />
                              ) : (
                                <ChevronDown size={18} color="#8b87ad" />
                              )}
                            </div>

                            {isOpen && (
                              <div
                                style={{
                                  marginTop: 14,
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 10,
                                }}
                              >
                                {sortedDates.map((date) => {
                                  const sessionsOnDate = info.records
                                    .filter((r) => r.date === date)
                                    .sort((a, b) => {
                                      if (a.sessionNumber !== b.sessionNumber) {
                                        return (a.sessionNumber || 0) - (b.sessionNumber || 0);
                                      }
                                      return (a.studentName || "").localeCompare(
                                        b.studentName || ""
                                      );
                                    });
                                  const sessionNums = Array.from(
                                    new Set(sessionsOnDate.map((r) => r.sessionNumber))
                                  ).sort((a, b) => a - b);
                                  const dateKey = `${key}__${date}`;
                                  const isDateOpen = !!expandedDate[dateKey];

                                  const presentCount = sessionsOnDate.filter(
                                    (r) => r.status === "Present"
                                  ).length;
                                  const absentCount = sessionsOnDate.filter(
                                    (r) => r.status === "Absent"
                                  ).length;

                                  return (
                                    <div
                                      key={date}
                                      style={{
                                        background: "rgba(139,108,245,0.06)",
                                        border: "1px solid rgba(139,108,245,0.2)",
                                        borderRadius: 12,
                                        overflow: "hidden",
                                      }}
                                    >
                                      <div
                                        onClick={() => toggleDate(dateKey)}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          padding: "10px 14px",
                                          cursor: "pointer",
                                          flexWrap: "wrap",
                                          gap: 8,
                                        }}
                                      >
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                          <Clock size={13} color="#8b87ad" />
                                          <span style={{ color: "#e5e3f7", fontSize: 13.5, fontWeight: 600 }}>
                                            {date}
                                          </span>
                                          <span style={{ color: "#8b87ad", fontSize: 12 }}>
                                            ({sessionNums.length} xiisadood · {sessionsOnDate.length} arday)
                                          </span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                          <span
                                            style={{
                                              color: "#22C55E",
                                              fontSize: 12,
                                              fontWeight: 700,
                                              background: "rgba(34,197,94,0.12)",
                                              padding: "3px 9px",
                                              borderRadius: 20,
                                            }}
                                          >
                                            {presentCount} Present
                                          </span>
                                          <span
                                            style={{
                                              color: "#EF4444",
                                              fontSize: 12,
                                              fontWeight: 700,
                                              background: "rgba(239,68,68,0.12)",
                                              padding: "3px 9px",
                                              borderRadius: 20,
                                            }}
                                          >
                                            {absentCount} Absent
                                          </span>
                                          {isDateOpen ? (
                                            <ChevronUp size={16} color="#8b87ad" />
                                          ) : (
                                            <ChevronDown size={16} color="#8b87ad" />
                                          )}
                                        </div>
                                      </div>

                                      {isDateOpen && (
                                        <div style={{ padding: "0 14px 14px" }}>
                                          <div style={{ overflowX: "auto" }}>
                                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                              <thead>
                                                <tr>
                                                  <MiniTh>Ardayga</MiniTh>
                                                  <MiniTh>ID</MiniTh>
                                                  <MiniTh>Xiisad</MiniTh>
                                                  <MiniTh>Waqti</MiniTh>
                                                  <MiniTh>Status</MiniTh>
                                                  <MiniTh>Wax ka beddel</MiniTh>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {sessionsOnDate.map((r) => (
                                                  <tr
                                                    key={r.id}
                                                    style={{
                                                      borderTop: "1px solid rgba(139,108,245,0.12)",
                                                    }}
                                                  >
                                                    <MiniTd>
                                                      <div
                                                        style={{
                                                          display: "flex",
                                                          alignItems: "center",
                                                          gap: 8,
                                                        }}
                                                      >
                                                        <div
                                                          style={{
                                                            width: 26,
                                                            height: 26,
                                                            borderRadius: "50%",
                                                            background:
                                                              "linear-gradient(135deg,#6D5DF0,#8B5CF6)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            color: "#fff",
                                                            fontWeight: 700,
                                                            fontSize: 11,
                                                            flexShrink: 0,
                                                          }}
                                                        >
                                                          {(r.studentName || "?").charAt(0).toUpperCase()}
                                                        </div>
                                                        {r.studentName || "-"}
                                                      </div>
                                                    </MiniTd>
                                                    <MiniTd>{r.studentId || "-"}</MiniTd>
                                                    <MiniTd>#{r.sessionNumber ?? "-"}</MiniTd>
                                                    <MiniTd>{r.sessionTime || "-"}</MiniTd>
                                                    <MiniTd>
                                                      <span
                                                        style={{
                                                          padding: "4px 10px",
                                                          borderRadius: 20,
                                                          fontSize: 12,
                                                          fontWeight: 700,
                                                          background:
                                                            r.status === "Present"
                                                              ? "rgba(34,197,94,0.15)"
                                                              : "rgba(239,68,68,0.15)",
                                                          color:
                                                            r.status === "Present"
                                                              ? "#22C55E"
                                                              : "#EF4444",
                                                        }}
                                                      >
                                                        ● {r.status || "Absent"}
                                                      </span>
                                                    </MiniTd>
                                                    <MiniTd>
                                                      <div style={{ display: "flex", gap: 6 }}>
                                                        <button
                                                          onClick={() => updateStatus(r, "Present")}
                                                          disabled={savingId === r.id}
                                                          title="Present"
                                                          style={{
                                                            ...editBtn,
                                                            background:
                                                              r.status === "Present" ? "#22C55E" : "#1F2937",
                                                            color:
                                                              r.status === "Present" ? "#fff" : "#94A3B8",
                                                            opacity: savingId === r.id ? 0.6 : 1,
                                                            cursor:
                                                              savingId === r.id ? "not-allowed" : "pointer",
                                                          }}
                                                        >
                                                          {savingId === r.id ? (
                                                            <Loader2 size={13} />
                                                          ) : (
                                                            <Check size={13} />
                                                          )}
                                                        </button>
                                                        <button
                                                          onClick={() => updateStatus(r, "Absent")}
                                                          disabled={savingId === r.id}
                                                          title="Absent"
                                                          style={{
                                                            ...editBtn,
                                                            background:
                                                              r.status === "Absent" ? "#EF4444" : "#1F2937",
                                                            color:
                                                              r.status === "Absent" ? "#fff" : "#94A3B8",
                                                            opacity: savingId === r.id ? 0.6 : 1,
                                                            cursor:
                                                              savingId === r.id ? "not-allowed" : "pointer",
                                                          }}
                                                        >
                                                          {savingId === r.id ? (
                                                            <Loader2 size={13} />
                                                          ) : (
                                                            <X size={13} />
                                                          )}
                                                        </button>
                                                      </div>
                                                    </MiniTd>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div
      style={{
        background: "#0B1120",
        border: "1px solid rgba(255,255,255,.06)",
        borderRadius: 20,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: `${color}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>{value}</div>
        <div style={{ fontSize: 13, color: "#8b87ad" }}>{label}</div>
      </div>
    </div>
  );
}

function Pill({ icon: Icon, text }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(139,108,245,0.1)",
        border: "1px solid rgba(139,108,245,0.25)",
        borderRadius: 20,
        padding: "6px 14px",
        color: "#c4b8f7",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <Icon size={14} />
      {text}
    </div>
  );
}

function MiniTh({ children }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "8px 10px",
        color: "#8b87ad",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function MiniTd({ children }) {
  return (
    <td
      style={{
        padding: "8px 10px",
        color: "#e5e3f7",
        fontSize: 13,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </td>
  );
}

const editBtn = {
  width: 26,
  height: 26,
  borderRadius: "50%",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  boxSizing: "border-box",
  border: "1.5px solid rgba(139,108,245,0.35)",
  borderRadius: 12,
  fontSize: 14,
  color: "#e5e3f7",
  outline: "none",
  background: "rgba(255,255,255,0.02)",
};