import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import DashboardCard from "../components/DashboardCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CLASS_COLORS = ["#6D5DF0", "#f59e0b", "#22c55e", "#c084fc", "#ef4444", "#0ea5e9"];

// Compares docs created in the current calendar month vs the previous one,
// using each doc's createdAt timestamp. Returns null when there isn't
// enough createdAt data to compute a meaningful percentage (so the UI can
// hide the badge instead of showing a made-up number).
function computeMonthGrowth(docsList) {
  const withDates = docsList.filter((d) => d.createdAt?.seconds);
  if (withDates.length === 0) return null;

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000;
  const lastMonthStart =
    new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime() / 1000;

  const thisMonthCount = withDates.filter((d) => d.createdAt.seconds >= thisMonthStart).length;
  const lastMonthCount = withDates.filter(
    (d) => d.createdAt.seconds >= lastMonthStart && d.createdAt.seconds < thisMonthStart
  ).length;

  if (lastMonthCount === 0) {
    return thisMonthCount > 0 ? 100 : 0;
  }
  return Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [teachersCount, setTeachersCount] = useState(0);
  const [parentsCount, setParentsCount] = useState(0);
  const [classesCount, setClassesCount] = useState(0);
  const [cashiersCount, setCashiersCount] = useState(0);
  const [classBreakdown, setClassBreakdown] = useState([]);
  const [feeStats, setFeeStats] = useState({ total: 0, collected: 0, pending: 0 });
  const [growth, setGrowth] = useState({
    students: null,
    teachers: null,
    cashiers: null,
    parents: null,
    classes: null,
  });

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
      setStudents(studentsList);

      const teachersSnap = await getDocs(collection(db, "teachers"));
      const teachersList = teachersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTeachersCount(teachersList.length);

      const cashierSnap = await getDocs(collection(db, "cashier"));
      // Only count cashier docs whose ID is a real username-style string,
      // not the numeric/padded-number placeholder docs (e.g. "0001", "0002").
      const cashierList = cashierSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((c) => !/^\d+$/.test(c.id));
      setCashiersCount(cashierList.length);

      const uniqueParentPhones = new Set(
        studentsList
          .map((s) => s.parentPhone)
          .filter((phone) => phone && phone.trim() !== "")
      );
      setParentsCount(uniqueParentPhones.size);

      // Class breakdown (for pie chart)
      const classCounts = {};
      studentsList.forEach((s) => {
        const cls = s.className && s.className.trim() !== "" ? s.className : null;
        if (cls) classCounts[cls] = (classCounts[cls] || 0) + 1;
      });
      const breakdown = Object.entries(classCounts).map(([name, count], i) => ({
        name,
        value: count,
        color: CLASS_COLORS[i % CLASS_COLORS.length],
      }));
      setClassBreakdown(breakdown);
      setClassesCount(breakdown.length);

      // Growth badges — computed from real createdAt timestamps, month over
      // month. null means "not enough data", which hides the badge in the UI
      // instead of showing a fake percentage.
      setGrowth({
        students: computeMonthGrowth(studentsList),
        teachers: computeMonthGrowth(teachersList),
        cashiers: computeMonthGrowth(cashierList),
        parents: null, // parents aren't a real collection with createdAt — no reliable growth signal
        classes: null, // classes are derived from student.className, not their own dated docs
      });

      // Fee stats — pulled from the real "payments" collection (source of truth
      // for money actually collected) and the "monthlyFee" field on each student
      // (source of truth for what's expected). Student docs do NOT have
      // totalFee/paidFee fields, so those can't be used.
      const paymentsSnap = await getDocs(collection(db, "payments"));
      const paymentsList = paymentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const collected = paymentsList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      const expectedTotal = studentsList.reduce(
        (sum, s) => sum + (Number(s.monthlyFee) || 0),
        0
      );

      setFeeStats({
        total: expectedTotal,
        collected,
        pending: Math.max(expectedTotal - collected, 0),
      });
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

  // Overview chart: real student registrations for the current month, grouped
  // by week, using each student's actual createdAt timestamp.
  const overviewData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthLabel = now.toLocaleDateString("en-GB", { month: "short" });
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Build week buckets: 1-7, 8-14, 15-21, 22-28, 29-end
    const weekStarts = [1, 8, 15, 22, 29].filter((d) => d <= daysInMonth);
    const buckets = weekStarts.map((start, i) => {
      const end = i + 1 < weekStarts.length ? weekStarts[i + 1] - 1 : daysInMonth;
      return { start, end, label: `${monthLabel} ${start}` };
    });

    const withDates = students.filter((s) => s.createdAt?.seconds);

    let running = 0;
    return buckets.map((b) => {
      const count = withDates.filter((s) => {
        const d = new Date(s.createdAt.seconds * 1000);
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() >= b.start && d.getDate() <= b.end;
      }).length;
      running += count;
      return { day: b.label, value: running };
    });
  }, [students]);

  const feePercent =
    feeStats.total > 0 ? Math.round((feeStats.collected / feeStats.total) * 100) : 0;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F3F4F8",
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
              <h1 style={{ margin: 0, fontSize: 20, color: "#111827", fontWeight: 700 }}>
                Guudmarka Iskuulka
              </h1>
              <p style={{ margin: "4px 0 0", color: "#9CA3AF", fontSize: 13.5 }}>
                {today}
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/messages")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 20px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg,#6D5DF0,#8B5CF6)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13.5,
                cursor: "pointer",
                boxShadow: "0 8px 18px rgba(109,93,240,0.3)",
              }}
            >
              <Send size={16} />
              Send Message
            </button>
          </div>

          {/* Stat cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: 24,
            }}
          >
            <DashboardCard
              title="Students"
              value={loading ? "..." : students.length}
              icon="🎓"
              color="#6D5DF0"
              percent={growth.students !== null ? `${growth.students}%` : null}
            />
            <DashboardCard
              title="Teachers"
              value={loading ? "..." : teachersCount}
              icon="🧑‍🏫"
              color="#f59e0b"
              percent={growth.teachers !== null ? `${growth.teachers}%` : null}
            />
            <DashboardCard
              title="Cashiers"
              value={loading ? "..." : cashiersCount}
              icon="💰"
              color="#0ea5e9"
              percent={growth.cashiers !== null ? `${growth.cashiers}%` : null}
            />
            <DashboardCard
              title="Parents"
              value={loading ? "..." : parentsCount}
              icon="👨‍👩‍👧"
              color="#22c55e"
              percent={growth.parents !== null ? `${growth.parents}%` : null}
            />
            <DashboardCard
              title="Classes"
              value={loading ? "..." : classesCount}
              icon="🏫"
              color="#ec4899"
              percent={growth.classes !== null ? `${growth.classes}%` : null}
            />
          </div>

          {/* Overview + Fee Collection */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr",
              gap: 20,
              marginBottom: 24,
            }}
            className="dash-row"
          >
            {/* Overview chart */}
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: "22px 24px",
                boxShadow: "0 4px 18px rgba(17,24,39,0.06)",
                border: "1px solid rgba(17,24,39,0.05)",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <h3 style={{ margin: 0, fontSize: 16, color: "#111827", fontWeight: 700 }}>
                  Overview
                </h3>
                <span style={{ fontSize: 12.5, color: "#6D5DF0", fontWeight: 600 }}>
                  This Month
                </span>
              </div>

              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={overviewData}>
                    <CartesianGrid stroke="#F0F0F5" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: "#9CA3AF" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#9CA3AF" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#6D5DF0"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#6D5DF0" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Fee Collection */}
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: "22px 24px",
                boxShadow: "0 4px 18px rgba(17,24,39,0.06)",
                border: "1px solid rgba(17,24,39,0.05)",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <h3 style={{ margin: 0, fontSize: 16, color: "#111827", fontWeight: 700 }}>
                  Fee Collection
                </h3>
                <span style={{ fontSize: 12.5, color: "#6D5DF0", fontWeight: 600 }}>
                  This Month
                </span>
              </div>

              <div style={{ height: 160, position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Collected", value: feeStats.collected || 1 },
                        { name: "Pending", value: feeStats.pending || 0 },
                      ]}
                      innerRadius={55}
                      outerRadius={72}
                      paddingAngle={2}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill="#6D5DF0" />
                      <Cell fill="#EDE9FE" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#111827" }}>
                    {feePercent}%
                  </div>
                  <div style={{ fontSize: 11.5, color: "#9CA3AF" }}>Collected</div>
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                {[
                  { label: "Total Fees", value: feeStats.total, color: "#6D5DF0" },
                  { label: "Collected", value: feeStats.collected, color: "#22c55e" },
                  { label: "Pending", value: feeStats.pending, color: "#ef4444" },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#6B7280" }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: row.color,
                          display: "inline-block",
                        }}
                      />
                      {row.label}
                    </span>
                    <span style={{ fontWeight: 700, color: "#111827" }}>
                      ${row.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Students by Class + Banner */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
            }}
            className="dash-row"
          >
            {/* Students by Class */}
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: "22px 24px",
                boxShadow: "0 4px 18px rgba(17,24,39,0.06)",
                border: "1px solid rgba(17,24,39,0.05)",
                minWidth: 0,
              }}
            >
              <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "#111827", fontWeight: 700 }}>
                Students by Class
              </h3>

              {classBreakdown.length === 0 && !loading && (
                <p style={{ fontSize: 13, color: "#9CA3AF" }}>Fasallo lama helin.</p>
              )}

              {classBreakdown.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div style={{ width: 140, height: 140, position: "relative", flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={classBreakdown}
                          innerRadius={42}
                          outerRadius={68}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {classBreakdown.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%,-50%)",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#111827" }}>
                        {students.length}
                      </div>
                      <div style={{ fontSize: 10.5, color: "#9CA3AF" }}>Total</div>
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {classBreakdown.map((entry) => (
                      <div
                        key={entry.name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: 13,
                          marginBottom: 8,
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#6B7280" }}>
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: entry.color,
                              display: "inline-block",
                            }}
                          />
                          {entry.name}
                        </span>
                        <span style={{ fontWeight: 700, color: "#111827" }}>{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Banner */}
            <div
              style={{
                background: "linear-gradient(160deg,#6D5DF0,#8B5CF6)",
                borderRadius: 18,
                padding: "26px 24px",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minWidth: 0,
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800 }}>
                  Let's make this year amazing! 🚀
                </h3>
                <p style={{ margin: 0, fontSize: 13.5, opacity: 0.9, lineHeight: 1.5 }}>
                  Stay organized and keep your school running smoothly.
                </p>
              </div>
              <div style={{ fontSize: 48, textAlign: "center", marginTop: 20 }}>🏫</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .dash-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}