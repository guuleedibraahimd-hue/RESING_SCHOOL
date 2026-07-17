import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function Results() {
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  const [results, setResults] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const [loading, setLoading] = useState(false);
  const teacherId = localStorage.getItem("teacherId") || "";

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadExams(selectedClass);
    } else {
      setExams([]);
      setSelectedExam("");
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedExam) {
      loadResults(selectedClass, selectedExam);
    } else {
      setResults([]);
    }
  }, [selectedClass, selectedExam]);

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

  const loadExams = async (className) => {
    try {
      const snap = await getDocs(
        query(collection(db, "exams"), where("className", "==", className))
      );
      setExams(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.log(err);
    }
  };

  const loadResults = async (className, examId) => {
    try {
      setLoading(true);
      const snap = await getDocs(
        query(
          collection(db, "results"),
          where("className", "==", className),
          where("examId", "==", examId)
        )
      );
      setResults(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (result) => {
    setEditingId(result.id);
    setEditValue(result.marks);
  };

  const saveEdit = async (result) => {
    try {
      await updateDoc(doc(db, "results", result.id), {
        marks: Number(editValue),
        updatedAt: new Date(),
      });

      setResults(
        results.map((r) =>
          r.id === result.id ? { ...r, marks: Number(editValue) } : r
        )
      );
      setEditingId(null);
    } catch (err) {
      console.log(err);
      alert(err.message);
    }
  };

  const printResults = () => {
    window.print();
  };

  const getGrade = (marks, maxMarks) => {
    const pct = (marks / maxMarks) * 100;
    if (pct >= 90) return "A+";
    if (pct >= 80) return "A";
    if (pct >= 70) return "B";
    if (pct >= 60) return "C";
    if (pct >= 50) return "D";
    return "F";
  };

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#1f7a3f" }}>Results</h1>

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
          <label style={label}>Exam</label>
          <select
            style={input}
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
          >
            <option value="">Select Exam</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.examName} ({e.subject})
              </option>
            ))}
          </select>
        </div>

        {results.length > 0 && (
          <button style={{ ...btnSecondary, alignSelf: "flex-end" }} onClick={printResults}>
            🖨️ Print
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading results...</p>
      ) : !selectedExam ? (
        <p style={{ color: "#777" }}>Select a class and exam to view results.</p>
      ) : results.length === 0 ? (
        <p style={{ color: "#777" }}>No results found for this exam.</p>
      ) : (
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Marks</th>
              <th style={th}>Max Marks</th>
              <th style={th}>Grade</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id}>
                <td style={td}>{r.studentName}</td>
                <td style={td}>
                  {editingId === r.id ? (
                    <input
                      style={{ ...input, width: 90 }}
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                  ) : (
                    r.marks
                  )}
                </td>
                <td style={td}>{r.maxMarks}</td>
                <td style={td}>{getGrade(r.marks, r.maxMarks)}</td>
                <td style={td}>
                  {editingId === r.id ? (
                    <button style={btnPrimarySmall} onClick={() => saveEdit(r)}>
                      Save
                    </button>
                  ) : (
                    <button style={btnSecondary} onClick={() => startEdit(r)}>
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const filtersRow = {
  display: "flex",
  gap: 20,
  marginBottom: 24,
  flexWrap: "wrap",
};
const label = {
  display: "block",
  fontWeight: "bold",
  marginBottom: 6,
};
const input = {
  padding: "10px 12px",
  border: "1px solid #ccc",
  borderRadius: 6,
  minWidth: 200,
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
const btnPrimarySmall = {
  background: "#1f9d55",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "6px 14px",
  cursor: "pointer",
  fontWeight: "bold",
};
const btnSecondary = {
  background: "#eee",
  border: "1px solid #ccc",
  borderRadius: 6,
  padding: "6px 14px",
  cursor: "pointer",
};