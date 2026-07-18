import { useEffect, useState } from "react";
import { db, storage } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { FileEdit, FileText, Send } from "lucide-react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

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
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  // Fayl-ka PDF-ga exam-ka ee macallinku doorto
  const [examFile, setExamFile] = useState(null);
  // Sawirka profile-ka macallinka - waxaa loo isticmaali doonaa fariinta Messages
  const [teacherPhoto, setTeacherPhoto] = useState("");

  // Class-yada macallinku wax ku dhigo, iyo doorashada class/subject
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [subject, setSubject] = useState("");

  const [saving, setSaving] = useState(false);

  // Taariikhda dhammaan exam-yadii uu macalinku hore u diray
  const [examHistory, setExamHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const teacherId = localStorage.getItem("teacherId") || "";
  const teacherName = localStorage.getItem("teacherName") || "Teacher";

  useEffect(() => {
    loadTeacherPhoto();
    loadExamHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTeacherPhoto = async () => {
    try {
      if (!teacherId) return;
      const teacherSnap = await getDoc(doc(db, "teachers", teacherId));
      if (teacherSnap.exists()) {
        const data = teacherSnap.data();
        setTeacherPhoto(data.photoUrl || "");

        const teacherClasses = Array.isArray(data.classes) ? data.classes : [];
        const uniqueClassNames = Array.from(
          new Set(teacherClasses.map((c) => c.className).filter(Boolean))
        );
        setClasses(uniqueClassNames.map((className) => ({ id: className, className })));
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Soo qaad dhammaan exam-yada uu macalinkan kan soo diray, kuwa ugu
  // dambeeya marka hore
  const loadExamHistory = async () => {
    try {
      setLoadingHistory(true);
      const snap = await getDocs(
        query(
          collection(db, "messages"),
          where("senderId", "==", teacherId),
          where("type", "==", "exam")
        )
      );
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
          const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
          return bTime - aTime;
        });
      setExamHistory(list);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  function formatDate(ts) {
    if (!ts) return "—";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString();
  }

  // Ku shub PDF-ga exam-ka Storage, kadibna hal fariin oo keliya
  // ugu dir Admin - magaca exam-ka, taariikhda iyo PDF-ka.
  const saveAndSendExam = async () => {
    if (!examName) {
      alert("Fadlan geli magaca Exam-ka");
      return;
    }

    if (!selectedClass || !subject) {
      alert("Fadlan dooro Class-ka iyo Subject-ka");
      return;
    }

    if (!examFile) {
      alert("Dooro PDF-ga Exam-ka");
      return;
    }

    try {
      setSaving(true);

      const storageRef = ref(
        storage,
        `teacher-exams/${teacherName}/${Date.now()}_${examFile.name}`
      );
      await uploadBytes(storageRef, examFile);
      const pdfUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, "messages"), {
        senderName: teacherName,
        senderRole: "Teacher",
        senderId: teacherId,
        senderPhoto: teacherPhoto,
        text: `Macallinka ${teacherName} wuxuu soo diray exam-ka "${examName}" - Fasalka ${selectedClass} (${subject}).`,
        type: "exam",
        examName,
        examDate,
        className: selectedClass,
        subject,
        fileUrl: pdfUrl,
        fileName: examFile.name,
        read: false,
        createdAt: serverTimestamp(),
      });

      alert("Exam-ka  si guul leh ayaa loogu diray maamulka.");

      setExamName("");
      setExamFile(null);
      setSelectedClass("");
      setSubject("");
      loadExamHistory();
    } catch (err) {
      console.log(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#05070D" }}>
      <Sidebar teacherName={teacherName} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar teacherName={teacherName} />

        <div style={{ padding: "0 20px 30px" }}>
          {/* Create Exam */}
          <div style={filterCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={iconCircle}>
                <FileEdit size={20} color="#8B5CF6" />
              </div>
              <h3 style={{ margin: 0, color: "#fff" }}>Create Exam</h3>
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
                <label style={label}>Exam PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setExamFile(e.target.files[0])}
                  style={input}
                />
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <button onClick={saveAndSendExam} disabled={saving} style={btnPrimary}>
                {saving ? (
                  "Sending..."
                ) : (
                  <>
                    <Send size={16} style={{ marginRight: 8 }} />
                    Send Exam
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Exam history - dhammaan PDF-yada iyo taariiqda la diray */}
          <div style={tableCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 20px 0" }}>
              <div style={iconCircle}>
                <FileText size={20} color="#22C55E" />
              </div>
              <h3 style={{ margin: 0, color: "#fff" }}>Exams-kii hore loo diray</h3>
            </div>

            {loadingHistory ? (
              <p style={{ padding: 20, color: "#94A3B8" }}>Loading...</p>
            ) : examHistory.length === 0 ? (
              <p style={{ padding: 20, color: "#94A3B8" }}>
                Weli exam lama dirin.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 20 }}>
                {examHistory.map((exam) => (
                  <a
                    key={exam.id}
                    href={exam.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={historyRow}
                  >
                    <div style={iconCircleSmall}>
                      <FileText size={18} color="#8B5CF6" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>
                        {exam.examName}
                      </div>
                      <div style={{ color: "#94A3B8", fontSize: 12.5, marginTop: 2 }}>
                        Fasalka {exam.className || "—"} • {exam.subject || "—"} &nbsp;•&nbsp;
                        Exam Date: {exam.examDate || "—"} &nbsp;•&nbsp; Sent:{" "}
                        {formatDate(exam.createdAt)}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
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
const iconCircleSmall = {
  width: 36,
  height: 36,
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
const btnPrimary = {
  background: "linear-gradient(90deg,#6D5DF0,#8B5CF6)",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "14px 28px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 15,
  display: "flex",
  alignItems: "center",
};
const historyRow = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  background: "#111827",
  border: "1px solid rgba(255,255,255,.06)",
  borderRadius: 14,
  padding: "12px 16px",
  textDecoration: "none",
  cursor: "pointer",
};