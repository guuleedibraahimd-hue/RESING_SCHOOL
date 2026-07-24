// src/teacher/ViewTimetable.jsx
// Macallinku wuxuu halkan ka arkaa dhammaan xiisadihiisa (shifts) ee
// maamulku u sameeyay, isku darsan Class + Subject + Maalin + Waqti.
// Xogtu waxay ka imaanaysaa teacher document-ka: data.classes array,
// halkaas oo mid kasta leh { className, subject, days: [...],
// shifts: { [day]: [{ startTime, endTime }] } }.

import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { CalendarDays, Clock, BookOpen } from "lucide-react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileBottomNav from "./MobileBottomNav";

const dayOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const dayColors = {
  Monday: "#6D5DF0",
  Tuesday: "#8B5CF6",
  Wednesday: "#17A2B8",
  Thursday: "#22C55E",
  Friday: "#F59E0B",
  Saturday: "#EF4444",
  Sunday: "#EC4899",
};

function ViewTimetableStyles() {
  return (
    <style>{`
      .vt-layout { display: flex; min-height: 100vh; background: #05070D; }
      .vt-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }
      .vt-body { padding: 0 20px 30px; }

      .vt-day-tabs {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding-bottom: 4px;
        margin-bottom: 20px;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }
      .vt-day-tabs::-webkit-scrollbar { display: none; }
      .vt-day-tab {
        flex-shrink: 0;
        border: 1px solid rgba(255,255,255,.1);
        background: #111827;
        color: #94A3B8;
        padding: 10px 18px;
        border-radius: 999px;
        font-weight: 700;
        font-size: 13.5px;
        cursor: pointer;
        transition: .2s;
        white-space: nowrap;
      }
      .vt-day-tab.active {
        background: linear-gradient(90deg,#6D5DF0,#8B5CF6);
        color: #fff;
        border-color: transparent;
      }

      .vt-classes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 16px;
      }

      .vt-class-card {
        background: #0B1120;
        border: 1px solid rgba(255,255,255,.06);
        border-radius: 18px;
        padding: 20px;
      }

      .vt-shift-row {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #111827;
        border: 1px solid rgba(255,255,255,.06);
        border-radius: 12px;
        padding: 10px 14px;
        margin-top: 10px;
      }

      @media (max-width: 900px) {
        .vt-body { padding: 0 14px 90px; }
        .vt-panel { padding: 16px !important; border-radius: 16px !important; }
        .vt-classes-grid { grid-template-columns: 1fr; }
        .vt-day-tab { padding: 9px 14px; font-size: 12.5px; }
      }
    `}</style>
  );
}

export default function ViewTimetable() {
  const [teacherName, setTeacherName] = useState("Teacher");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(() => {
    const today = dayOrder[(new Date().getDay() + 6) % 7]; // Monday-first
    return today;
  });

  const teacherId = localStorage.getItem("teacherId") || "";

  useEffect(() => {
    loadTimetable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const storedName = localStorage.getItem("teacherName");
      if (storedName) setTeacherName(storedName);

      if (!teacherId) {
        setClasses([]);
        return;
      }

      const teacherSnap = await getDoc(doc(db, "teachers", teacherId));
      if (teacherSnap.exists()) {
        const data = teacherSnap.data();
        if (data.fullName) setTeacherName(data.fullName);
        const teacherClasses = Array.isArray(data.classes) ? data.classes : [];
        setClasses(teacherClasses);
      } else {
        setClasses([]);
      }
    } catch (err) {
      console.log(err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  // Dooro classes-ka la dhigayo maalinta la doortay
  const classesForDay = classes.filter((c) => {
    const days = Array.isArray(c.days) ? c.days : [];
    return days.includes(activeDay);
  });

  // Ka soo saar shifts-ka maalinta la doortay ee class-kan gaarka ah
  const getShiftsForDay = (cls) => {
    if (!cls.shifts) return [];
    const dayShifts = cls.shifts[activeDay];
    if (Array.isArray(dayShifts)) return dayShifts;
    return [];
  };

  // Dhammaan maalmaha uu macallinku xiisad ku leeyahay, si loo tuso
  // bar (dot) tabka maalinta haddii xiisad ku jiraan
  const daysWithClasses = new Set();
  classes.forEach((c) => {
    if (Array.isArray(c.days)) {
      c.days.forEach((d) => daysWithClasses.add(d));
    }
  });

  return (
    <div className="vt-layout">
      <ViewTimetableStyles />
      <Sidebar teacherName={teacherName} />

      <div className="vt-content">
        <Topbar teacherName={teacherName} />

        <div className="vt-body">
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 18px" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(139,92,246,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CalendarDays size={20} color="#8B5CF6" />
            </div>
            <h2 style={{ margin: 0, color: "#fff", fontSize: 21 }}>Jadwalkayga (Timetable)</h2>
          </div>

          {/* Day tabs */}
          <div className="vt-day-tabs">
            {dayOrder.map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`vt-day-tab${activeDay === day ? " active" : ""}`}
                style={{ position: "relative" }}
              >
                {day}
                {daysWithClasses.has(day) && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: activeDay === day ? "#fff" : dayColors[day] || "#8B5CF6",
                      marginLeft: 6,
                      verticalAlign: "middle",
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Classes/shifts for the selected day */}
          <div className="vt-panel" style={panelWrap}>
            {loading ? (
              <p style={{ color: "#94A3B8", padding: 20 }}>Loading...</p>
            ) : classesForDay.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center" }}>
                <p style={{ color: "#94A3B8", margin: 0 }}>
                  Maalintan ({activeDay}) xiisad kuuma qorna.
                </p>
              </div>
            ) : (
              <div className="vt-classes-grid">
                {classesForDay.map((cls, idx) => {
                  const shifts = getShiftsForDay(cls);
                  const accent = dayColors[activeDay] || "#8B5CF6";
                  return (
                    <div key={idx} className="vt-class-card">
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            background: `${accent}26`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <BookOpen size={17} color={accent} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
                            {cls.subject || "—"}
                          </div>
                          <div style={{ color: "#94A3B8", fontSize: 12.5 }}>
                            Fasalka: {cls.className || "—"}
                          </div>
                        </div>
                      </div>

                      {shifts.length === 0 ? (
                        <div style={{ color: "#64748B", fontSize: 13, marginTop: 12 }}>
                          Waqti lama qeexin.
                        </div>
                      ) : (
                        shifts.map((s, si) => (
                          <div key={si} className="vt-shift-row">
                            <Clock size={16} color={accent} style={{ flexShrink: 0 }} />
                            <span style={{ color: "#fff", fontWeight: 600, fontSize: 13.5 }}>
                              {s.startTime || "--:--"} – {s.endTime || "--:--"}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Full-week summary */}
          <div className="vt-panel" style={{ ...panelWrap, marginTop: 20 }}>
            <h3 style={{ margin: "0 0 16px", color: "#fff", fontSize: 16 }}>
              Dulmar Toddobaadka Oo Dhan
            </h3>

            {classes.length === 0 ? (
              <p style={{ color: "#94A3B8" }}>Weli xiisado lagama dejin.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {dayOrder.map((day) => {
                  const dayClasses = classes.filter(
                    (c) => Array.isArray(c.days) && c.days.includes(day)
                  );
                  if (dayClasses.length === 0) return null;
                  const accent = dayColors[day] || "#8B5CF6";

                  return (
                    <div
                      key={day}
                      style={{
                        border: "1px solid rgba(255,255,255,.06)",
                        borderRadius: 14,
                        padding: "14px 16px",
                        background: "#111827",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 10,
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: accent,
                          }}
                        />
                        <strong style={{ color: "#fff", fontSize: 14 }}>{day}</strong>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {dayClasses.map((cls, idx) => {
                          const shifts =
                            cls.shifts && Array.isArray(cls.shifts[day])
                              ? cls.shifts[day]
                              : [];
                          return (
                            <div
                              key={idx}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: 6,
                                fontSize: 13,
                              }}
                            >
                              <span style={{ color: "#E2E8F0" }}>
                                {cls.subject || "—"}{" "}
                                <span style={{ color: "#64748B" }}>
                                  ({cls.className || "—"})
                                </span>
                              </span>
                              <span style={{ color: "#94A3B8" }}>
                                {shifts.length === 0
                                  ? "—"
                                  : shifts
                                      .map((s) => `${s.startTime || "--:--"}-${s.endTime || "--:--"}`)
                                      .join(", ")}
                              </span>
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

      <MobileBottomNav />
    </div>
  );
}

const panelWrap = {
  background: "#0B1120",
  border: "1px solid rgba(255,255,255,.06)",
  borderRadius: 20,
  padding: 20,
};