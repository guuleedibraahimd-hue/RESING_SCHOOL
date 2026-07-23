// src/student/StudentIdCard.jsx
//
// Renders the official Rising Star Primary & Secondary School Student ID
// card — front + back — matching fount.png / back.jpeg pixel-for-pixel:
//   - Front: 5-point star row (center star larger), two garland seals
//     (logo.png) flanking "RISING STAR / PRIMARY & SECONDARY SCHOOL",
//     italic tagline with diamond+rule flourishes, 4 field rows
//     (STUDENT ID, STUDENT NAME, CLASS, SHIFT) each with an underline,
//     student photo on the right in a gold-bordered rounded box, and a
//     green footer wave with ISSUE DATE / EXPIRE DATE + calendar icons
//     and the student ID repeated bottom-right.
//   - Back: green wave top, large "NB" between two gold rules, the red
//     notice line, Tell/Email/Web lines, green footer wave with the
//     "Admission & Student Affairs Office" bar.
//
// All student data (fullName, studentId, className, shift, studentPhoto,
// issueDate) comes from the student's own Firestore record — nothing is
// typed here except the fixed school branding text.
//
// On mount (and whenever the student's card-relevant fields change), this
// component also writes/updates a dedicated Firestore document at
// idCards/{studentId} — a separate collection from `students`, so every
// student's card has its own persistent, independently-queryable record
// (useful for admin ID-card lookups/reprints without touching the main
// students collection).

import { useEffect, useRef, useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

// Real logo image — the garland + open book + sun mark seal used on both
// sides of the school name. Point this at your actual asset (the same
// logo.png already in src/admin/assets).
import schoolLogo from "../admin/assets/logo.png";

const SCHOOL = {
  name1: "RISING STAR",
  name2: "PRIMARY & SECONDARY SCHOOL",
  tagline: "Education is life it self.",
  noticeBody:
    "If you accidently find this card, please contact the following address.",
  noticeTell: "+252-61 7390261",
  noticeEmail: "risingstar0261@gmail.com",
  noticeWeb: "resingstarschools.com",
  officeLabel: "Admission & Student Affairs Office",
};

function toDateObj(d) {
  if (!d) return null;
  const dateObj = d?.seconds ? new Date(d.seconds * 1000) : new Date(d);
  return isNaN(dateObj.getTime()) ? null : dateObj;
}

function formatDate(dateObj) {
  if (!dateObj) return null;
  const day = String(dateObj.getDate()).padStart(2, "0");
  const months = [
    "JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC",
  ];
  return `${day} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
}

function addYears(dateObj, years) {
  const d = new Date(dateObj.getTime());
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function CardStyles() {
  return (
    <style>{`
      .idc-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 28px;
        justify-content: center;
        padding: 24px 0;
      }

      .idc-card {
        width: 440px;
        max-width: 100%;
        aspect-ratio: 1011 / 639;
        border-radius: 16px;
        overflow: hidden;
        position: relative;
        background: #ffffff;
        box-shadow: 0 18px 44px rgba(0,0,0,0.28);
        font-family: 'Poppins','Inter','Segoe UI',system-ui,sans-serif;
      }

      /* ---------- FRONT ---------- */
      .idc-front {
        display: flex;
        flex-direction: column;
        padding: 18px 26px 0;
      }

      .idc-stars {
        text-align: center;
        color: #d99a2b;
        font-size: 16px;
        letter-spacing: 10px;
        margin-bottom: 4px;
      }
      .idc-stars .idc-star-big { font-size: 24px; color: #d99a2b; vertical-align: -3px; }

      .idc-front-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
      }

      .idc-seal {
        width: 78px;
        height: 78px;
        border-radius: 50%;
        flex-shrink: 0;
        overflow: hidden;
      }
      .idc-seal img { width: 100%; height: 100%; object-fit: contain; display: block; }

      .idc-school-block { text-align: center; line-height: 1.1; flex: 1; }
      .idc-school-name1 {
        font-size: 34px;
        font-weight: 800;
        color: #1c5a34;
        letter-spacing: 1px;
      }
      .idc-school-name2 {
        font-size: 14px;
        font-weight: 700;
        color: #16202b;
        letter-spacing: 2.5px;
        border-top: 2px solid #d99a2b;
        display: inline-block;
        padding-top: 4px;
        margin-top: 4px;
      }
      .idc-school-tag {
        font-size: 12px;
        font-weight: 500;
        font-style: italic;
        color: #16202b;
        margin-top: 8px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }
      .idc-school-tag .idc-tagdot { color: #d99a2b; font-size: 9px; }
      .idc-school-tag .idc-tagline-rule { flex: 1; max-width: 60px; height: 1px; background: #d99a2b; }

      .idc-front-body {
        flex: 1;
        display: flex;
        padding: 18px 0 0;
        gap: 16px;
      }

      .idc-fields {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 16px;
        min-width: 0;
      }
      .idc-field-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .idc-field-icon {
        width: 30px;
        height: 30px;
        border-radius: 7px;
        background: #1c5a34;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        flex-shrink: 0;
      }
      .idc-field-text {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: baseline;
        gap: 8px;
        font-size: 15px;
        border-bottom: 1.5px solid #d99a2b;
        padding-bottom: 6px;
      }
      .idc-field-label {
        font-weight: 800;
        color: #16202b;
        min-width: 108px;
        letter-spacing: 0.3px;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .idc-field-colon { color: #16202b; font-weight: 700; flex-shrink: 0; }
      .idc-field-value {
        font-weight: 800;
        color: #16202b;
        overflow-wrap: break-word;
        white-space: normal;
        line-height: 1.25;
      }

      .idc-photo-wrap {
        width: 148px;
        flex-shrink: 0;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 2px;
      }
      .idc-photo {
        width: 148px;
        height: 168px;
        object-fit: cover;
        border-radius: 12px;
        border: 3px solid #d99a2b;
        background: #eef3ee;
        display: block;
      }
      .idc-photo-placeholder {
        width: 148px;
        height: 168px;
        border-radius: 12px;
        border: 2px dashed #9db8a4;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        color: #6b8a73;
        text-align: center;
        padding: 4px;
      }

      .idc-front-footer {
        margin-top: auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 6px 16px;
        gap: 10px;
        position: relative;
        z-index: 2;
      }
      .idc-date-block { display: flex; align-items: center; gap: 10px; }
      .idc-date-icon {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 2px solid #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #fff;
        flex-shrink: 0;
      }
      .idc-date-label {
        font-weight: 800;
        color: #e9a92f;
        letter-spacing: 0.5px;
        font-size: 10.5px;
      }
      .idc-date-value {
        font-weight: 800;
        color: #fff;
        font-size: 13px;
        margin-top: 1px;
      }
      .idc-date-id {
        font-weight: 700;
        color: #fff;
        font-size: 10px;
        margin-top: 2px;
        text-align: right;
      }

      .idc-front-wave {
        height: 96px;
        position: relative;
        z-index: 1;
        margin: 10px -26px 0;
      }
      .idc-front-wave svg { width: 100%; height: 100%; display: block; }
      .idc-front-footer-abs {
        position: absolute;
        left: 26px;
        right: 26px;
        bottom: 14px;
        z-index: 3;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }

      /* ---------- BACK ---------- */
      .idc-back {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        color: #16202b;
        text-align: center;
      }
      .idc-back-wave-top, .idc-back-wave-bottom {
        position: relative;
        z-index: 1;
        height: 34px;
        overflow: hidden;
      }
      .idc-back-wave-top svg, .idc-back-wave-bottom svg {
        width: 100%; height: 100%; display: block;
      }

      .idc-back-content {
        position: relative;
        z-index: 2;
        padding: 30px 40px 0;
        flex: 1;
      }
      .idc-back-title {
        font-size: 34px;
        font-weight: 800;
        color: #1c5a34;
        margin-bottom: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 14px;
      }
      .idc-back-title .idc-diamond {
        color: #d99a2b;
        font-size: 13px;
      }
      .idc-back-title .idc-line {
        width: 46px;
        height: 2px;
        background: #d99a2b;
      }
      .idc-back-notice {
        font-size: 15px;
        font-weight: 700;
        color: #c0392b;
        line-height: 1.5;
        max-width: 360px;
        margin: 0 auto 18px;
      }
      .idc-back-line {
        font-size: 15px;
        font-weight: 700;
        margin: 7px 0;
        color: #16202b;
      }
      .idc-back-line b { color: #1c5a34; }

      .idc-back-footer-wrap {
        position: relative;
        z-index: 2;
        background: #1c5a34;
        padding: 12px 12px 14px;
      }
      .idc-back-footer {
        font-size: 14px;
        font-weight: 800;
        color: #fff;
        letter-spacing: 0.3px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }
      .idc-back-footer .idc-diamond { color: #d99a2b; font-size: 11px; }

      .idc-actions {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-top: 4px;
        flex-wrap: wrap;
      }
      .idc-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: none;
        border-radius: 10px;
        padding: 11px 24px;
        font-weight: 700;
        font-size: 13.5px;
        cursor: pointer;
      }
      .idc-btn:disabled { opacity: 0.6; cursor: default; }
      .idc-btn-print {
        background: #1c5a34;
        color: #fff;
        box-shadow: 0 10px 24px rgba(28,90,52,0.3);
      }
      .idc-btn-download {
        background: #d99a2b;
        color: #fff;
        box-shadow: 0 10px 24px rgba(217,154,43,0.3);
      }

      @media print {
        body { margin: 0; }
        .idc-print-hide { display: none !important; }
        .idc-wrap { gap: 0; padding: 0; }
        .idc-card { box-shadow: none; page-break-inside: avoid; }
      }
    `}</style>
  );
}

// Green wave with a gold band on top, matching the front card's bottom
// footer band in fount.png (issue/expire date sits inside this band).
function FrontWave() {
  return (
    <svg viewBox="0 0 1011 130" preserveAspectRatio="none">
      <path
        d="M0,130 H1011 V38 C860,4 760,58 610,40 C460,22 380,64 230,44 C130,30 60,50 0,36 Z"
        fill="#1c5a34"
      />
      <path
        d="M0,20 H1011 V10 C860,-6 760,16 610,8 C460,0 380,18 230,8 C130,2 60,10 0,6 Z"
        fill="#d99a2b"
      />
    </svg>
  );
}

function BackWaveTop() {
  return (
    <svg viewBox="0 0 1011 60" preserveAspectRatio="none">
      <path d="M0,0 H1011 V22 C820,50 700,10 500,26 C300,42 160,16 0,30 Z" fill="#1c5a34" />
      <path d="M0,0 H1011 V12 C830,32 710,4 510,16 C310,28 170,8 0,18 Z" fill="#d99a2b" />
    </svg>
  );
}

function BackWaveBottom() {
  return (
    <svg viewBox="0 0 1011 60" preserveAspectRatio="none">
      <path d="M0,60 H1011 V38 C820,10 700,50 500,34 C300,18 160,44 0,30 Z" fill="#d99a2b" />
      <path d="M0,60 H1011 V48 C830,28 710,56 510,44 C310,32 170,52 0,42 Z" fill="#1c5a34" />
    </svg>
  );
}

function SchoolSeal() {
  return (
    <div className="idc-seal">
      <img src={schoolLogo} alt="Rising Star Primary & Secondary School" />
    </div>
  );
}

function CardFront({ student, studentId, forwardRef }) {
  const shift = student?.shift || student?.classShift || "MORNING";

  // Issue date always comes from the student's own record.
  const issueDateObj =
    toDateObj(student?.issueDate) || toDateObj(student?.createdAt) || new Date();
  const issuedStr = formatDate(issueDateObj);

  // Expire date is ALWAYS issue date + 1 year, computed live — never a
  // separately stored field — so it's automatically correct.
  const expireStr = formatDate(addYears(issueDateObj, 1));

  return (
    <div className="idc-card idc-front" ref={forwardRef}>
      <div className="idc-stars">
        ★ ★ <span className="idc-star-big">★</span> ★ ★
      </div>

      <div className="idc-front-header">
        <SchoolSeal />
        <div className="idc-school-block">
          <div className="idc-school-name1">{SCHOOL.name1}</div>
          <div className="idc-school-name2">{SCHOOL.name2}</div>
        </div>
        <SchoolSeal />
      </div>
      <div className="idc-school-tag">
        <span className="idc-tagline-rule" />
        <span className="idc-tagdot">◆</span>
        {SCHOOL.tagline}
        <span className="idc-tagdot">◆</span>
        <span className="idc-tagline-rule" />
      </div>

      <div className="idc-front-body">
        <div className="idc-fields">
          <div className="idc-field-row">
            <span className="idc-field-icon">🪪</span>
            <span className="idc-field-text">
              <span className="idc-field-label">STUDENT ID</span>
              <span className="idc-field-colon">:</span>
              <span className="idc-field-value">{studentId || "—"}</span>
            </span>
          </div>
          <div className="idc-field-row">
            <span className="idc-field-icon">👤</span>
            <span className="idc-field-text">
              <span className="idc-field-label">STUDENT NAME</span>
              <span className="idc-field-colon">:</span>
              <span className="idc-field-value">{(student?.fullName || "—").toUpperCase()}</span>
            </span>
          </div>
          <div className="idc-field-row">
            <span className="idc-field-icon">🎓</span>
            <span className="idc-field-text">
              <span className="idc-field-label">CLASS</span>
              <span className="idc-field-colon">:</span>
              <span className="idc-field-value">{student?.className || "—"}</span>
            </span>
          </div>
          <div className="idc-field-row">
            <span className="idc-field-icon">🕒</span>
            <span className="idc-field-text">
              <span className="idc-field-label">SHIFT</span>
              <span className="idc-field-colon">:</span>
              <span className="idc-field-value">{String(shift).toUpperCase()}</span>
            </span>
          </div>
        </div>

        <div className="idc-photo-wrap">
          {student?.studentPhoto ? (
            // No crossOrigin here: Firebase Storage download URLs don't
            // need it to just display, and adding it can make the browser
            // refuse the image (blank/faded) unless the bucket's CORS
            // config explicitly allows anonymous cross-origin reads.
            <img
              className="idc-photo"
              src={student.studentPhoto}
              alt={student.fullName || "Student"}
            />
          ) : (
            <div className="idc-photo-placeholder">No Photo</div>
          )}
        </div>
      </div>

      <div className="idc-front-wave">
        <FrontWave />
      </div>
      <div className="idc-front-footer-abs">
        <div className="idc-date-block">
          <span className="idc-date-icon">📅</span>
          <div>
            <div className="idc-date-label">ISSUE DATE</div>
            <div className="idc-date-value">{issuedStr}</div>
          </div>
        </div>
        <div className="idc-date-block" style={{ flexDirection: "row-reverse" }}>
          <span className="idc-date-icon">📅</span>
          <div>
            <div className="idc-date-label">EXPIRE DATE</div>
            <div className="idc-date-value">{expireStr}</div>
            <div className="idc-date-id">{studentId || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardBack({ forwardRef }) {
  return (
    <div className="idc-card idc-back" ref={forwardRef}>
      <div className="idc-back-wave-top"><BackWaveTop /></div>

      <div className="idc-back-content">
        <div className="idc-back-title">
          <span className="idc-line" />
          <span className="idc-diamond">◆</span>
          NB
          <span className="idc-diamond">◆</span>
          <span className="idc-line" />
        </div>
        <div className="idc-back-notice">{SCHOOL.noticeBody}</div>
        <div className="idc-back-line"><b>Tell:</b> {SCHOOL.noticeTell}</div>
        <div className="idc-back-line"><b>Email:</b> {SCHOOL.noticeEmail}</div>
        <div className="idc-back-line"><b>Web:</b> {SCHOOL.noticeWeb}</div>
      </div>

      <div className="idc-back-wave-bottom"><BackWaveBottom /></div>
      <div className="idc-back-footer-wrap">
        <div className="idc-back-footer">
          <span className="idc-diamond">◆</span>
          {SCHOOL.officeLabel}
          <span className="idc-diamond">◆</span>
        </div>
      </div>
    </div>
  );
}

// Loads html2canvas from CDN once and caches the promise on window.
function loadHtml2Canvas() {
  if (window.__html2canvasPromise) return window.__html2canvasPromise;
  window.__html2canvasPromise = new Promise((resolve, reject) => {
    if (window.html2canvas) {
      resolve(window.html2canvas);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.onload = () => resolve(window.html2canvas);
    script.onerror = () => reject(new Error("Failed to load html2canvas"));
    document.body.appendChild(script);
  });
  return window.__html2canvasPromise;
}

export default function StudentIdCard({ student, studentId }) {
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Writes/updates this student's card into its OWN Firestore collection
  // (idCards), keyed by studentId, separate from the `students` collection.
  // Runs whenever the card-relevant fields change so the record always
  // reflects the current card contents (issue date is stored once and never
  // overwritten after that, so the 1-year expiry stays anchored correctly).
  useEffect(() => {
    if (!studentId || !student) return;

    const issueDateObj =
      toDateObj(student?.issueDate) || toDateObj(student?.createdAt) || new Date();

    const saveIdCardRecord = async () => {
      try {
        await setDoc(
          doc(db, "idCards", studentId),
          {
            studentId,
            fullName: student.fullName || "",
            className: student.className || "",
            shift: student.shift || student.classShift || "MORNING",
            studentPhoto: student.studentPhoto || "",
            issueDate: student.issueDate || issueDateObj,
            expireDate: addYears(issueDateObj, 1),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error("Failed to save idCards record:", err);
      }
    };

    saveIdCardRecord();
  }, [
    studentId,
    student?.fullName,
    student?.className,
    student?.shift,
    student?.classShift,
    student?.studentPhoto,
    student?.issueDate,
    student?.createdAt,
  ]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=900,height=650");
    if (!printWindow) {
      setError("Pop-up blocked. Please allow pop-ups for this site and try again.");
      return;
    }

    const frontHtml = frontRef.current?.outerHTML || "";
    const backHtml = backRef.current?.outerHTML || "";
    const stylesHtml = Array.from(document.querySelectorAll("style"))
      .map((s) => s.outerHTML)
      .join("\n");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student ID Card - ${student?.fullName || studentId}</title>
          <meta charset="utf-8" />
          ${stylesHtml}
          <style>
            body { margin: 0; padding: 24px; display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; background: #eee; font-family: sans-serif; }
            .idc-card { box-shadow: 0 4px 14px rgba(0,0,0,0.2); }
          </style>
        </head>
        <body>
          ${frontHtml}
          ${backHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleDownload = async () => {
    setError("");
    setBusy(true);
    try {
      const html2canvas = await loadHtml2Canvas();
      const namePart = (student?.fullName || studentId || "student")
        .toString()
        .trim()
        .replace(/\s+/g, "_");

      const renderAndSave = async (node, suffix) => {
        if (!node) return;
        const canvas = await html2canvas(node, {
          scale: 3,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
        const link = document.createElement("a");
        link.download = `${namePart}_ID_${suffix}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      };

      await renderAndSave(frontRef.current, "front");
      await renderAndSave(backRef.current, "back");
    } catch (err) {
      console.error(err);
      setError("Download failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <CardStyles />

      <div className="idc-wrap">
        <CardFront student={student} studentId={studentId} forwardRef={frontRef} />
        <CardBack forwardRef={backRef} />
      </div>

    </div>
  );
}