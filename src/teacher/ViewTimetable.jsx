// src/teacher/ViewTimetable.jsx
// Macallinku wuxuu halkan ka arkaa dhammaan xiisadihiisa (shifts) ee
// maamulku u sameeyay, isaga oo ka soo akhrinaya collection-ka
// "timetable" (F4__Saturday, F3__Monday, iwm), oo mid kasta leh:
// { className, day, sessions: [{ id, sessionNumber, startTime,
// endTime, subject, teacherId }] }.
//
// Halkan waxaan si toos ah uga soo akhrinaynaa DHAMMAAN documents-ka
// collection "timetable", kadibna gudaha JS-ka ku shaandheynaa
// sessions-ka teacherId-giisu la mid yahay macallinka soo galay.
// Sidaas ayaan uga fogaanaynaa Firestore composite index error-ka
// (failed-precondition), maxaa yeelay ma isticmaaleyno where() +
// orderBy() isku darsan.
//
// MUHIIM: maalmaha jadwalku waa isla shantii maalmood ee admin-ku
// isticmaalo Timetable.jsx (Saturday -> Sunday -> Monday -> Tuesday
// -> Wednesday), ee ma aha 7-da maalmood ee usbuuca oo dhan.

import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  CalendarDays,
  Clock,
  BookOpen,
  Landmark,
  Star,
  BookMarked,
  BarChart3,
  Calculator,
  Languages,
  GraduationCap,
} from "lucide-react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileBottomNav from "./MobileBottomNav";

// Isla shantii maalmood ee admin-ku (Timetable.jsx) isticmaalo, isla
// taxanahaas oo kale — si maalmuhu ay isugu jaan-goyaan labada dhinac.
const dayOrder = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];

const dayColors = {
  Saturday: "#EF4444",
  Sunday: "#EC4899",
  Monday: "#6D5DF0",
  Tuesday: "#8B5CF6",
  Wednesday: "#17A2B8",
};

// ---- Subject -> icon matching (auto, keyword-based) ----
// Waxaan u eegnaa magaca maadada (subject) oo ku qoran Firestore,
// kadibna waxaan u doorannaa icon ku habboon inta suurtagal ah.
// Haddii aan la helin keyword la garanayo, waxaa la isticmaalaa
// BookOpen oo ah default-ka guud.
const SUBJECT_ICON_RULES = [
  { keywords: ["islam", "diin", "aqoon", "akhlaaq", "quran"], icon: Landmark },
  { keywords: ["carab", "arab"], icon: Languages },
  { keywords: ["somali", "soomaali", "suugaan"], icon: Star },
  { keywords: ["bulsho", "taariikh", "history", "social"], icon: BookMarked },
  { keywords: ["saynis", "science"], icon: BarChart3 },
  { keywords: ["xisaab", "math"], icon: Calculator },
  { keywords: ["english", "ingiriis", "grammar"], icon: GraduationCap },
];

function getSubjectIcon(subject) {
  const s = String(subject || "").toLowerCase();
  for (const rule of SUBJECT_ICON_RULES) {
    if (rule.keywords.some((k) => s.includes(k))) return rule.icon;
  }
  return BookOpen;
}

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

      .vt-shift-card {
        display: grid;
        grid-template-columns: 40px 44px 1fr auto auto;
        align-items: center;
        gap: 14px;
        background: #0d1424;
        border: 1px solid rgba(255,255,255,.06);
        border-left: 4px solid var(--accent, #8B5CF6);
        border-radius: 14px;
        padding: 12px 16px;
      }
      .vt-shift-number {
        width: 30px;
        height: 30px;
        border-radius: 10px;
        background: rgba(255,255,255,.06);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 13px;
        color: #E2E8F0;
      }
      .vt-shift-icon {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--accent, #8B5CF6) 18%, transparent);
        flex-shrink: 0;
      }
      .vt-shift-time {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--accent, #8B5CF6);
        font-weight: 700;
        font-size: 13px;
        white-space: nowrap;
      }
      .vt-shift-session {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--accent, #8B5CF6);
        font-weight: 700;
        font-size: 12.5px;
        white-space: nowrap;
      }

      @media (max-width: 900px) {
        .vt-body { padding: 0 14px 90px; }
        .vt-panel { padding: 16px !important; border-radius: 16px !important; }
        .vt-day-tab { padding: 9px 14px; font-size: 12.5px; }
        .vt-shift-card {
          grid-template-columns: 34px 38px 1fr;
          grid-template-areas:
            "num icon subj"
            "num icon time"
            "num icon session";
          row-gap: 4px;
        }
        .vt-shift-time, .vt-shift-session { justify-content: flex-start; }
      }
    `}</style>
  );
}

export default function ViewTimetable() {
  const [teacherName, setTeacherName] = useState("Teacher");
  // classes halkan waa liis "session cards" oo ka soo baxay collection-ka
  // timetable, hal walba oo leh { className, day, subject, startTime, endTime }
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(dayOrder[0]);

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

      // Ka soo akhri DHAMMAAN documents-ka collection "timetable".
      // Ma isticmaaleyno where()/orderBy() halkan si aan uga fogaanno
      // Firestore composite-index error-ka; shaandheynta waxaa lagu
      // sameeyaa gudaha JS-ka kadib.
      const snap = await getDocs(collection(db, "timetable"));

      const sessionCards = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const day = data.day;
        const className = data.className;
        const sessions = Array.isArray(data.sessions) ? data.sessions : [];

        sessions.forEach((s) => {
          // Kaliya sessions-ka teacherId-giisu la mid yahay macallinka
          // soo galay ayaa loo soo bandhigayaa — macallimiinta kale
          // xiisadahaas ma arki karaan.
          if (s.teacherId !== teacherId) return;

          sessionCards.push({
            className,
            day,
            subject: s.subject || "—",
            startTime: s.startTime || "--:--",
            endTime: s.endTime || "--:--",
            sessionNumber: s.sessionNumber,
            id: s.id || `${docSnap.id}_${s.sessionNumber}`,
          });
        });
      });

      // Kala sooc si ay maalinba maalinta xigta sessionNumber-kiisa u socoto,
      // iyadoo la raacayo taxanaha maalmaha ee admin-ku isticmaalo.
      sessionCards.sort((a, b) => {
        const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return (a.sessionNumber || 0) - (b.sessionNumber || 0);
      });

      setClasses(sessionCards);
    } catch (err) {
      console.log(err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  // Sessions-ka maalinta la doortay, kala sortan sessionNumber
  const classesForDay = classes
    .filter((c) => c.day === activeDay)
    .sort((a, b) => (a.sessionNumber || 0) - (b.sessionNumber || 0));

  // Dhammaan maalmaha uu macallinku xiisad ku leeyahay, si loo tuso
  // bar (dot) tabka maalinta haddii xiisad ku jiraan
  const daysWithClasses = new Set(classes.map((c) => c.day));

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

          {/* Classes/shifts for the selected day — card list, sida sawirka */}
          <div className="vt-panel" style={panelWrap}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: `${dayColors[activeDay] || "#8B5CF6"}26`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CalendarDays size={17} color={dayColors[activeDay] || "#8B5CF6"} />
                </div>
                <h3 style={{ margin: 0, color: "#fff", fontSize: 16 }}>{activeDay}</h3>
              </div>
            </div>

            {loading ? (
              <p style={{ color: "#94A3B8", padding: 20 }}>Loading...</p>
            ) : classesForDay.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center" }}>
                <p style={{ color: "#94A3B8", margin: 0 }}>
                  Maalintan ({activeDay}) xiisad kuuma qorna.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {classesForDay.map((cls, idx) => {
                  const accent = dayColors[activeDay] || "#8B5CF6";
                  const Icon = getSubjectIcon(cls.subject);
                  return (
                    <div
                      key={cls.id || idx}
                      className="vt-shift-card"
                      style={{ "--accent": accent }}
                    >
                      <div className="vt-shift-number" style={{ gridArea: "num" }}>
                        {String(cls.sessionNumber ?? idx + 1).padStart(2, "0")}
                      </div>

                      <div className="vt-shift-icon" style={{ gridArea: "icon" }}>
                        <Icon size={20} color={accent} />
                      </div>

                      <div style={{ gridArea: "subj", minWidth: 0 }}>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
                          {cls.subject}
                        </div>
                        <div style={{ color: "#94A3B8", fontSize: 12.5 }}>
                          Fasalka: {cls.className || "—"}
                        </div>
                      </div>

                      <div className="vt-shift-time" style={{ gridArea: "time" }}>
                        <Clock size={14} />
                        {cls.startTime} - {cls.endTime}
                      </div>

                      <div className="vt-shift-session" style={{ gridArea: "session" }}>
                        Xiisad #{cls.sessionNumber ?? idx + 1}
                      </div>
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
                  const dayClasses = classes
                    .filter((c) => c.day === day)
                    .sort((a, b) => (a.sessionNumber || 0) - (b.sessionNumber || 0));
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
                        {dayClasses.map((cls, idx) => (
                          <div
                            key={cls.id || idx}
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
                              #{cls.sessionNumber ?? idx + 1} · {cls.subject}{" "}
                              <span style={{ color: "#64748B" }}>
                                ({cls.className || "—"})
                              </span>
                            </span>
                            <span style={{ color: "#94A3B8" }}>
                              {cls.startTime}-{cls.endTime}
                            </span>
                          </div>
                        ))}
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