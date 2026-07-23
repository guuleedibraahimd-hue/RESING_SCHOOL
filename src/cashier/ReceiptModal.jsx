import { useEffect, useRef, useState } from "react";
import {
  doc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { theme } from "./theme.js";

const SCHOOL_NAME = "Rising School";

// Sanad-dugsiyeedka: bisha 1-8 waxay ka tirsan yihiin sanadkii hore
// (Jan-Aug), bisha 9-12 waxay ka tirsan yihiin sanadka cusub (Sep-Dec).
// Tusaale: Luulyo 2026 -> "2025/2026", Sebtembar 2026 -> "2026/2027".
const academicYearLabel = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = dateObj.getMonth() + 1; // 1-12
  if (m >= 9) return `${y}/${y + 1}`;
  return `${y - 1}/${y}`;
};

// Waxay si atomic ah u kordhisaa Firestore counter-ka rasiidka
// (counters/receiptCounter) oo soo celisaa lambarka cusub, si aan
// laba rasiid isku lambar loo yeelin xitaa haddii labo cashier
// isku mar wax kaydiyaan.
const getNextReceiptNumber = async () => {
  const counterRef = doc(db, "counters", "receiptCounter");

  const nextNumber = await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    const current = counterDoc.exists() ? Number(counterDoc.data().value || 0) : 0;
    const next = current + 1;
    transaction.set(counterRef, { value: next }, { merge: true });
    return next;
  });

  return String(nextNumber).padStart(3, "0");
};

export default function ReceiptModal({ payment, onClose }) {
  const [receiptNo, setReceiptNo] = useState(null);
  const [loading, setLoading] = useState(true);
  const printedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const prepareReceipt = async () => {
      try {
        const no = await getNextReceiptNumber();
        if (cancelled) return;
        setReceiptNo(no);
      } catch (err) {
        console.log(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    prepareReceipt();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loading && receiptNo && !printedRef.current) {
      printedRef.current = true;
      // Yar oo timeout ah si DOM-ku u dhammaystiro rendering-ka
      // kahor intaan print dialog-ka la furin.
      const t = setTimeout(() => {
        window.print();
      }, 200);
      return () => clearTimeout(t);
    }
  }, [loading, receiptNo]);

  if (!payment) return null;

  const paidDate = payment.createdAt?.seconds
    ? new Date(payment.createdAt.seconds * 1000)
    : new Date();

  const dateStr = paidDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <div className="receipt-overlay">
        <div className="receipt-modal-actions no-print">
          <button onClick={onClose} className="receipt-close-btn">
            Xir
          </button>
          <button onClick={() => window.print()} className="receipt-print-btn">
            🖨️ Print
          </button>
        </div>

        <div className="receipt-paper">
          {loading ? (
            <p style={{ textAlign: "center", padding: 20, fontSize: 12 }}>
              Diyaarinaya rasiidka...
            </p>
          ) : (
            <>
              <div className="receipt-header">
                <div className="receipt-school">{SCHOOL_NAME}</div>
                <div className="receipt-sub">Payment Receipt</div>
              </div>

              <div className="receipt-line" />

              <div className="receipt-row">
                <span>No:</span>
                <span className="receipt-strong">{receiptNo}</span>
              </div>
              <div className="receipt-row">
                <span>Date:</span>
                <span>{dateStr}</span>
              </div>
              <div className="receipt-row">
                <span>Academic Year:</span>
                <span>{academicYearLabel(paidDate)}</span>
              </div>

              <div className="receipt-line" />

              <div className="receipt-row">
                <span>Student:</span>
                <span className="receipt-strong">{payment.studentName}</span>
              </div>
              <div className="receipt-row">
                <span>Class:</span>
                <span>{payment.className || "—"}</span>
              </div>
              <div className="receipt-row">
                <span>Month:</span>
                <span>{payment.monthLabel}</span>
              </div>

              <div className="receipt-line" />

              <div className="receipt-row receipt-amount">
                <span>Amount Paid:</span>
                <span className="receipt-strong">${payment.paidAmount}</span>
              </div>

              <div className="receipt-line" />

              <div className="receipt-footer">Mahadsanid!</div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .receipt-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.55);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          gap: 14px;
        }

        .receipt-modal-actions {
          display: flex;
          gap: 10px;
        }

        .receipt-close-btn, .receipt-print-btn {
          border: none;
          border-radius: 10px;
          padding: 10px 18px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
        }

        .receipt-close-btn {
          background: #ffffff;
          color: ${theme.colors.inkMuted};
          border: 1px solid ${theme.colors.border};
        }

        .receipt-print-btn {
          background: ${theme.colors.mint};
          color: #ffffff;
        }

        .receipt-paper {
          width: 302px;
          background: #ffffff;
          padding: 18px 16px;
          font-family: 'Courier New', monospace;
          color: #111827;
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        }

        .receipt-header {
          text-align: center;
          margin-bottom: 10px;
        }

        .receipt-school {
          font-weight: 800;
          font-size: 15px;
          letter-spacing: 0.5px;
        }

        .receipt-sub {
          font-size: 11px;
          color: #6B7280;
          margin-top: 2px;
        }

        .receipt-line {
          border-top: 1px dashed #9CA3AF;
          margin: 8px 0;
        }

        .receipt-row {
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
          margin-bottom: 4px;
        }

        .receipt-strong {
          font-weight: 700;
        }

        .receipt-amount {
          font-size: 14px;
        }

        .receipt-footer {
          text-align: center;
          font-size: 12px;
          margin-top: 10px;
          font-weight: 700;
        }

        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-paper, .receipt-paper * {
            visibility: visible;
          }
          .receipt-paper {
            position: absolute;
            top: 0;
            left: 0;
            box-shadow: none;
            width: 80mm;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>
    </>
  );
}