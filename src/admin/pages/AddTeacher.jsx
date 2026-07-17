import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { db } from "../../firebase/firebase";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const classOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "F1", "F2", "F3", "F4"];

// Xiisad (session) shaqo maalinlaha ah -- waqtiga bilowga iyo dhamaadka
const emptySession = () => ({
  startTime: "",
  endTime: "",
});

const emptyClassBlock = () => ({
  className: "",
  subject: "",
  // days hadda waa object: { Monday: [session1, session2, ...], ... }
  days: [],
  // daySessions: { [dayName]: [ {startTime, endTime}, ... ] }
  daySessions: {},
});

export default function AddTeacher() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [classBlocks, setClassBlocks] = useState([emptyClassBlock()]);
  const [saving, setSaving] = useState(false);

  const updateClassBlock = (index, field, value) => {
    const updated = [...classBlocks];
    updated[index][field] = value;
    setClassBlocks(updated);
  };

  const toggleDay = (index, day) => {
    const updated = [...classBlocks];
    const days = updated[index].days;

    if (days.includes(day)) {
      updated[index].days = days.filter((d) => d !== day);
      // Marka maalinta la ka saarayo, xiisadaheeda sidoo kale ha la tirtiro
      const remainingSessions = { ...updated[index].daySessions };
      delete remainingSessions[day];
      updated[index].daySessions = remainingSessions;
    } else {
      updated[index].days = [...days, day];
      // Maalin cusub oo la doortay -- ku bilow hal xiisad madhan
      updated[index].daySessions = {
        ...updated[index].daySessions,
        [day]: [emptySession()],
      };
    }

    setClassBlocks(updated);
  };

  // Ku dar xiisad labaad (ama saddexaad, iwm) maalintaas
  const addSessionToDay = (index, day) => {
    const updated = [...classBlocks];
    const existing = updated[index].daySessions[day] || [];
    updated[index].daySessions = {
      ...updated[index].daySessions,
      [day]: [...existing, emptySession()],
    };
    setClassBlocks(updated);
  };

  const removeSessionFromDay = (index, day, sessionIdx) => {
    const updated = [...classBlocks];
    const existing = updated[index].daySessions[day] || [];
    if (existing.length === 1) return; // ugu yaraan hal xiisad ha haysto
    updated[index].daySessions = {
      ...updated[index].daySessions,
      [day]: existing.filter((_, i) => i !== sessionIdx),
    };
    setClassBlocks(updated);
  };

  const updateSessionTime = (index, day, sessionIdx, field, value) => {
    const updated = [...classBlocks];
    const existing = [...(updated[index].daySessions[day] || [])];
    existing[sessionIdx] = { ...existing[sessionIdx], [field]: value };
    updated[index].daySessions = {
      ...updated[index].daySessions,
      [day]: existing,
    };
    setClassBlocks(updated);
  };

  const addClassBlock = () => {
    setClassBlocks([...classBlocks, emptyClassBlock()]);
  };

  const removeClassBlock = (index) => {
    if (classBlocks.length === 1) return;
    setClassBlocks(classBlocks.filter((_, i) => i !== index));
  };

  // Hubi in xiisadaha maalin kastaba aysan iskaga soo horjeedin (overlap)
  const validateSessions = () => {
    for (const block of classBlocks) {
      for (const day of block.days) {
        const sessions = block.daySessions[day] || [];

        for (const s of sessions) {
          if (!s.startTime || !s.endTime) {
            alert(
              `Fadlan buuxi waqtiga bilowga iyo dhamaadka ee ${day} (${block.className || "fasal"})`
            );
            return false;
          }
          if (s.startTime >= s.endTime) {
            alert(
              `${day}: waqtiga dhamaadka waa inuu ka dambeeyaa waqtiga bilowga`
            );
            return false;
          }
        }

        // Haddii laba ama in ka badan xiisadood maalintaas jiraan, hubi
        // inaysan isku dhicin (overlap) waqtigooda
        const sorted = [...sessions].sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        );
        for (let i = 0; i < sorted.length - 1; i++) {
          if (sorted[i].endTime > sorted[i + 1].startTime) {
            alert(
              `${day}: xiisadaha waa isku dhacayaan waqti ahaan, fadlan wax ka beddel`
            );
            return false;
          }
        }
      }
    }
    return true;
  };

  const saveTeacher = async (e) => {
    e.preventDefault();

    if (fullName === "" || username === "" || password === "") {
      alert("Fill Required Fields");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (!validateSessions()) {
      return;
    }

    try {
      setSaving(true);

      await setDoc(doc(db, "teachers", username), {
        fullName,
        username,
        password,
        classes: classBlocks,
        createdAt: serverTimestamp(),
      });

      alert("Teacher Saved");
      navigate("/admin/teachers");
    } catch (err) {
      console.log(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 900, margin: "auto", fontFamily: "sans-serif" }}>
      <h1>Macalin Cusub Abuur</h1>

      <form onSubmit={saveTeacher}>
        <div style={topGrid}>
          <div>
            <label style={label}>Magaca Macalinka</label>
            <input
              style={input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label style={label}>Username</label>
            <input
              style={input}
              placeholder="Tusaale: cabdi.macalin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label style={label}>Password</label>
          <input
            style={{ ...input, maxWidth: 420 }}
            type="password"
            placeholder="Ugu yaraan 6 xaraf"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <hr style={{ margin: "24px 0", border: "none", borderTop: "1px solid #eee" }} />

        <h3>Fasalada uu Xaadirin Doono</h3>

        {classBlocks.map((block, index) => (
          <div key={index} style={classCard}>
            <div style={classCardHeader}>
              <span style={classCardTitle}>Fasalka #{index + 1}</span>
              {classBlocks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeClassBlock(index)}
                  style={removeBtn}
                >
                  ✕ Ka saar
                </button>
              )}
            </div>

            <div style={twoColGrid}>
              <div>
                <label style={label}>Class</label>
                <select
                  style={input}
                  value={block.className}
                  onChange={(e) =>
                    updateClassBlock(index, "className", e.target.value)
                  }
                >
                  <option value="">-- Dooro --</option>
                  {classOptions.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={label}>Maadada</label>
                <input
                  style={input}
                  placeholder="Tusaale: Mathematics"
                  value={block.subject}
                  onChange={(e) =>
                    updateClassBlock(index, "subject", e.target.value)
                  }
                />
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={label}>Maalmaha Toddobaadka</label>
              <div style={dayRow}>
                {weekDays.map((day) => {
                  const active = block.days.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(index, day)}
                      style={{
                        ...dayPill,
                        background: active ? "#0d6efd" : "white",
                        color: active ? "white" : "#333",
                        borderColor: active ? "#0d6efd" : "#ccc",
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Waqtiga xiisadaha maalin kasta oo la doortay */}
            {block.days.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <label style={label}>Saacadaha Xiisadaha</label>

                {block.days.map((day) => {
                  const sessions = block.daySessions[day] || [];
                  return (
                    <div key={day} style={dayScheduleCard}>
                      <div style={dayScheduleHeader}>
                        <span style={dayScheduleTitle}>{day}</span>
                        <button
                          type="button"
                          onClick={() => addSessionToDay(index, day)}
                          style={addSessionBtn}
                        >
                          + Xiisad kale
                        </button>
                      </div>

                      {sessions.map((session, sIdx) => (
                        <div key={sIdx} style={sessionRow}>
                          <span style={sessionLabel}>
                            Xiisadda #{sIdx + 1}
                          </span>

                          <div>
                            <label style={miniLabel}>Waqtiga Bilowga</label>
                            <input
                              type="time"
                              style={timeInput}
                              value={session.startTime}
                              onChange={(e) =>
                                updateSessionTime(
                                  index,
                                  day,
                                  sIdx,
                                  "startTime",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div>
                            <label style={miniLabel}>Waqtiga Dhamaadka</label>
                            <input
                              type="time"
                              style={timeInput}
                              value={session.endTime}
                              onChange={(e) =>
                                updateSessionTime(
                                  index,
                                  day,
                                  sIdx,
                                  "endTime",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          {sessions.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeSessionFromDay(index, day, sIdx)
                              }
                              style={removeSessionBtn}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <button type="button" onClick={addClassBlock} style={addBlockBtn}>
          + Ku dar Fasal/Maado Kale
        </button>

        <button type="submit" disabled={saving} style={submitBtn}>
          {saving ? "Kaydinaya..." : "🚀 Abuur Macalin + Fasalada"}
        </button>
      </form>
    </div>
  );
}

const label = {
  display: "block",
  fontSize: 14,
  color: "#333",
  marginBottom: 6,
};
const input = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #ddd",
  boxSizing: "border-box",
};
const topGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
  marginBottom: 15,
};
const twoColGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
};
const classCard = {
  background: "#f7f8fa",
  border: "1px solid #eee",
  borderRadius: 12,
  padding: 20,
  marginBottom: 16,
};
const classCardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
};
const classCardTitle = {
  color: "#0d6efd",
  fontWeight: "bold",
};
const removeBtn = {
  background: "none",
  border: "none",
  color: "#e74c3c",
  cursor: "pointer",
  fontSize: 13,
};
const dayRow = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};
const dayPill = {
  padding: "8px 16px",
  borderRadius: 20,
  border: "1px solid #ccc",
  cursor: "pointer",
  fontSize: 13,
};
const addBlockBtn = {
  background: "white",
  border: "1px solid #0d6efd",
  color: "#0d6efd",
  padding: "12px 20px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
  marginBottom: 20,
  display: "block",
};
const submitBtn = {
  background: "#0d6efd",
  color: "#fff",
  border: "none",
  padding: "15px",
  width: "100%",
  borderRadius: 10,
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: 15,
};

const dayScheduleCard = {
  background: "white",
  border: "1px solid #e2e6ea",
  borderRadius: 8,
  padding: 14,
  marginTop: 10,
};
const dayScheduleHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
};
const dayScheduleTitle = {
  fontWeight: "bold",
  color: "#333",
  fontSize: 14,
};
const addSessionBtn = {
  background: "none",
  border: "1px solid #0d6efd",
  color: "#0d6efd",
  borderRadius: 6,
  padding: "4px 10px",
  fontSize: 12,
  cursor: "pointer",
};
const sessionRow = {
  display: "flex",
  gap: 14,
  alignItems: "flex-end",
  marginBottom: 10,
  flexWrap: "wrap",
};
const sessionLabel = {
  fontSize: 12,
  color: "#666",
  minWidth: 80,
  marginBottom: 8,
};
const miniLabel = {
  display: "block",
  fontSize: 11,
  color: "#888",
  marginBottom: 4,
};
const timeInput = {
  padding: "6px 8px",
  borderRadius: 6,
  border: "1px solid #ccc",
};
const removeSessionBtn = {
  background: "none",
  border: "none",
  color: "#e74c3c",
  cursor: "pointer",
  fontSize: 13,
  marginBottom: 8,
};