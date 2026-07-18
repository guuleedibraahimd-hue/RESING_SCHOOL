import { useEffect, useState } from "react";
import { db, storage } from "../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  setDoc,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import jsPDF from "jspdf";
import { BarChart3, Printer, Send, Lock } from "lucide-react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Results() {
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Teacher photo, loo baahan yahay marka fariinta Admin loo diro
  const [teacherPhoto, setTeacherPhoto] = useState("");

  const teacherId = localStorage.getItem("teacherId") || "";
  const teacherName = localStorage.getItem("teacherName") || "Teacher";

  useEffect(() => {
    loadClasses();
    loadTeacherPhoto();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadExamsForClass(selectedClass);
    } else {
      setExams([]);
    }
    setSelectedExam("");
    setStudents([]);
    setMarks({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedExam) {
      loadStudentsAndResults(selectedClass, selectedExam);
    } else {
      setStudents([]);
      setMarks({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExam]);

  const loadTeacherPhoto = async () => {
    try {
      if (!teacherId) return;
      const teacherSnap = await getDoc(doc(db, "teachers", teacherId));
      if (teacherSnap.exists()) {
        setTeacherPhoto(teacherSnap.data().photoUrl || "");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Matches actual Firestore structure: teachers/{teacherId} document
  // has a "classes" array field with { className, subject, ... } entries
  const loadClasses = async () => {
    try {
      if (!teacherId) {
        setClasses([]);
        return;
      }

      const teacherSnap = await getDoc(doc(db, "teachers", teacherId));

      if (!teacherSnap.exists()) {
        setClasses([]);
        return;
      }

      const data = teacherSnap.data();
      const teacherClasses = Array.isArray(data.classes) ? data.classes : [];

      const uniqueClassNames = Array.from(
        new Set(teacherClasses.map((c) => c.className).filter(Boolean))
      );

      const classList = uniqueClassNames.map((className) => ({
        id: className,
        className,
      }));

      setClasses(classList);
    } catch (err) {
      console.log(err);
    }
  };

  // Exam-yada uu macalinkan soo diray fasalkan - ka soo qaad "messages"
  // (waa halka Exams.jsx ku keydiyo exam-yada), oo tan ugu dambaysay
  // marka hore ku soo bandhig
  const loadExamsForClass = async (className) => {
    try {
      const snap = await getDocs(
        query(
          collection(db, "messages"),
          where("senderId", "==", teacherId),
          where("type", "==", "exam"),
          where("className", "==", className)
        )
      );
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
          const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
          return bTime - aTime;
        });
      setExams(list);
    } catch (err) {
      console.log(err);
    }
  };

  // Marka exam la doorto: soo qaad dhammaan ardayda class-ka, iyo haddii
  // results horeba loo keydiyay exam-kan soo geli marks-ka jira
  const loadStudentsAndResults = async (className, examId) => {
    try {
      setLoading(true);

      const studentsSnap = await getDocs(
        query(collection(db, "students"), where("className", "==", className))
      );
      const studentList = studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStudents(studentList);

      const resultsSnap = await getDocs(
        query(collection(db, "results"), where("examId", "==", examId))
      );
      const existing = {};
      resultsSnap.docs.forEach((d) => {
        const r = d.data();
        existing[r.studentId] = r.marks;
      });

      const initial = {};
      studentList.forEach((s) => {
        initial[s.id] = existing[s.id] !== undefined ? String(existing[s.id]) : "";
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

  const currentExam = exams.find((e) => e.id === selectedExam);
  const isLocked = currentExam?.resultsSent === true;

  const getGrade = (m, maxMarks) => {
    const pct = (m / maxMarks) * 100;
    if (pct >= 90) return "A+";
    if (pct >= 80) return "A";
    if (pct >= 70) return "B";
    if (pct >= 60) return "C";
    if (pct >= 50) return "D";
    return "F";
  };

  // Dhis hal PDF A4 ah oo leh dhammaan ardayda: magac, ID iyo marks
  const buildSummaryPdf = (studentsWithMarks, exam) => {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFillColor(11, 17, 32);
    pdf.rect(0, 0, pageWidth, 90, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text("RESING ERP - Exam Results", 40, 40);
    pdf.setFontSize(11);
    pdf.setTextColor(200, 200, 210);
    pdf.text(
      `${exam.examName || ""}  -  Fasalka ${selectedClass}  -  ${exam.subject || ""}`,
      40,
      60
    );

    pdf.setTextColor(20, 20, 30);
    pdf.setFontSize(11);
    let y = 120;
    pdf.setFont(undefined, "bold");
    pdf.text("#", 40, y);
    pdf.text("Student Name", 70, y);
    pdf.text("Student ID", 300, y);
    pdf.text("Marks", 420, y);
    pdf.text("Grade", 490, y);
    y += 10;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(40, y, pageWidth - 40, y);
    y += 20;

    pdf.setFont(undefined, "normal");
    studentsWithMarks.forEach((s, i) => {
      if (y > 780) {
        pdf.addPage();
        y = 60;
      }
      const grade = getGrade(s.marks, Number(s.maxMarks) || 100);
      pdf.text(String(i + 1), 40, y);
      pdf.text(String(s.studentName || "-"), 70, y);
      pdf.text(String(s.studentId || "-"), 300, y);
      pdf.text(`${s.marks} / ${s.maxMarks}`, 420, y);
      pdf.text(grade, 490, y);
      y += 22;
    });

    y += 10;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(40, y, pageWidth - 40, y);
    y += 30;
    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 130);
    pdf.text(`Teacher: ${teacherName}`, 40, y);
    pdf.text(`Exam Date: ${exam.examDate || "-"}`, 250, y);

    return pdf;
  };

  // Kaydi marks-ka results collection-ka, kadibna hal PDF A4 ah oo dhammaan
  // ardayda ku jira u dir Admin, kadibna calaamadee exam-ka in la dhammeeyay
  const saveAndSendResults = async () => {
    if (!selectedClass || !selectedExam) {
      alert("Fadlan dooro Class-ka iyo Exam-ka");
      return;
    }

    const studentsWithMarks = students.filter(
      (s) => marks[s.id] !== "" && marks[s.id] !== undefined
    );

    if (studentsWithMarks.length === 0) {
      alert("Fadlan geli buundooyinka ugu yaraan hal arday");
      return;
    }

    try {
      setSaving(true);

      const exam = currentExam || {};
      const maxMarks = Number(exam.maxMarks) || 100;

      const resultsForPdf = [];

      for (const student of studentsWithMarks) {
        const scoreValue = Number(marks[student.id]);
        resultsForPdf.push({
          studentId: student.studentId || student.id,
          studentName: student.fullName,
          marks: scoreValue,
          maxMarks,
        });

        // eslint-disable-next-line no-await-in-loop
        await setDoc(doc(db, "results", `${selectedExam}_${student.id}`), {
          examId: selectedExam,
          examName: exam.examName || "",
          subject: exam.subject || "",
          className: selectedClass,
          studentId: student.id,
          studentName: student.fullName,
          marks: scoreValue,
          maxMarks,
          teacherId,
          updatedAt: new Date(),
        });
      }

      // Dhis hal PDF A4 ah oo dhammaan ardayda ku jira, ku shub Storage
      const pdf = buildSummaryPdf(resultsForPdf, exam);
      const pdfBlob = pdf.output("blob");
      const storageRef = ref(
        storage,
        `teacher-results/${teacherName}/${Date.now()}_${selectedClass}_${exam.examName || "exam"}_results.pdf`
      );
      await uploadBytes(storageRef, pdfBlob);
      const pdfUrl = await getDownloadURL(storageRef);

      // Hal fariin oo keliya Admin loo diro, leh sax-gareynta iyo PDF-ga
      await addDoc(collection(db, "messages"), {
        senderName: teacherName,
        senderRole: "Teacher",
        senderId: teacherId,
        senderPhoto: teacherPhoto,
        text: `Macallinka ${teacherName} wuxuu dhammaystiray sax-gareynta exam-ka "${exam.examName}" - Fasalka ${selectedClass} (${exam.subject}). Kani waa exam-kii ugu dambeeyay ee la saxay.`,
        type: "results",
        examId: selectedExam,
        examName: exam.examName || "",
        examDate: exam.examDate || "",
        className: selectedClass,
        subject: exam.subject || "",
        isLatestExam: true,
        fileUrl: pdfUrl,
        fileName: `${exam.examName || "exam"}_results.pdf`,
        studentCount: resultsForPdf.length,
        read: false,
        createdAt: serverTimestamp(),
      });

      // Calaamadee message-ka exam-ka asalka ah in results-kiisa la diray,
      // si aan mar dambe loo soo bixin
      await setDoc(
        doc(db, "messages", selectedExam),
        { resultsSent: true },
        { merge: true }
      );

      setExams((prev) =>
        prev.map((e) => (e.id === selectedExam ? { ...e, resultsSent: true } : e))
      );

      alert("Natiijooyinka waa la kaydiyay oo warqad PDF ah ayaa Admin loo diray.");
    } catch (err) {
      console.log(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const printResults = () => {
    window.print();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#05070D" }}>
      <Sidebar teacherName={teacherName} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar teacherName={teacherName} />

        <div style={{ padding: "0 20px 30px" }}>
          {/* Filters */}
          <div style={filterCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={iconCircle}>
                <BarChart3 size={20} color="#8B5CF6" />
              </div>
              <h3 style={{ margin: 0, color: "#fff" }}>Results</h3>
            </div>

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
                {classes.length === 0 && (
                  <p style={{ color: "#F59E0B", fontSize: 12, marginTop: 6 }}>
                    Ma jiraan classes la helay teacher-kan.
                  </p>
                )}
              </div>

              <div>
                <label style={label}>Exam</label>
                <select
                  style={input}
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  disabled={!selectedClass}
                >
                  <option value="">Select Exam</option>
                  {exams.map((e, i) => (
                    <option key={e.id} value={e.id}>
                      {e.examName} ({e.subject}){i === 0 ? " - Ugu dambeeyay" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {students.length > 0 && !isLocked && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                  <button
                    style={btnPrimarySmall}
                    onClick={saveAndSendResults}
                    disabled={saving}
                  >
                    <Send size={14} style={{ marginRight: 6 }} />
                    {saving ? "Sending..." : "Save & Send"}
                  </button>
                </div>
              )}

              {students.length > 0 && (
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button style={btnSecondary} onClick={printResults}>
                    <Printer size={16} style={{ marginRight: 6 }} />
                    Print
                  </button>
                </div>
              )}
            </div>

            {isLocked && (
              <p
                style={{
                  color: "#22C55E",
                  fontSize: 13,
                  marginTop: 14,
                  marginBottom: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Lock size={14} />
                Natiijooyinkan waa la diray Admin - lama beddeli karo.
              </p>
            )}
          </div>

          {/* Results table */}
          <div style={tableCard}>
            {loading ? (
              <p style={{ padding: 20, color: "#94A3B8" }}>Loading students...</p>
            ) : !selectedExam ? (
              <p style={{ padding: 20, color: "#94A3B8" }}>
                Select a class and exam to view results.
              </p>
            ) : students.length === 0 ? (
              <p style={{ padding: 20, color: "#94A3B8" }}>
                No students found for this class.
              </p>
            ) : (
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Name</th>
                    <th style={th}>ID</th>
                    <th style={th}>Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td style={{ ...td, display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={avatar}>
                          {(s.fullName || "?").charAt(0).toUpperCase()}
                        </div>
                        {s.fullName}
                      </td>
                      <td style={td}>{s.studentId}</td>
                      <td style={td}>
                        <input
                          style={{ ...input, width: 90 }}
                          type="number"
                          disabled={isLocked}
                          value={marks[s.id] || ""}
                          onChange={(e) => setMark(s.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const filterCard = {
  background: "#0B1120",
  border: "1px solid rgba(255,255,255,.06)",
  borderRadius: 20,
  padding: 20,
  marginBottom: 20,
};
const iconCircle = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  background: "rgba(139,92,246,0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
const filtersGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
};
const label = {
  display: "block",
  fontWeight: "bold",
  marginBottom: 6,
  fontSize: 13,
  color: "#94A3B8",
};
const input = {
  width: "100%",
  padding: "10px 12px",
  boxSizing: "border-box",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 10,
  background: "#111827",
  color: "#fff",
};
const tableCard = {
  background: "#0B1120",
  border: "1px solid rgba(255,255,255,.06)",
  borderRadius: 20,
  marginBottom: 20,
  overflow: "hidden",
};
const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 12,
};
const th = {
  textAlign: "left",
  padding: "12px 20px",
  borderBottom: "1px solid rgba(255,255,255,.08)",
  color: "#94A3B8",
  fontSize: 13,
};
const td = {
  padding: "12px 20px",
  borderBottom: "1px solid rgba(255,255,255,.05)",
  fontSize: 14,
  color: "#E5E7EB",
};
const avatar = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  background: "linear-gradient(135deg,#6D5DF0,#8B5CF6)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  fontSize: 13,
  flexShrink: 0,
};
const btnPrimarySmall = {
  background: "linear-gradient(90deg,#6D5DF0,#8B5CF6)",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "10px 18px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 13,
  display: "inline-flex",
  alignItems: "center",
};
const btnSecondary = {
  background: "#111827",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 10,
  padding: "10px 18px",
  cursor: "pointer",
  color: "#fff",
  fontSize: 13,
  display: "inline-flex",
  alignItems: "center",
};