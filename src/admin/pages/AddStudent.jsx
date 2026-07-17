import { useState } from "react";
import { db } from "../../firebase/firebase";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

const classOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "F1", "F2", "F3", "F4"];

export default function AddStudent() {
  const [student, setStudent] = useState({
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

  const handleChange = (e) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setStudent({
      ...student,
      studentPhoto: e.target.files[0],
    });
  };

  // Dhammaan macalimiinta fasalkan (className) leh ayaa loo daraa liiskooda
  // ardayda, kaliya studentId + fullName.
  const attachStudentToClassTeachers = async (className, studentId, fullName) => {
    const teachersSnap = await getDocs(collection(db, "teachers"));

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

  const saveStudent = async () => {
    try {
      if (!student.className) {
        alert("Fadlan dooro Class");
        return;
      }

      const existingSnap = await getDocs(collection(db, "students"));
      const studentId = String(existingSnap.size + 1).padStart(4, "0");

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

      await attachStudentToClassTeachers(
        student.className,
        studentId,
        student.fullName
      );

      alert("Student Saved Successfully: " + student.fullName + "\nStudent ID: " + studentId);
    } catch (err) {
      console.log(err);
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif", maxWidth: 800 }}>
      <h1 style={{ color: "#1f7a3f" }}>📝 Register New Student</h1>

      <div style={grid}>
        <div>
          <label style={label}>Full Name</label>
          <input
            style={input}
            name="fullName"
            value={student.fullName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label style={label}>Class Name</label>
          <select
            style={input}
            name="className"
            value={student.className}
            onChange={handleChange}
          >
            <option value="">Select Class</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={label}>Monthly Fee ($)</label>
          <input
            style={input}
            type="number"
            name="monthlyFee"
            value={student.monthlyFee}
            onChange={handleChange}
          />
        </div>

        <div>
          <label style={label}>Parent Phone</label>
          <input
            style={input}
            name="parentPhone"
            value={student.parentPhone}
            onChange={handleChange}
          />
        </div>

        <div>
          <label style={label}>Student Phone</label>
          <input
            style={input}
            name="studentPhone"
            value={student.studentPhone}
            onChange={handleChange}
          />
        </div>

        <div>
          <label style={label}>District</label>
          <input
            style={input}
            name="district"
            value={student.district}
            onChange={handleChange}
          />
        </div>

        <div>
          <label style={label}>Previous School</label>
          <input
            style={input}
            name="previousSchool"
            value={student.previousSchool}
            onChange={handleChange}
          />
        </div>

        <div>
          <label style={label}>Orphan Status</label>
          <select
            style={input}
            name="orphanStatus"
            value={student.orphanStatus}
            onChange={handleChange}
          >
            <option>No</option>
            <option>Yes</option>
          </select>
        </div>

        <div>
          <label style={label}>Parent Password</label>
          <input
            style={input}
            name="parentPassword"
            value={student.parentPassword}
            onChange={handleChange}
          />
        </div>

        <div>
          <label style={label}>Student Photo</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
      </div>

      <br />

      <button onClick={saveStudent} style={btnPrimary}>
        🚀 Complete Registration
      </button>
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px 20px",
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
const btnPrimary = {
  width: "100%",
  background: "#1f9d55",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "14px 18px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 16,
};