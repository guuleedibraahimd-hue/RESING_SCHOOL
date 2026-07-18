import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  GraduationCap,
  Users,
  UserCheck,
  UserX,
  CalendarCheck2,
  FileEdit,
  BarChart3,
  School,
} from "lucide-react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

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

  const statCards = [
    {
      label: "My Classes",
      value: classes.length,
      icon: School,
      ring: "#6D5DF0",
      bg: "rgba(109,93,240,0.15)",
    },
    {
      label: "Total Students",
      value: totalStudents,
      icon: GraduationCap,
      ring: "#22C55E",
      bg: "rgba(34,197,94,0.15)",
    },
    {
      label: "Present Today",
      value: presentToday,
      icon: UserCheck,
      ring: "#17A2B8",
      bg: "rgba(23,162,184,0.15)",
    },
    {
      label: "Absent Today",
      value: absentToday,
      icon: UserX,
      ring: "#EF4444",
      bg: "rgba(239,68,68,0.15)",
    },
  ];

  const quickActions = [
    { label: "Mark Attendance", icon: CalendarCheck2, path: "/teacher/attendance" },
    { label: "Create Exam", icon: FileEdit, path: "/teacher/exams" },
    { label: "View Results", icon: BarChart3, path: "/teacher/results" },
    { label: "View Students", icon: Users, path: "/teacher/students" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#05070D" }}>
      <Sidebar teacherName={teacherName} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar teacherName={teacherName} />

        {loading ? (
          <p style={{ padding: 30, color: "#94A3B8" }}>Loading dashboard...</p>
        ) : (
          <div style={{ padding: "0 20px 30px" }}>
            {/* Stat Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 20,
                marginBottom: 24,
              }}
            >
              {statCards.map((c) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.label}
                    style={{
                      background: "#0B1120",
                      borderRadius: 20,
                      padding: 22,
                      border: "1px solid rgba(255,255,255,.06)",
                    }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: "50%",
                        background: c.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 16,
                      }}
                    >
                      <Icon size={22} color={c.ring} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: 30, color: "#fff" }}>
                      {c.value}
                    </h3>
                    <p style={{ margin: "4px 0 0", color: "#94A3B8" }}>
                      {c.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* My Classes */}
            <div
              style={{
                background: "#0B1120",
                borderRadius: 20,
                padding: 24,
                marginBottom: 24,
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <h3 style={{ marginTop: 0, color: "#fff" }}>My Classes</h3>

              {classes.length === 0 ? (
                <p style={{ color: "#94A3B8" }}>No classes assigned yet.</p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 16,
                  }}
                >
                  {classes.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        border: "1px solid rgba(255,255,255,.08)",
                        borderRadius: 15,
                        padding: 16,
                        background: "#111827",
                      }}
                    >
                      <h4 style={{ margin: "0 0 6px 0", color: "#fff" }}>
                        {c.className}
                      </h4>
                      <p style={{ margin: 0, color: "#94A3B8" }}>
                        Section: {c.section || "-"}
                      </p>
                      <p style={{ margin: 0, color: "#94A3B8" }}>
                        Students: {c.studentCount || 0}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Today's Attendance */}
            <div
              style={{
                background: "#0B1120",
                borderRadius: 20,
                padding: 24,
                marginBottom: 24,
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <h3 style={{ marginTop: 0, color: "#fff" }}>Today's Attendance</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <span style={{ color: "#22C55E", fontWeight: "bold" }}>
                  Present: {presentToday}
                </span>
                <span style={{ color: "#EF4444", fontWeight: "bold" }}>
                  Absent: {absentToday}
                </span>
                <button
                  onClick={() => navigate("/teacher/attendance")}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    color: "#8B5CF6",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: "bold",
                  }}
                >
                  Take / Update Attendance →
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div
              style={{
                background: "#0B1120",
                borderRadius: 20,
                padding: 24,
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <h3 style={{ marginTop: 0, color: "#fff" }}>Quick Actions</h3>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {quickActions.map((a) => {
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.label}
                      onClick={() => navigate(a.path)}
                      style={{
                        background: "linear-gradient(90deg,#6D5DF0,#8B5CF6)",
                        color: "white",
                        border: "none",
                        borderRadius: 15,
                        padding: "14px 22px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Icon size={18} />
                      {a.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}