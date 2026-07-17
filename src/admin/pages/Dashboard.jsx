import { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import DashboardCard from "../components/DashboardCard";

export default function Dashboard() {
  // ---- States-ka xogta Dashboard-ka ----
  const [studentsCount, setStudentsCount] = useState(0);
  const [teachersCount, setTeachersCount] = useState(0);
  const [parentsCount, setParentsCount] = useState(0);
  const [classesCount, setClassesCount] = useState(0);

  const [recentStudents, setRecentStudents] = useState([]);
  const [classStudentCounts, setClassStudentCounts] = useState([]); // Class -> tirada ardayda
  const [recentMessages, setRecentMessages] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      // ---- 1) Soo qaad Students-ka oo dhan ----
      const studentsSnap = await getDocs(collection(db, "students"));
      const studentsList = studentsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudentsCount(studentsList.length);

      // ---- 2) Soo qaad Teachers-ka ----
      const teachersSnap = await getDocs(collection(db, "teachers"));
      setTeachersCount(teachersSnap.docs.length);

      // ---- 3) Tirada Parents-ka: waxaan ka soo saarnaa studentsList
      // (parentPhone unique ah ayaan u tirinaynaa si aan labanlaab u yeelan)
      const uniqueParentPhones = new Set(
        studentsList
          .map((s) => s.parentPhone)
          .filter((phone) => phone && phone.trim() !== "")
      );
      setParentsCount(uniqueParentPhones.size);

      // ---- 4) Classes: ka soo saar studentsList (className unique)
      const uniqueClasses = new Set(
        studentsList
          .map((s) => s.className)
          .filter((cls) => cls && cls.trim() !== "")
      );
      setClassesCount(uniqueClasses.size);

      // ---- 5) Recent Students (5-ta ugu dambeeyay ee la diiwaan geliyay)
      const recentQuery = query(
        collection(db, "students"),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const recentSnap = await getDocs(recentQuery);
      setRecentStudents(
        recentSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      // ---- 6) Tirinta ardayda class kasta (Class -> Count) ----
      const classCounts = {};
      studentsList.forEach((s) => {
        const cls = s.className || "Unknown";
        classCounts[cls] = (classCounts[cls] || 0) + 1;
      });
      const classCountsArray = Object.entries(classCounts).map(
        ([className, count]) => ({ className, count })
      );
      // Kor-u-kaca ugu badan
      classCountsArray.sort((a, b) => b.count - a.count);
      setClassStudentCounts(classCountsArray);

      // ---- 7) Fariimaha ugu dambeeyay (Parents/Teachers/Students) ----
      // Collection-kan "messages" waa mid cusub oo aan u baahanahay in
      // uu leeyahay fields: senderName, senderRole ("parent"|"teacher"|"student"),
      // text, createdAt
      try {
        const messagesQuery = query(
          collection(db, "messages"),
          orderBy("createdAt", "desc"),
          limit(10)
        );
        const messagesSnap = await getDocs(messagesQuery);
        setRecentMessages(
          messagesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (msgErr) {
        // Haddii collection-ka "messages" uusan weli lahayn document, ha
        // burburin dashboard-ka oo dhan — kaliya liiska ka dhig mid madhan
        console.warn("Collection-ka messages weli ma jiro ama waa madhan:", msgErr);
        setRecentMessages([]);
      }
    } catch (error) {
      console.error("Khalad ayaa dhacay markii xogta Dashboard laga soo qaadanayay:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fb" }}>
      <Sidebar />

      <div style={{ flex: 1 }}>
        <Topbar />

        <div style={{ padding: "30px" }}>
          <h1
            style={{
              color: "#065f46",
              fontSize: "40px",
              marginBottom: "10px",
            }}
          >
            Admin Dashboard
          </h1>

          <p style={{ color: "#666" }}>Welcome to Resing School</p>

          {/* ---- Cards-ka tirakoobka ---- */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "20px",
              marginTop: "30px",
            }}
          >
            <DashboardCard
              title="Students"
              value={loading ? "..." : studentsCount}
              color="#2563eb"
              icon="🎓"
            />

            <DashboardCard
              title="Teachers"
              value={loading ? "..." : teachersCount}
              color="#16a34a"
              icon="👨‍🏫"
            />

            <DashboardCard
              title="Parents"
              value={loading ? "..." : parentsCount}
              color="#9333ea"
              icon="👨‍👩‍👧"
            />

            <DashboardCard
              title="Classes"
              value={loading ? "..." : classesCount}
              color="#f59e0b"
              icon="🏫"
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "20px",
              marginTop: "30px",
            }}
          >
            {/* ---- Recent Students ---- */}
            <div
              style={{
                background: "#fff",
                borderRadius: "15px",
                padding: "20px",
                minHeight: "400px",
                boxShadow: "0 5px 15px rgba(0,0,0,.08)",
              }}
            >
              <h2>Recent Students</h2>

              {loading ? (
                <p style={{ color: "#999" }}>Loading...</p>
              ) : recentStudents.length === 0 ? (
                <p style={{ color: "#999" }}>Weli arday lama diiwaan gelin.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
                  <thead>
                    <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
                      <th style={{ padding: "8px" }}>Magaca</th>
                      <th style={{ padding: "8px" }}>Class</th>
                      <th style={{ padding: "8px" }}>ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentStudents.map((s) => (
                      <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "8px" }}>{s.fullName || "—"}</td>
                        <td style={{ padding: "8px" }}>{s.className || "—"}</td>
                        <td style={{ padding: "8px" }}>{s.studentId || s.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* ---- Tirada ardayda class kasta ---- */}
              <h2 style={{ marginTop: "30px" }}>Ardayda Class Kasta</h2>
              {loading ? (
                <p style={{ color: "#999" }}>Loading...</p>
              ) : classStudentCounts.length === 0 ? (
                <p style={{ color: "#999" }}>Wax class ah lama diiwaan gelin.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                  {classStudentCounts.map((c) => (
                    <div
                      key={c.className}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                      }}
                    >
                      <span>Class {c.className}</span>
                      <strong>{c.count} arday</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ---- Fariimaha (Messages) ---- */}
            <div
              style={{
                background: "#fff",
                borderRadius: "15px",
                padding: "20px",
                minHeight: "400px",
                boxShadow: "0 5px 15px rgba(0,0,0,.08)",
              }}
            >
              <h2>Fariimaha Ugu Dambeeyay</h2>

              {loading ? (
                <p style={{ color: "#999" }}>Loading...</p>
              ) : recentMessages.length === 0 ? (
                <p style={{ color: "#999" }}>
                  Weli fariin lama helin. (Collection-ka "messages" ayaa
                  loo baahan yahay Firestore si fariimuhu halkan uga soo muuqdaan.)
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {recentMessages.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        borderBottom: "1px solid #f0f0f0",
                        paddingBottom: "10px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong>{m.senderName || "Qof aan la aqoon"}</strong>
                        <span
                          style={{
                            fontSize: "12px",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            background:
                              m.senderRole === "parent"
                                ? "#f3e8ff"
                                : m.senderRole === "teacher"
                                ? "#dcfce7"
                                : "#dbeafe",
                            color:
                              m.senderRole === "parent"
                                ? "#9333ea"
                                : m.senderRole === "teacher"
                                ? "#16a34a"
                                : "#2563eb",
                          }}
                        >
                          {m.senderRole || "—"}
                        </span>
                      </div>
                      <p style={{ color: "#555", margin: "4px 0 0" }}>{m.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}