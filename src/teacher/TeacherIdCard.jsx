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
  tagline: "Teaching Today, Transforming Tomorrow",
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
        gap: 34px;
        justify-content: center;
        padding: 24px 0;
      }

      .tidc-card-outer {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0;
      }

      .tidc-side-label {
        background: #14532d;
        color: #fff;
        font-weight: 800;
        font-size: 13px;
        letter-spacing: 2px;
        padding: 6px 26px;
        border-radius: 8px;
        margin-bottom: -14px;
        z-index: 3;
        position: relative;
        box-shadow: 0 4px 10px rgba(20,83,45,0.3);
      }

      .tidc-card {
        width: 400px;
        max-width: 100%;
        aspect-ratio: 640 / 760;
        border-radius: 22px;
        overflow: hidden;
        position: relative;
        background: #ffffff;
        box-shadow: 0 18px 44px rgba(0,0,0,0.28);
        font-family: 'Poppins','Inter','Segoe UI',system-ui,sans-serif;
        display: flex;
        flex-direction: column;
        border: 1px solid #eef1ee;
      }

      .tidc-band-top {
        position: absolute;
        top: 0; left: 0; right: 0;
        z-index: 0;
      }
      .tidc-band-bottom {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        z-index: 0;
      }
      .tidc-band-top svg, .tidc-band-bottom svg { display: block; width: 100%; }

      .tidc-header {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 26px 22px 6px;
      }
      .tidc-logo-badge {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: #fff;
        border: 2.5px solid #1c6b3a;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        position: relative;
        overflow: hidden;
      }
      .tidc-logo-ring {
        position: absolute;
        inset: 3px;
        border-radius: 50%;
        border: 1px solid #cfe0d3;
      }
      .tidc-logo-emoji { font-size: 22px; }
      .tidc-school-block { line-height: 1.08; padding-top: 2px; }
      .tidc-school-name1 {
        font-size: 20px;
        font-weight: 800;
        color: #14532d;
        letter-spacing: 0.3px;
      }
      .tidc-school-name2 {
        font-size: 16px;
        font-weight: 700;
        color: #16202b;
        letter-spacing: 3px;
      }
      .tidc-school-underline {
        width: 46px;
        height: 2px;
        background: #f5a623;
        margin: 4px 0 4px;
        border-radius: 2px;
      }
      .tidc-school-tag {
        font-size: 9px;
        font-weight: 700;
        color: #e08b1d;
        letter-spacing: 0.3px;
      }

      .tidc-title-bar {
        position: relative;
        z-index: 2;
        margin: 14px 22px 14px;
        background: #14532d;
        border-radius: 8px;
        padding: 9px 16px;
        display: flex;
        align-items: baseline;
        gap: 7px;
        box-shadow: 0 6px 14px rgba(20,83,45,0.25);
      }
      .tidc-title-1 { color: #fff; font-weight: 700; font-size: 17px; letter-spacing: 1px; }
      .tidc-title-2 { color: #f5a623; font-weight: 800; font-size: 17px; letter-spacing: 1px; }

      .tidc-body {
        position: relative;
        z-index: 2;
        flex: 1;
        display: flex;
        padding: 0 22px;
        gap: 12px;
      }

      .tidc-fields {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: 11px;
        min-width: 0;
      }
      .tidc-field-row {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 12px;
      }
      .tidc-field-icon {
        width: 20px;
        height: 20px;
        border-radius: 6px;
        background: #1c6b3a;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        flex-shrink: 0;
      }
      .tidc-field-label {
        font-weight: 700;
        color: #16202b;
        min-width: 100px;
        letter-spacing: 0.2px;
        white-space: nowrap;
        font-size: 11px;
        flex-shrink: 0;
        padding-top: 1px;
      }
      .tidc-field-colon { color: #16202b; font-weight: 700; flex-shrink: 0; padding-top: 1px; }
      .tidc-field-value {
        font-weight: 700;
        color: #1c6b3a;
        overflow-wrap: break-word;
        word-break: break-word;
        white-space: normal;
        line-height: 1.25;
        min-width: 0;
      }

      .tidc-photo-wrap {
        width: 92px;
        flex-shrink: 0;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 2px;
      }
      .tidc-photo {
        width: 90px;
        height: 108px;
        object-fit: cover;
        border-radius: 8px;
        border: 3px solid #1c6b3a;
        background: #eef3ee;
      }
      .tidc-photo-placeholder {
        width: 90px;
        height: 108px;
        border-radius: 8px;
        border: 2px dashed #9db8a4;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 9.5px;
        color: #6b8a73;
        text-align: center;
        padding: 4px;
      }

      .tidc-footer {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        padding: 10px 18px 6px;
        margin-top: auto;
      }
      .tidc-qr {
        width: 54px;
        height: 54px;
        background: #fff;
        border: 1px solid #d8e3da;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3px;
      }
      .tidc-qr img { width: 100%; height: 100%; }
      .tidc-qr-caption {
        font-size: 7.5px;
        font-weight: 700;
        color: #14532d;
        letter-spacing: 0.3px;
        text-align: center;
      }

      .tidc-slogan {
        position: relative;
        z-index: 2;
        text-align: center;
        color: #fff;
        font-weight: 700;
        font-size: 12px;
        font-style: italic;
        padding-bottom: 14px;
      }

      /* ---------- BACK ---------- */
      .tidc-back-content {
        position: relative;
        z-index: 2;
        padding: 24px 24px 0;
        flex: 1;
      }
      .tidc-back-header {
        display: flex;
        justify-content: center;
        margin-bottom: 14px;
      }
      .tidc-back-logo {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #fff;
        border: 2.5px solid #1c6b3a;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      }
      .tidc-section-bar {
        background: #14532d;
        color: #fff;
        font-weight: 800;
        font-size: 13px;
        letter-spacing: 0.5px;
        text-align: center;
        border-radius: 8px;
        padding: 8px 12px;
        margin-bottom: 10px;
        box-shadow: 0 6px 14px rgba(20,83,45,0.2);
      }
      .tidc-terms-list {
        list-style: none;
        margin: 0 0 16px;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .tidc-terms-list li {
        font-size: 10.5px;
        color: #16202b;
        display: flex;
        gap: 7px;
        align-items: flex-start;
        line-height: 1.4;
      }
      .tidc-terms-check {
        color: #fff;
        background: #1c6b3a;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        font-size: 8px;
        font-weight: 800;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 1px;
      }

      .tidc-emergency-block {
        background: rgba(28,107,58,0.06);
        border-radius: 10px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 10px;
      }
      .tidc-emergency-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 10.5px;
        color: #16202b;
      }
      .tidc-emergency-icon {
        width: 18px; height: 18px;
        border-radius: 5px;
        background: #1c6b3a;
        color: #fff;
        display: flex; align-items: center; justify-content: center;
        font-size: 9px;
        flex-shrink: 0;
      }
      .tidc-emergency-label { font-weight: 700; min-width: 90px; letter-spacing: 0.2px; }

      .tidc-back-qr-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        position: relative;
        z-index: 2;
        margin-top: 4px;
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

// Circular school badge — laurel-wreath style crest to match the
// reference logo (open book + sunrise + wreath), drawn in pure SVG so it
// renders crisply at any size without needing an uploaded image asset.
function SchoolCrest({ size = 40 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <circle cx="50" cy="50" r="47" fill="#ffffff" stroke="#1c6b3a" strokeWidth="2" />
      {/* laurel wreath */}
      <g stroke="#1c6b3a" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M18,58 C14,44 20,28 32,20" />
        <path d="M82,58 C86,44 80,28 68,20" />
      </g>
      <g fill="#1c6b3a">
        <ellipse cx="18" cy="58" rx="3" ry="5" transform="rotate(-30 18 58)" />
        <ellipse cx="15" cy="48" rx="3" ry="5" transform="rotate(-15 15 48)" />
        <ellipse cx="14" cy="38" rx="3" ry="5" transform="rotate(0 14 38)" />
        <ellipse cx="18" cy="28" rx="3" ry="5" transform="rotate(20 18 28)" />
        <ellipse cx="25" cy="22" rx="3" ry="5" transform="rotate(40 25 22)" />

        <ellipse cx="82" cy="58" rx="3" ry="5" transform="rotate(30 82 58)" />
        <ellipse cx="85" cy="48" rx="3" ry="5" transform="rotate(15 85 48)" />
        <ellipse cx="86" cy="38" rx="3" ry="5" transform="rotate(0 86 38)" />
        <ellipse cx="82" cy="28" rx="3" ry="5" transform="rotate(-20 82 28)" />
        <ellipse cx="75" cy="22" rx="3" ry="5" transform="rotate(-40 75 22)" />
      </g>
      {/* sunrise */}
      <path d="M30,52 A20,20 0 0 1 70,52 Z" fill="#f5a623" />
      <g stroke="#f5a623" strokeWidth="2.5" strokeLinecap="round">
        <line x1="50" y1="20" x2="50" y2="27" />
        <line x1="34" y1="26" x2="38" y2="31" />
        <line x1="66" y1="26" x2="62" y2="31" />
      </g>
      {/* open book */}
      <path d="M32,58 L50,54 L68,58 L68,66 L50,62 L32,66 Z" fill="#14532d" />
      <line x1="50" y1="54" x2="50" y2="62" stroke="#ffffff" strokeWidth="1.2" />
      {/* star */}
      <path
        d="M50,68 l1.6,3.4 3.7,0.5 -2.7,2.6 0.6,3.7 -3.2,-1.7 -3.2,1.7 0.6,-3.7 -2.7,-2.6 3.7,-0.5 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

function BandTop() {
  return (
    <svg viewBox="0 0 400 46" preserveAspectRatio="none">
      <path d="M0,0 H400 V14 C300,32 260,4 200,18 C140,32 100,8 0,20 Z" fill="#f5a623" />
      <path d="M0,0 H400 V6 C300,22 260,-2 200,10 C140,22 100,0 0,12 Z" fill="#14532d" />
    </svg>
  );
}

function BandBottom() {
  return (
    <svg viewBox="0 0 400 70" preserveAspectRatio="none">
      <path d="M0,70 H400 V26 C300,4 260,40 200,22 C140,4 100,32 0,16 Z" fill="#f5a623" />
      <path d="M0,70 H400 V38 C300,18 260,50 200,34 C140,18 100,44 0,30 Z" fill="#14532d" />
    </svg>
  );
}

function CardFront({ teacher, teacherUsername }) {
  const joined = formatDate(teacher?.createdAt);
  const subjectText = Array.isArray(teacher?.subjects)
    ? teacher.subjects.join(", ")
    : teacher?.subject || "—";

  // Firestore stores the mother's name under a few possible keys
  // depending on how the record was created ("matherName" is a typo
  // that exists in some older documents, "parentName" is used in
  // others). Fall back through all of them so the card always shows
  // the real value instead of "—".
  const motherNameText =
    teacher?.motherName || teacher?.matherName || teacher?.parentName || "—";

  // Show the teacher's complete name — never truncate it. If it's
  // stored as separate first/last fields, join them; otherwise fall
  // back to fullName / name as-is.
  const fullNameText =
    teacher?.fullName ||
    teacher?.name ||
    [teacher?.firstName, teacher?.lastName].filter(Boolean).join(" ") ||
    "—";

  const qrValue = encodeURIComponent(`https://${SCHOOL.website}`);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&data=${qrValue}`;

  return (
    <div className="tidc-card-outer">
      <span className="tidc-side-label">FRONT</span>
      <div className="tidc-card" id="tidc-print-front">
        <div className="tidc-band-top"><BandTop /></div>

        <div className="tidc-header">
          <div className="tidc-logo-badge">
            <div className="tidc-logo-ring" />
            <SchoolCrest size={40} />
          </div>
          <div className="tidc-school-block">
            <div className="tidc-school-name1">{SCHOOL.name1}</div>
            <div className="tidc-school-name2">{SCHOOL.name2}</div>
            <div className="tidc-school-underline" />
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
              <span className="tidc-field-value">{fullNameText}</span>
            </div>
            <div className="tidc-field-row">
              <span className="tidc-field-icon">👥</span>
              <span className="tidc-field-label">MOTHER'S NAME</span>
              <span className="tidc-field-colon">:</span>
              <span className="tidc-field-value">{motherNameText}</span>
            </div>
            <div className="tidc-field-row">
              <span className="tidc-field-icon">📞</span>
              <span className="tidc-field-label">PHONE NUMBER</span>
              <span className="tidc-field-colon">:</span>
              <span className="tidc-field-value">{teacher?.phone || teacher?.phoneNumber || "—"}</span>
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
              <img className="tidc-photo" src={teacher.teacherPhoto} alt={fullNameText} />
            ) : (
              <div className="tidc-photo-placeholder">No Photo</div>
            )}
          </div>
        </div>

        <div className="tidc-footer">
          <div className="tidc-qr">
            <img src={qrSrc} alt="QR code" />
          </div>
          <div className="tidc-qr-caption">
            SCAN TO VISIT
            <br />
            {SCHOOL.website}
          </div>
        </div>

        <div className="tidc-band-bottom"><BandBottom /></div>
        <div className="tidc-slogan">"Shaping Bright Futures"</div>
      </div>
    </div>
  );
}

function CardBack() {
  const qrValue = encodeURIComponent(`https://${SCHOOL.website}`);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&margin=0&data=${qrValue}`;

  return (
    <div className="tidc-card-outer">
      <span className="tidc-side-label">BACK</span>
      <div className="tidc-card" id="tidc-print-back">
        <div className="tidc-band-top"><BandTop /></div>

        <div className="tidc-back-content">
          <div className="tidc-back-header">
            <div className="tidc-back-logo">
              <SchoolCrest size={34} />
            </div>
          </div>

          <div className="tidc-section-bar">TERMS &amp; CONDITIONS</div>
          <ul className="tidc-terms-list">
            <li><span className="tidc-terms-check">✔</span> This ID card is the property of Rising Star School.</li>
            <li><span className="tidc-terms-check">✔</span> This card is issued for official identification only.</li>
            <li><span className="tidc-terms-check">✔</span> This card is non-transferable and must be surrendered upon request.</li>
            <li><span className="tidc-terms-check">✔</span> If found, please return it to the school administration.</li>
          </ul>

          <div className="tidc-section-bar">IN CASE OF EMERGENCY</div>
          <div className="tidc-emergency-block">
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
            <div className="tidc-qr-caption">
              SCAN TO VISIT
              <br />
              {SCHOOL.website}
            </div>
          </div>
        </div>

        <div className="tidc-band-bottom"><BandBottom /></div>
        <div className="tidc-slogan">"Excellence Today, Leaders Tomorrow"</div>
      </div>
    </div>
  );
}

export default function TeacherIdCard({ teacher, teacherUsername }) {
  const joined = formatDate(teacher?.createdAt);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=900,height=650");
    if (!printWindow) return;

    const frontEl = document.getElementById("tidc-print-front");
    const backEl = document.getElementById("tidc-print-back");
    if (!frontEl || !backEl) return;

    const frontHtml = frontEl.outerHTML;
    const backHtml = backEl.outerHTML;

    // Grab only the card's own <style> block (rendered by <CardStyles/>),
    // not every style tag on the host page — prevents unrelated app
    // styles from leaking into the print window.
    const cardStyleTag = document.querySelector("style");
    const stylesHtml = cardStyleTag ? cardStyleTag.outerHTML : "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Teacher ID Card - ${teacher?.fullName || teacherUsername}</title>
          <meta charset="utf-8" />
          ${stylesHtml}
          <style>
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
            body {
              margin: 0;
              padding: 24px;
              display: flex;
              gap: 24px;
              flex-wrap: wrap;
              justify-content: center;
              background: #eee;
              font-family: sans-serif;
            }
            .tidc-card { box-shadow: 0 4px 14px rgba(0,0,0,0.2); }
            @media print {
              body { background: #fff; padding: 0; }
              .tidc-card-outer { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${frontHtml}
          ${backHtml}
        </body>
      </html>
    `);
    printWindow.document.close();

    // Wait for every image (teacher photo + both QR codes) to finish
    // loading before triggering print — otherwise the browser can print
    // a blank box where the QR or photo should be.
    const waitForImages = () => {
      const imgs = Array.from(printWindow.document.images);
      const pending = imgs.filter((img) => !img.complete);
      if (pending.length === 0) {
        printWindow.focus();
        printWindow.print();
        return;
      }
      let remaining = pending.length;
      pending.forEach((img) => {
        const done = () => {
          remaining -= 1;
          if (remaining === 0) {
            printWindow.focus();
            printWindow.print();
          }
        };
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });
    };

    setTimeout(waitForImages, 50);
  };

  return (
    <div>
      <CardStyles />

      <div className="tidc-wrap">
        <CardFront teacher={teacher} teacherUsername={teacherUsername} />
        <CardBack teacherUsername={teacherUsername} />
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