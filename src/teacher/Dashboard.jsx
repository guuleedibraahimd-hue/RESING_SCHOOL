import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function Dashboard() {
  const navigate = useNavigate();

  const [teacherName, setTeacherName] = useState("Teacher");
  const [classes, setClasses] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [absentToday, setAbsentToday] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const teacherId = localStorage.getItem("teacherId") || "";
      const teacherNameStored = localStorage.getItem("teacherName");
      if (teacherNameStored) setTeacherName(teacherNameStored);

      const classesSnap = await getDocs(
        query(collection(db, "classes"), where("teacherId", "==", teacherId))
      );
      const classList = classesSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setClasses(classList);

      const studentsSnap = await getDocs(collection(db, "students"));
      setTotalStudents(studentsSnap.size);

      const today = new Date().toISOString().slice(0, 10);
      const attSnap = await getDocs(
        query(collection(db, "attendance"), where("date", "==", today))
      );

      let present = 0;
      let absent = 0;
      attSnap.docs.forEach((d) => {
        const data = d.data();
        if (data.status === "Present") present++;
        if (data.status === "Absent") absent++;
      });

      setPresentToday(present);
      setAbsentToday(absent);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("teacherId");
    localStorage.removeItem("teacherName");
    navigate("/login/teacher");
  };

  return (
    <div style={styles.wrapper}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>🏫 Teacher Panel</h2>

        <div style={styles.navLink} onClick={() => navigate("/teacher/dashboard")}>
          📊 Dashboard
        </div>
        <div style={styles.navLink} onClick={() => navigate("/teacher/attendance")}>
          🗓️ Attendance
        </div>
        <div style={styles.navLink} onClick={() => navigate("/teacher/exams")}>
          📝 Exams
        </div>
        <div style={styles.navLink} onClick={() => navigate("/teacher/results")}>
          📈 Results
        </div>
        <div style={styles.navLink} onClick={() => navigate("/teacher/students")}>
          🎓 Students
        </div>
        <div style={styles.navLink} onClick={() => navigate("/teacher/profile")}>
          👤 Profile
        </div>

        <div style={{ flex: 1 }} />

        <div style={styles.logoutBtn} onClick={logout}>
          🚪 Logout
        </div>
      </div>

      {/* Main content */}
      <div style={styles.main}>
        {/* Topbar */}
        <div style={styles.topbar}>
          <h2 style={{ margin: 0 }}>Welcome, {teacherName}</h2>
          <div
            style={styles.avatar}
            onClick={() => navigate("/teacher/profile")}
            title="Profile"
          >
            {teacherName.charAt(0).toUpperCase()}
          </div>
        </div>

        {loading ? (
          <p style={{ padding: 30 }}>Loading dashboard...</p>
        ) : (
          <div style={{ padding: 30 }}>
            {/* Dashboard Cards */}
            <div style={styles.cardsRow}>
              <div style={{ ...styles.card, borderLeft: "6px solid #0d6efd" }}>
                <h3 style={styles.cardValue}>{classes.length}</h3>
                <p style={styles.cardLabel}>My Classes</p>
              </div>

              <div style={{ ...styles.card, borderLeft: "6px solid #1f9d55" }}>
                <h3 style={styles.cardValue}>{totalStudents}</h3>
                <p style={styles.cardLabel}>Total Students</p>
              </div>

              <div style={{ ...styles.card, borderLeft: "6px solid #17a2b8" }}>
                <h3 style={styles.cardValue}>{presentToday}</h3>
                <p style={styles.cardLabel}>Present Today</p>
              </div>

              <div style={{ ...styles.card, borderLeft: "6px solid #e74c3c" }}>
                <h3 style={styles.cardValue}>{absentToday}</h3>
                <p style={styles.cardLabel}>Absent Today</p>
              </div>
            </div>

            {/* My Classes */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>My Classes</h3>

              {classes.length === 0 ? (
                <p style={{ color: "#777" }}>No classes assigned yet.</p>
              ) : (
                <div style={styles.classGrid}>
                  {classes.map((c) => (
                    <div key={c.id} style={styles.classCard}>
                      <h4 style={{ margin: "0 0 6px 0" }}>{c.className}</h4>
                      <p style={{ margin: 0, color: "#666" }}>
                        Section: {c.section || "-"}
                      </p>
                      <p style={{ margin: 0, color: "#666" }}>
                        Students: {c.studentCount || 0}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Today's Attendance */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Today's Attendance</h3>
              <div style={styles.attendanceBar}>
                <div style={styles.attendanceStat}>
                  <span style={{ color: "#1f9d55", fontWeight: "bold" }}>
                    Present: {presentToday}
                  </span>
                </div>
                <div style={styles.attendanceStat}>
                  <span style={{ color: "#e74c3c", fontWeight: "bold" }}>
                    Absent: {absentToday}
                  </span>
                </div>
                <button
                  style={styles.linkBtn}
                  onClick={() => navigate("/teacher/attendance")}
                >
                  Take / Update Attendance →
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Quick Actions</h3>
              <div style={styles.quickActions}>
                <button
                  style={styles.quickBtn}
                  onClick={() => navigate("/teacher/attendance")}
                >
                  🗓️ Mark Attendance
                </button>
                <button
                  style={styles.quickBtn}
                  onClick={() => navigate("/teacher/exams")}
                >
                  📝 Create Exam
                </button>
                <button
                  style={styles.quickBtn}
                  onClick={() => navigate("/teacher/results")}
                >
                  📈 View Results
                </button>
                <button
                  style={styles.quickBtn}
                  onClick={() => navigate("/teacher/students")}
                >
                  🎓 View Students
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "sans-serif",
    background: "#f4f7fb",
  },
  sidebar: {
    width: 230,
    background: "#101c30",
    color: "white",
    display: "flex",
    flexDirection: "column",
    padding: "20px 0",
  },
  logo: {
    padding: "0 20px",
    marginBottom: 30,
    fontSize: 18,
  },
  navLink: {
    padding: "12px 20px",
    cursor: "pointer",
    fontSize: 15,
    borderLeft: "3px solid transparent",
  },
  logoutBtn: {
    padding: "12px 20px",
    cursor: "pointer",
    color: "#ff6b6b",
    borderTop: "1px solid #223148",
    marginTop: 10,
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  topbar: {
    height: 70,
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 30px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "#0d6efd",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    cursor: "pointer",
  },
  cardsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 20,
    marginBottom: 30,
  },
  card: {
    background: "white",
    borderRadius: 10,
    padding: "20px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  cardValue: {
    margin: 0,
    fontSize: 28,
  },
  cardLabel: {
    margin: 0,
    color: "#777",
  },
  section: {
    background: "white",
    borderRadius: 10,
    padding: 24,
    marginBottom: 24,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  sectionTitle: {
    marginTop: 0,
  },
  classGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 16,
  },
  classCard: {
    border: "1px solid #eee",
    borderRadius: 8,
    padding: 16,
    background: "#fafbfc",
  },
  attendanceBar: {
    display: "flex",
    alignItems: "center",
    gap: 24,
  },
  attendanceStat: {
    fontSize: 16,
  },
  linkBtn: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    color: "#0d6efd",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "bold",
  },
  quickActions: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },
  quickBtn: {
    background: "#0d6efd",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "14px 20px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 14,
  },
};