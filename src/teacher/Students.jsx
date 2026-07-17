import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function Students() {
  const [classes, setClasses] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [searchText, setSearchText] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const teacherId = localStorage.getItem("teacherId") || "";

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, searchText, allStudents]);

  const loadData = async () => {
    try {
      setLoading(true);

      const classesSnap = await getDocs(
        query(collection(db, "classes"), where("teacherId", "==", teacherId))
      );
      const classList = classesSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setClasses(classList);

      const classNames = classList.map((c) => c.className);

      let students = [];
      if (classNames.length > 0) {
        const studentsSnap = await getDocs(
          query(
            collection(db, "students"),
            where("className", "in", classNames.slice(0, 10))
          )
        );
        students = studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }

      setAllStudents(students);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let list = [...allStudents];

    if (selectedClass) {
      list = list.filter((s) => s.className === selectedClass);
    }

    if (searchText.trim() !== "") {
      const text = searchText.toLowerCase();
      list = list.filter(
        (s) =>
          (s.fullName || "").toLowerCase().includes(text) ||
          (s.studentPhone || "").toLowerCase().includes(text) ||
          (s.parentPhone || "").toLowerCase().includes(text)
      );
    }

    setFilteredStudents(list);
  };

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#1f7a3f" }}>My Students</h1>

      <div style={filtersRow}>
        <div>
          <label style={label}>Class</label>
          <select
            style={input}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.className}>
                {c.className}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: 220 }}>
          <label style={label}>Search</label>
          <input
            style={input}
            placeholder="Search by name or phone..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading students...</p>
      ) : filteredStudents.length === 0 ? (
        <p style={{ color: "#777" }}>No students found.</p>
      ) : (
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          <table style={{ ...table, flex: 2 }}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Class</th>
                <th style={th}>Student Phone</th>
                <th style={th}>Parent Phone</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id}>
                  <td style={td}>{s.fullName}</td>
                  <td style={td}>{s.className}</td>
                  <td style={td}>{s.studentPhone || "-"}</td>
                  <td style={td}>{s.parentPhone || "-"}</td>
                  <td style={td}>
                    <button
                      style={btnSecondary}
                      onClick={() => setSelectedStudent(s)}
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedStudent && (
            <div style={profileCard}>
              <button
                style={closeBtn}
                onClick={() => setSelectedStudent(null)}
              >
                ✕
              </button>

              <div style={profilePhotoWrap}>
                {selectedStudent.studentPhoto ? (
                  <img
                    src={selectedStudent.studentPhoto}
                    alt={selectedStudent.fullName}
                    style={profilePhoto}
                  />
                ) : (
                  <div style={profilePlaceholder}>
                    {(selectedStudent.fullName || "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <h3 style={{ textAlign: "center", marginBottom: 4 }}>
                {selectedStudent.fullName}
              </h3>
              <p style={{ textAlign: "center", color: "#777", marginTop: 0 }}>
                {selectedStudent.className}
              </p>

              <div style={profileRow}>
                <span style={profileLabel}>Student ID</span>
                <span>{selectedStudent.studentId || "-"}</span>
              </div>
              <div style={profileRow}>
                <span style={profileLabel}>Student Phone</span>
                <span>{selectedStudent.studentPhone || "-"}</span>
              </div>
              <div style={profileRow}>
                <span style={profileLabel}>Parent Phone</span>
                <span>{selectedStudent.parentPhone || "-"}</span>
              </div>
              <div style={profileRow}>
                <span style={profileLabel}>District</span>
                <span>{selectedStudent.district || "-"}</span>
              </div>
              <div style={profileRow}>
                <span style={profileLabel}>Previous School</span>
                <span>{selectedStudent.previousSchool || "-"}</span>
              </div>
              <div style={profileRow}>
                <span style={profileLabel}>Orphan Status</span>
                <span>{selectedStudent.orphanStatus || "-"}</span>
              </div>
              <div style={profileRow}>
                <span style={profileLabel}>Monthly Fee</span>
                <span>{selectedStudent.monthlyFee || "-"}</span>
              </div>
            </div>
          )}
        </div>
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
  width: "100%",
  padding: "10px 12px",
  boxSizing: "border-box",
  border: "1px solid #ccc",
  borderRadius: 6,
  minWidth: 180,
};
const table = {
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
const btnSecondary = {
  background: "#eee",
  border: "1px solid #ccc",
  borderRadius: 6,
  padding: "6px 14px",
  cursor: "pointer",
};
const profileCard = {
  flex: 1,
  minWidth: 280,
  background: "white",
  borderRadius: 10,
  padding: 24,
  boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
  position: "relative",
};
const closeBtn = {
  position: "absolute",
  top: 10,
  right: 10,
  background: "none",
  border: "none",
  fontSize: 16,
  cursor: "pointer",
};
const profilePhotoWrap = {
  display: "flex",
  justifyContent: "center",
  marginBottom: 12,
};
const profilePhoto = {
  width: 90,
  height: 90,
  borderRadius: "50%",
  objectFit: "cover",
};
const profilePlaceholder = {
  width: 90,
  height: 90,
  borderRadius: "50%",
  background: "#0d6efd",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 32,
  fontWeight: "bold",
};
const profileRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: "1px solid #f0f0f0",
  fontSize: 14,
};
const profileLabel = {
  color: "#777",
};