// src/teacher/TeacherIdCard.jsx
// Renders the official Rising Star School Teacher ID card — front + back —
// matching the printed reference design exactly. Pulls all data straight
// from the teacher's own Firestore record (fullName, username, phone,
// subjects, createdAt, teacherPhoto). The "Teacher ID" shown on the card
// is the teacher's login username (e.g. "moodir1"), exactly as stored in
// Firestore doc id / username field — nothing is typed by the teacher.

const SCHOOL = {
  name1: "RISING STAR",
  name2: "SCHOOL",
  tagline: "Excellence Today, Leaders Tomorrow",
  phone: "+252 61 2345678",
  website: "resingstarschools.com",
  location: "Mogadishu, Somalia",
  noticeTell: "+252 61 7390261",
  noticeEmail: "risingstar0261@gmail.com",
};

function formatDate(d) {
  if (!d) return null;
  const dateObj = d?.seconds ? new Date(d.seconds * 1000) : new Date(d);
  if (isNaN(dateObj.getTime())) return null;
  const months = [
    "JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC",
  ];
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return { day, month, year, str: `${day} ${month} ${year}` };
}

function CardStyles() {
  return (
    <style>{`
      .tidc-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 28px;
        justify-content: center;
        padding: 24px 0;
      }

      .tidc-card {
        width: 420px;
        max-width: 100%;
        aspect-ratio: 800 / 560;
        border-radius: 18px;
        overflow: hidden;
        position: relative;
        background: #ffffff;
        box-shadow: 0 18px 44px rgba(0,0,0,0.35);
        font-family: 'Poppins','Inter','Segoe UI',system-ui,sans-serif;
        display: flex;
        flex-direction: column;
      }

      .tidc-wave-top {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 40%;
        overflow: hidden;
        z-index: 0;
      }
      .tidc-wave-bottom {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        height: 22%;
        overflow: hidden;
        z-index: 0;
      }
      .tidc-wave-top svg, .tidc-wave-bottom svg { width: 100%; height: 100%; }

      .tidc-header {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px 18px 4px;
      }
      .tidc-logo-badge {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #fff;
        border: 2px solid #1c6b3a;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 18px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      }
      .tidc-school-block { line-height: 1.05; padding-top: 2px; }
      .tidc-school-name1 {
        font-size: 19px;
        font-weight: 800;
        color: #14532d;
        letter-spacing: 0.3px;
      }
      .tidc-school-name2 {
        font-size: 15px;
        font-weight: 700;
        color: #16202b;
        letter-spacing: 3px;
      }
      .tidc-school-tag {
        font-size: 8.5px;
        font-weight: 700;
        color: #e08b1d;
        letter-spacing: 0.4px;
        margin-top: 2px;
      }

      .tidc-title-bar {
        position: relative;
        z-index: 2;
        margin: 6px 18px 10px;
        background: #14532d;
        border-radius: 6px;
        padding: 7px 14px;
        display: flex;
        align-items: baseline;
        gap: 6px;
      }
      .tidc-title-1 { color: #fff; font-weight: 700; font-size: 15px; letter-spacing: 1px; }
      .tidc-title-2 { color: #f5a623; font-weight: 800; font-size: 15px; letter-spacing: 1px; }

      .tidc-body {
        position: relative;
        z-index: 2;
        flex: 1;
        display: flex;
        padding: 0 18px;
        gap: 10px;
      }

      .tidc-fields {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: 8px;
        min-width: 0;
      }
      .tidc-field-row {
        display: flex;
        align-items: center;
        gap: 7px;
        font-size: 11px;
      }
      .tidc-field-icon {
        width: 17px;
        height: 17px;
        border-radius: 5px;
        background: #1c6b3a;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 9px;
        flex-shrink: 0;
      }
      .tidc-field-label {
        font-weight: 700;
        color: #16202b;
        min-width: 92px;
        letter-spacing: 0.2px;
        white-space: nowrap;
      }
      .tidc-field-colon { color: #16202b; font-weight: 700; }
      .tidc-field-value {
        font-weight: 700;
        color: #1c6b3a;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tidc-photo-wrap {
        width: 84px;
        flex-shrink: 0;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 2px;
      }
      .tidc-photo {
        width: 80px;
        height: 96px;
        object-fit: cover;
        border-radius: 8px;
        border: 3px solid #1c6b3a;
        background: #eef3ee;
      }
      .tidc-photo-placeholder {
        width: 80px;
        height: 96px;
        border-radius: 8px;
        border: 2px dashed #9db8a4;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 9px;
        color: #6b8a73;
        text-align: center;
        padding: 4px;
      }

      .tidc-footer {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px 18px 4px;
      }
      .tidc-qr {
        width: 44px;
        height: 44px;
        background: #fff;
        border: 1px solid #d8e3da;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2px;
      }
      .tidc-qr img { width: 100%; height: 100%; }

      .tidc-slogan {
        position: relative;
        z-index: 2;
        text-align: center;
        color: #fff;
        font-weight: 700;
        font-size: 11px;
        font-style: italic;
        padding-bottom: 10px;
      }

      /* ---------- BACK ---------- */
      .tidc-back-content {
        position: relative;
        z-index: 2;
        padding: 18px 20px 0;
        flex: 1;
      }
      .tidc-back-header {
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
      }
      .tidc-back-logo {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background: #fff;
        border: 2px solid #1c6b3a;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
      }
      .tidc-section-bar {
        background: #14532d;
        color: #fff;
        font-weight: 800;
        font-size: 12px;
        letter-spacing: 0.5px;
        text-align: center;
        border-radius: 6px;
        padding: 6px 10px;
        margin-bottom: 8px;
      }
      .tidc-terms-list {
        list-style: none;
        margin: 0 0 12px;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .tidc-terms-list li {
        font-size: 9.5px;
        color: #16202b;
        display: flex;
        gap: 6px;
        align-items: flex-start;
        line-height: 1.35;
      }
      .tidc-terms-check { color: #1c6b3a; font-weight: 800; flex-shrink: 0; }

      .tidc-emergency-rows { display: flex; flex-direction: column; gap: 5px; margin-bottom: 6px; }
      .tidc-emergency-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 9.5px;
        color: #16202b;
      }
      .tidc-emergency-icon {
        width: 15px; height: 15px;
        border-radius: 4px;
        background: #1c6b3a;
        color: #fff;
        display: flex; align-items: center; justify-content: center;
        font-size: 8px;
        flex-shrink: 0;
      }
      .tidc-emergency-label { font-weight: 700; min-width: 84px; }

      .tidc-back-qr-wrap {
        display: flex;
        justify-content: center;
        position: relative;
        z-index: 2;
        margin-top: 2px;
      }

      @media print {
        body { margin: 0; }
        .tidc-print-hide { display: none !important; }
        .tidc-wrap { gap: 0; padding: 0; }
        .tidc-card { box-shadow: none; page-break-inside: avoid; }
      }
    `}</style>
  );
}

function Wave({ variant }) {
  if (variant === "top") {
    return (
      <svg viewBox="0 0 420 220" preserveAspectRatio="none">
        <path d="M0,0 H420 V160 C320,200 260,130 180,160 C100,190 60,150 0,180 Z" fill="#14532d" />
        <path d="M0,0 H420 V172 C330,202 270,145 190,170 C110,195 60,162 0,188 Z" fill="#f5a623" opacity="0.9" />
        <path d="M0,0 H420 V184 C340,206 280,164 200,182 C120,200 70,172 0,196 Z" fill="#ffffff" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 420 120" preserveAspectRatio="none">
      <path d="M0,120 H420 V50 C320,20 260,80 180,55 C100,30 60,75 0,55 Z" fill="#ffffff" />
      <path d="M0,120 H420 V65 C330,38 270,90 190,68 C110,46 60,86 0,68 Z" fill="#f5a623" opacity="0.9" />
      <path d="M0,120 H420 V78 C340,52 280,100 200,80 C120,60 70,98 0,82 Z" fill="#14532d" />
    </svg>
  );
}

function CardFront({ teacher, teacherUsername }) {
  const joined = formatDate(teacher?.createdAt);
  const subjectText = Array.isArray(teacher?.subjects)
    ? teacher.subjects.join(", ")
    : teacher?.subject || "—";

  const qrValue = encodeURIComponent(
    `Rising Star School | Teacher ID: ${teacherUsername} | Name: ${teacher?.fullName || ""}`
  );
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&data=${qrValue}`;

  return (
    <div className="tidc-card">
      <div className="tidc-wave-top"><Wave variant="top" /></div>

      <div className="tidc-header">
        <div className="tidc-logo-badge">🎓</div>
        <div className="tidc-school-block">
          <div className="tidc-school-name1">{SCHOOL.name1}</div>
          <div className="tidc-school-name2">{SCHOOL.name2}</div>
          <div className="tidc-school-tag">{SCHOOL.tagline}</div>
        </div>
      </div>

      <div className="tidc-title-bar">
        <span className="tidc-title-1">TEACHER</span>
        <span className="tidc-title-2">ID CARD</span>
      </div>

      <div className="tidc-body">
        <div className="tidc-fields">
          <div className="tidc-field-row">
            <span className="tidc-field-icon">🪪</span>
            <span className="tidc-field-label">TEACHER ID</span>
            <span className="tidc-field-colon">:</span>
            <span className="tidc-field-value">{teacherUsername || "—"}</span>
          </div>
          <div className="tidc-field-row">
            <span className="tidc-field-icon">👤</span>
            <span className="tidc-field-label">TEACHER NAME</span>
            <span className="tidc-field-colon">:</span>
            <span className="tidc-field-value">{teacher?.fullName || "—"}</span>
          </div>
          <div className="tidc-field-row">
            <span className="tidc-field-icon">👥</span>
            <span className="tidc-field-label">FATHER'S NAME</span>
            <span className="tidc-field-colon">:</span>
            <span className="tidc-field-value">{teacher?.fatherName || "—"}</span>
          </div>
          <div className="tidc-field-row">
            <span className="tidc-field-icon">📞</span>
            <span className="tidc-field-label">PHONE NUMBER</span>
            <span className="tidc-field-colon">:</span>
            <span className="tidc-field-value">{teacher?.phone || "—"}</span>
          </div>
          <div className="tidc-field-row">
            <span className="tidc-field-icon">📘</span>
            <span className="tidc-field-label">SUBJECT</span>
            <span className="tidc-field-colon">:</span>
            <span className="tidc-field-value">{subjectText}</span>
          </div>
          <div className="tidc-field-row">
            <span className="tidc-field-icon">📅</span>
            <span className="tidc-field-label">DATE OF JOINING</span>
            <span className="tidc-field-colon">:</span>
            <span className="tidc-field-value">{joined?.str || "—"}</span>
          </div>
        </div>

        <div className="tidc-photo-wrap">
          {teacher?.teacherPhoto ? (
            <img className="tidc-photo" src={teacher.teacherPhoto} alt={teacher.fullName || "Teacher"} />
          ) : (
            <div className="tidc-photo-placeholder">No Photo</div>
          )}
        </div>
      </div>

      <div className="tidc-footer">
        <div className="tidc-qr">
          <img src={qrSrc} alt="QR code" />
        </div>
      </div>

      <div className="tidc-wave-bottom"><Wave variant="bottom" /></div>
      <div className="tidc-slogan">"Shaping Bright Futures"</div>
    </div>
  );
}

function CardBack({ teacherUsername }) {
  const qrValue = encodeURIComponent(SCHOOL.website);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&margin=0&data=${qrValue}`;

  return (
    <div className="tidc-card">
      <div className="tidc-wave-top" style={{ height: "20%" }}><Wave variant="top" /></div>

      <div className="tidc-back-content">
        <div className="tidc-back-header">
          <div className="tidc-back-logo">🎓</div>
        </div>

        <div className="tidc-section-bar">TERMS &amp; CONDITIONS</div>
        <ul className="tidc-terms-list">
          <li><span className="tidc-terms-check">✔</span> This ID card is the property of Rising Star School.</li>
          <li><span className="tidc-terms-check">✔</span> This card is issued for official identification only.</li>
          <li><span className="tidc-terms-check">✔</span> This card is non-transferable and must be surrendered upon request.</li>
          <li><span className="tidc-terms-check">✔</span> If found, please return it to the school administration.</li>
        </ul>

        <div className="tidc-section-bar">IN CASE OF EMERGENCY</div>
        <div className="tidc-emergency-rows">
          <div className="tidc-emergency-row">
            <span className="tidc-emergency-icon">📞</span>
            <span className="tidc-emergency-label">CONTACT NUMBER</span>
            <span>: {SCHOOL.noticeTell}</span>
          </div>
          <div className="tidc-emergency-row">
            <span className="tidc-emergency-icon">✉</span>
            <span className="tidc-emergency-label">EMAIL</span>
            <span>: {SCHOOL.noticeEmail}</span>
          </div>
          <div className="tidc-emergency-row">
            <span className="tidc-emergency-icon">🌐</span>
            <span className="tidc-emergency-label">WEBSITE</span>
            <span>: {SCHOOL.website}</span>
          </div>
          <div className="tidc-emergency-row">
            <span className="tidc-emergency-icon">📍</span>
            <span className="tidc-emergency-label">ADDRESS</span>
            <span>: {SCHOOL.location}</span>
          </div>
        </div>

        <div className="tidc-back-qr-wrap">
          <div className="tidc-qr">
            <img src={qrSrc} alt="QR code" />
          </div>
        </div>
      </div>

      <div className="tidc-wave-bottom"><Wave variant="bottom" /></div>
      <div className="tidc-slogan">"Excellence Today, Leaders Tomorrow"</div>
    </div>
  );
}

export default function TeacherIdCard({ teacher, teacherUsername }) {
  const joined = formatDate(teacher?.createdAt);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=900,height=650");
    if (!printWindow) return;

    const frontHtml = document.getElementById("tidc-print-front")?.outerHTML || "";
    const backHtml = document.getElementById("tidc-print-back")?.outerHTML || "";
    const stylesHtml = Array.from(document.querySelectorAll("style"))
      .map((s) => s.outerHTML)
      .join("\n");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Teacher ID Card - ${teacher?.fullName || teacherUsername}</title>
          <meta charset="utf-8" />
          ${stylesHtml}
          <style>
            body { margin: 0; padding: 24px; display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; background: #eee; font-family: sans-serif; }
            .tidc-card { box-shadow: 0 4px 14px rgba(0,0,0,0.2); }
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
    }, 400);
  };

  return (
    <div>
      <CardStyles />

      <div className="tidc-wrap">
        <div id="tidc-print-front">
          <CardFront teacher={teacher} teacherUsername={teacherUsername} />
        </div>
        <div id="tidc-print-back">
          <CardBack teacherUsername={teacherUsername} />
        </div>
      </div>

      <div className="tidc-print-hide" style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <button
          onClick={handlePrint}
          style={{
            background: "#14532d",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "12px 28px",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            boxShadow: "0 10px 24px rgba(20,83,45,0.35)",
          }}
        >
          🖨️ Print ID Card (Front &amp; Back)
        </button>
      </div>

      {joined?.str && (
        <div style={{ textAlign: "center", fontSize: 11, color: "#8b97b0", marginTop: 10 }}>
          Joined: {joined.str}
        </div>
      )}
    </div>
  );
}