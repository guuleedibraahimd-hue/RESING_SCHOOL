import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { theme } from "./theme.js";

const currentMonthKey = () => new Date().toISOString().slice(0, 7); // e.g. "2026-07"

export default function Payments() {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState({});
  const [search, setSearch] = useState("");
  const [amounts, setAmounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const studentsSnap = await getDocs(collection(db, "cashier"));
      const studentData = studentsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setStudents(studentData);

      const paymentsSnap = await getDocs(collection(db, "payments"));
      const paymentMap = {};
      paymentsSnap.docs.forEach((d) => {
        paymentMap[d.id] = d.data();
      });
      setPayments(paymentMap);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter((s) => {
    const text = search.toLowerCase();

    return (
      (s.studentId || "").toLowerCase().includes(text) ||
      (s.studentName || "").toLowerCase().includes(text) ||
      (s.className || "").toLowerCase().includes(text)
    );
  });

  const isPaidThisMonth = (studentId) => {
    const record = payments[studentId];
    if (!record) return false;
    return record.monthKey === currentMonthKey() && record.status === "Paid";
  };

  const savePayment = async (student) => {
    const entered = Number(amounts[student.id] || 0);

    if (entered <= 0) {
      alert("Enter payment amount");
      return;
    }

    const fee = Number(student.monthlyFee || 0);
    const remaining = fee - entered;
    const status = remaining <= 0 ? "Paid" : "Not Paid";

    try {
      await setDoc(doc(db, "payments", student.studentId), {
        studentId: student.studentId,
        studentName: student.studentName,
        className: student.className || "",
        monthlyFee: fee,
        paidAmount: entered,
        remaining: remaining > 0 ? remaining : 0,
        status,
        monthKey: currentMonthKey(),
        studentPhone: student.studentPhone,
        parentPhone: student.parentPhone,
        createdAt: serverTimestamp(),
      });

      setPayments({
        ...payments,
        [student.studentId]: {
          status,
          monthKey: currentMonthKey(),
          paidAmount: entered,
          remaining: remaining > 0 ? remaining : 0,
        },
      });

      alert("Payment Saved: " + status);

      setAmounts({
        ...amounts,
        [student.id]: "",
      });
    } catch (err) {
      console.log(err);
      alert(err.message);
    }
  };

  return (
    <div style={{ fontFamily: theme.font.body }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>Student Payments</h1>
        <p style={styles.subtitle}>
          Record and track monthly fee payments per student
        </p>
      </header>

      <input
        placeholder="Search Student ID / Name / Class"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      <div style={styles.tableCard}>
        {loading ? (
          <p style={{ padding: 24, color: theme.colors.inkMuted }}>
            Loading students...
          </p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: 24, color: theme.colors.inkMuted }}>
            No students match your search.
          </p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Class</th>
                <th style={styles.th}>Student Phone</th>
                <th style={styles.th}>Parent Phone</th>
                <th style={styles.th}>Monthly Fee</th>
                <th style={styles.th}>Paid</th>
                <th style={styles.th}>Remaining</th>
                <th style={styles.th}>Enter Amount</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Save</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((student, i) => {
                const paidThisMonth = isPaidThisMonth(student.studentId);
                const record = payments[student.studentId];

                const entered = Number(amounts[student.id] || 0);
                const fee = Number(student.monthlyFee || 0);

                let displayPaid = paidThisMonth ? record.paidAmount : entered;
                let displayRemaining = paidThisMonth
                  ? record.remaining
                  : Math.max(fee - entered, 0);

                const status = paidThisMonth
                  ? "Paid"
                  : entered > 0
                  ? entered >= fee
                    ? "Paid"
                    : "Not Paid"
                  : "Not Paid";

                const isPaidStatus = status === "Paid";

                return (
                  <tr
                    key={student.id}
                    style={{
                      background: i % 2 === 0 ? "#FFFFFF" : "#FAFCFB",
                    }}
                  >
                    <td style={styles.td}>{student.studentId || "—"}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>
                      {student.studentName || "—"}
                    </td>
                    <td style={styles.td}>{student.className || "—"}</td>
                    <td style={styles.td}>{student.studentPhone || "—"}</td>
                    <td style={styles.td}>{student.parentPhone || "—"}</td>
                    <td style={{ ...styles.td, ...styles.money }}>${fee}</td>
                    <td style={{ ...styles.td, ...styles.money }}>
                      ${displayPaid}
                    </td>
                    <td style={{ ...styles.td, ...styles.money }}>
                      ${displayRemaining}
                    </td>
                    <td style={styles.td}>
                      <input
                        type="number"
                        disabled={paidThisMonth}
                        value={amounts[student.id] || ""}
                        onChange={(e) =>
                          setAmounts({
                            ...amounts,
                            [student.id]: e.target.value,
                          })
                        }
                        style={{
                          ...styles.amountInput,
                          background: paidThisMonth
                            ? "#F0F3F2"
                            : theme.colors.card,
                          color: theme.colors.ink,
                        }}
                      />
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          color: isPaidStatus
                            ? theme.colors.mintDark
                            : theme.colors.danger,
                          background: isPaidStatus
                            ? `${theme.colors.mint}1A`
                            : `${theme.colors.danger}14`,
                        }}
                      >
                        <span
                          style={{
                            ...styles.badgeDot,
                            background: isPaidStatus
                              ? theme.colors.mint
                              : theme.colors.danger,
                          }}
                        />
                        {status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => savePayment(student)}
                        disabled={paidThisMonth}
                        style={{
                          ...styles.saveBtn,
                          background: paidThisMonth
                            ? "#DDE4E2"
                            : theme.colors.mint,
                          color: paidThisMonth
                            ? theme.colors.inkMuted
                            : "#FFFFFF",
                          cursor: paidThisMonth ? "not-allowed" : "pointer",
                        }}
                      >
                        {paidThisMonth ? "Paid" : "Save"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  title: {
    fontFamily: theme.font.display,
    fontWeight: 800,
    fontSize: 26,
    color: theme.colors.ink,
    margin: 0,
  },
  subtitle: {
    color: theme.colors.inkMuted,
    fontSize: 14,
    marginTop: 6,
  },
  search: {
    width: 360,
    padding: "12px 16px",
    marginBottom: 20,
    borderRadius: theme.radius.sm,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.card,
    fontSize: 14,
    color: theme.colors.ink,
    outline: "none",
  },
  tableCard: {
    background: theme.colors.card,
    borderRadius: theme.radius.lg,
    boxShadow: theme.shadow.card,
    border: `1px solid ${theme.colors.border}`,
    overflow: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13.5,
  },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    background: theme.colors.brand,
    color: "#FFFFFF",
    fontWeight: 600,
    fontSize: 12.5,
    letterSpacing: 0.3,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px 16px",
    color: theme.colors.ink,
    borderBottom: `1px solid ${theme.colors.border}`,
    whiteSpace: "nowrap",
  },
  money: {
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
  },
  amountInput: {
    width: 90,
    padding: "8px 10px",
    borderRadius: theme.radius.sm,
    border: `1px solid ${theme.colors.border}`,
    fontSize: 13.5,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 12.5,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
  },
  saveBtn: {
    border: "none",
    padding: "9px 18px",
    borderRadius: theme.radius.sm,
    fontWeight: 700,
    fontSize: 13,
  },
};