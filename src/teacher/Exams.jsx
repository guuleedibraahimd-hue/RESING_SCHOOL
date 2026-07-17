import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
} from "firebase/firestore";

const subjects = [
  "Math",
  "English",
  "Science",
  "Arabic",
  "Somali",
  "Islamic Studies",
  "Social Studies",
];

export default function Exams() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [subject, setSubject] = useState("");
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [maxMarks, setMaxMarks] = useState(100);

  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const teacherId = localStorage.getItem("teacherId") || "";

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass);
    } else {
      setStudents([]);
      setMarks({});
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    try {
      const snap = await getDocs(
        query(collection(db, "classes"), where("teacherId", "==", teacherId))
      );
      setClasses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.log(err);
    }
  };

  const loadStudents = async (className) => {
    try {
      setLoading(true);
      const snap = await getDocs(
        query(collection(db, "students"), where("className", "==", className))
      );
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStudents(list);

      const initial = {};
      list.forEach((s) => {
        initial[s.id] = "";
      });
      setMarks(initial);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const setMark = (studentId, value) => {
    setMarks({ ...marks, [studentId]: value });
  };

  const saveExam = async () => {
    if (!selectedClass || !subject || !examName) {
      alert("Please fill Class, Subject and Exam Name");
      return;
    }

    try {
      setSaving(true);

      const examDoc = await addDoc(collection(db, "exams"), {
        className: selectedClass,
        subject,
        examName,
        examDate,
        maxMarks: Number(maxMarks),
        teacherId,
        createdAt: new Date(),
      });

      for (const student of students) {
        const scoreValue = marks[student.id];
        if (scoreValue === "" || scoreValue === undefined) continue;

        await addDoc(collection(db, "results"), {
          examId: examDoc.id,
          examName,
          subject,
          className: selectedClass,
          studentId: student.id,
          studentName: student.fullName,
          marks: Number(scoreValue),
          maxMarks: Number(maxMarks),
          teacherId,
          createdAt: new Date(),
        });
      }

      alert("Exam and marks saved successfully");

      setExamName("");
      setMarks({});
    } catch (err) {
      console.log(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#1f7a3f" }}>Exams</h1>

      <div style={filtersGrid}>
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
          <label style={label}>Subject</label>
          <select
            style={input}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={label}>Exam Name</label>
          <input
            style={input}
            placeholder="e.g. Midterm Exam"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
          />
        </div>

        <div>
          <label style={label}>Exam Date</label>
          <input
            style={input}
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
          />
        </div>

        <div>
          <label style={label}>Max Marks</label>
          <input
            style={input}
            type="number"
            value={maxMarks}
            onChange={(e) => setMaxMarks(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading students...</p>
      ) : students.length === 0 ? (
        <p style={{ color: "#777" }}>
          {selectedClass
            ? "No students found in this class."
            : "Select a class to load students."}
        </p>
      ) : (
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Marks (out of {maxMarks || 0})</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td style={td}>{s.fullName}</td>
                <td style={td}>
                  <input
                    style={{ ...input, width: 120 }}
                    type="number"
                    value={marks[s.id] || ""}
                    onChange={(e) => setMark(s.id, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {students.length > 0 && (
        <button
          onClick={saveExam}
          disabled={saving}
          style={{ ...btnPrimary, marginTop: 20 }}
        >
          {saving ? "Saving..." : "Save Exam & Marks"}
        </button>
      )}
    </div>
  );
}

const filtersGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
  marginBottom: 24,
};
const label = {
  display: "block",
  fontWeight: "bold",
  marginBottom: 6,
};
const input = {
  width: "100%",
  padding: "10px 12px",
  boxSizing: "border-box",
  border: "1px solid #ccc",
  borderRadius: 6,
};
const table = {
  width: "100%",
  borderCollapse: "collapse",
};
const th = {
  textAlign: "left",
  padding: "10px 8px",
  borderBottom: "2px solid #ddd",
};
const td = {
  padding: "10px 8px",
  borderBottom: "1px solid #eee",
};
const btnPrimary = {
  background: "#1f9d55",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "12px 24px",
  cursor: "pointer",
  fontWeight: "bold",
};