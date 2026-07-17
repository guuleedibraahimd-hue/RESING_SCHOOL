import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebase";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

const classOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "F1", "F2", "F3", "F4"];

const emptyRow = () => ({
  fullName: "",
  className: "",
  monthlyFee: "",
  parentPhone: "",
  studentPhone: "",
  district: "",
  previousSchool: "",
  orphanStatus: "No",
  parentPassword: "",
  studentPhoto: null,
});

export default function BulkRegistration() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([emptyRow()]);
  const [showPopup, setShowPopup] = useState(false);
  const [savedStudents, setSavedStudents] = useState([]);

  const addRow = () => {
    setStudents([...students, emptyRow()]);
  };

  const handleLastFieldKeyDown = (index, e) => {
    const isLastRow = index === students.length - 1;
    if (!isLastRow) return;

    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      addRow();

      setTimeout(() => {
        const nextInput = document.querySelector(
          `[data-row="${index + 1}"][data-field="fullName"]`
        );
        if (nextInput) nextInput.focus();
      }, 0);
    }
  };

  const removeRow = (index) => {
    if (students.length === 1) return;
    setStudents(students.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const data = [...students];
    data[index][field] = value;
    setStudents(data);
  };

  const handleFileChange = (index, file) => {
    const data = [...students];
    data[index].studentPhoto = file;
    setStudents(data);
  };

  // Dhammaan macalimiinta fasalkan (className) leh ayaa loo daraa liiskooda
  // ardayda, kaliya studentId + fullName.
  const attachStudentToClassTeachers = async (
    teachersSnap,
    className,
    studentId,
    fullName
  ) => {
    for (const teacherDoc of teachersSnap.docs) {
      const data = teacherDoc.data();
      const teacherClasses = Array.isArray(data.classes) ? data.classes : [];

      const teachesThisClass = teacherClasses.some(
        (c) => c.className === className
      );

      if (teachesThisClass) {
        await updateDoc(doc(db, "teachers", teacherDoc.id), {
          students: arrayUnion({ studentId, fullName }),
        });
      }
    }
  };

  const saveStudents = async () => {
    try {
      const saved = [];

      // Load teachers once, isticmaal isla liiska dhammaan safafka
      const teachersSnap = await getDocs(collection(db, "teachers"));

      for (let i = 0; i < students.length; i++) {
        const student = students[i];

        const studentId = String(i + 1).padStart(4, "0");

        await setDoc(doc(db, "students", studentId), {
          studentId,
          fullName: student.fullName,
          className: student.className,
          monthlyFee: student.monthlyFee,
          parentPhone: student.parentPhone,
          studentPhone: student.studentPhone,
          district: student.district,
          previousSchool: student.previousSchool,
          orphanStatus: student.orphanStatus,
          parentPassword: student.parentPassword,
          createdAt: new Date(),
        });

        await setDoc(doc(db, "attendance", studentId), {
          studentId,
          studentName: student.fullName,
        });

        await setDoc(doc(db, "cashier", studentId), {
          studentId,
          studentName: student.fullName,
          studentPhone: student.studentPhone,
          parentPhone: student.parentPhone,
          monthlyFee: student.monthlyFee,
        });

        if (student.className) {
          await attachStudentToClassTeachers(
            teachersSnap,
            student.className,
            studentId,
            student.fullName
          );
        }

        saved.push({
          ...student,
          studentId,
        });
      }

      setSavedStudents(saved);
      setShowPopup(true);
    } catch (err) {
      console.log(err);
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#1f7a3f" }}>Bulk Student Registration</h1>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 20,
            minWidth: 1300,
          }}
        >
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th style={th}>Full Name</th>
              <th style={th}>Class Name</th>
              <th style={th}>Monthly Fee ($)</th>
              <th style={th}>Parent Phone</th>
              <th style={th}>Student Phone</th>
              <th style={th}>District</th>
              <th style={th}>Previous School</th>
              <th style={th}>Orphan Status</th>
              <th style={th}>Parent Password</th>
              <th style={th}>Student Photo</th>
              <th style={th}></th>
            </tr>
          </thead>

          <tbody>
            {students.map((student, index) => (
              <tr key={index}>
                <td style={td}>
                  <input
                    style={input}
                    data-row={index}
                    data-field="fullName"
                    value={student.fullName}
                    onChange={(e) =>
                      handleChange(index, "fullName", e.target.value)
                    }
                  />
                </td>

                <td style={td}>
                  <select
                    style={input}
                    value={student.className}
                    onChange={(e) =>
                      handleChange(index, "className", e.target.value)
                    }
                  >
                    <option value="">Select Class</option>
                    {classOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </td>

                <td style={td}>
                  <input
                    style={input}
                    type="number"
                    value={student.monthlyFee}
                    onChange={(e) =>
                      handleChange(index, "monthlyFee", e.target.value)
                    }
                  />
                </td>

                <td style={td}>
                  <input
                    style={input}
                    value={student.parentPhone}
                    onChange={(e) =>
                      handleChange(index, "parentPhone", e.target.value)
                    }
                  />
                </td>

                <td style={td}>
                  <input
                    style={input}
                    value={student.studentPhone}
                    onChange={(e) =>
                      handleChange(index, "studentPhone", e.target.value)
                    }
                  />
                </td>

                <td style={td}>
                  <input
                    style={input}
                    value={student.district}
                    onChange={(e) =>
                      handleChange(index, "district", e.target.value)
                    }
                  />
                </td>

                <td style={td}>
                  <input
                    style={input}
                    value={student.previousSchool}
                    onChange={(e) =>
                      handleChange(index, "previousSchool", e.target.value)
                    }
                  />
                </td>

                <td style={td}>
                  <select
                    style={input}
                    value={student.orphanStatus}
                    onChange={(e) =>
                      handleChange(index, "orphanStatus", e.target.value)
                    }
                  >
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </td>

                <td style={td}>
                  <input
                    style={input}
                    value={student.parentPassword}
                    onChange={(e) =>
                      handleChange(index, "parentPassword", e.target.value)
                    }
                    onKeyDown={(e) => handleLastFieldKeyDown(index, e)}
                  />
                </td>

                <td style={td}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileChange(index, e.target.files[0])
                    }
                  />
                </td>

                <td style={td}>
                  <button
                    onClick={() => removeRow(index)}
                    style={{
                      background: "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <br />

      <button onClick={addRow} style={btnSecondary}>
        + Add Row
      </button>

      <button onClick={saveStudents} style={btnPrimary}>
        Save All
      </button>

      {showPopup && (
        <div style={popupOverlay}>
          <div style={popupCard}>
            <h2 style={{ color: "#1f7a3f", marginTop: 0 }}>
              Students Saved Successfully
            </h2>

            {savedStudents.map((student) => (
              <div key={student.studentId}>
                <b>{student.fullName}</b>
                <br />
                Student ID : {student.studentId}
                <hr />
              </div>
            ))}

            <button
              onClick={() => navigate("/admin/students")}
              style={btnPrimary}
            >
              Go To Students
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const th = { padding: "8px 6px", borderBottom: "2px solid #ddd" };
const td = { padding: "6px", borderBottom: "1px solid #eee" };
const input = {
  width: "100%",
  padding: "6px 8px",
  boxSizing: "border-box",
  border: "1px solid #ccc",
  borderRadius: 4,
};
const btnPrimary = {
  marginLeft: 10,
  background: "#1f9d55",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "10px 18px",
  cursor: "pointer",
  fontWeight: "bold",
};
const btnSecondary = {
  background: "#eee",
  border: "1px solid #ccc",
  borderRadius: 6,
  padding: "10px 18px",
  cursor: "pointer",
};
const popupOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};
const popupCard = {
  background: "white",
  borderRadius: 8,
  padding: 30,
  minWidth: 350,
  maxWidth: 500,
  maxHeight: "80vh",
  overflowY: "auto",
};