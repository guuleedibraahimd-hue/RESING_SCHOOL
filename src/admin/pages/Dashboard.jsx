import { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import DashboardCard from "../components/DashboardCard";

export default function Dashboard() {
  const [studentsCount, setStudentsCount] = useState(0);
  const [teachersCount, setTeachersCount] = useState(0);
  const [parentsCount, setParentsCount] = useState(0);
  const [classesCount, setClassesCount] = useState(0);
  const [cashiersCount, setCashiersCount] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      const studentsSnap = await getDocs(collection(db, "students"));
      const studentsList = studentsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudentsCount(studentsList.length);

      const teachersSnap = await getDocs(collection(db, "teachers"));
      setTeachersCount(teachersSnap.docs.length);

      const cashierSnap = await getDocs(collection(db, "cashier"));
      setCashiersCount(cashierSnap.docs.length);

      const uniqueParentPhones = new Set(
        studentsList
          .map((s) => s.parentPhone)
          .filter((phone) => phone && phone.trim() !== "")
      );
      setParentsCount(uniqueParentPhones.size);

      const uniqueClasses = new Set(
        studentsList
          .map((s) => s.className)
          .filter((cls) => cls && cls.trim() !== "")
      );
      setClassesCount(uniqueClasses.size);
    } catch (error) {
      console.error("Khalad ayaa dhacay markii xogta Dashboard laga soo qaadanayay:", error);
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0b0a1c",
        fontFamily: "'Inter','Segoe UI',sans-serif",
      }}
    >
      <Sidebar />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ padding: "22px 26px 0" }}>
          <Topbar />
        </div>

        <div style={{ padding: "26px 30px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 22,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: 20, color: "#fff", fontWeight: 700 }}>
                Guudmarka Iskuulka
              </h1>
              <p style={{ margin: "4px 0 0", color: "#8b87ad", fontSize: 13.5 }}>
                {today}
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            <DashboardCard
              title="Students"
              value={loading ? "..." : studentsCount}
              icon="🎓"
              color="#6D5DF0"
              percent="12%"
            />

            <DashboardCard
              title="Teachers"
              value={loading ? "..." : teachersCount}
              icon="🧑‍🏫"
              color="#22c55e"
              percent="20%"
            />

            <DashboardCard
              title="Cashiers"
              value={loading ? "..." : cashiersCount}
              icon="💰"
              color="#ef4444"
              percent="15%"
            />

            <DashboardCard
              title="Parents"
              value={loading ? "..." : parentsCount}
              icon="👨‍👩‍👧"
              color="#c084fc"
              percent="10%"
            />

            <DashboardCard
              title="Classes"
              value={loading ? "..." : classesCount}
              icon="🏫"
              color="#f59e0b"
              percent="18%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}