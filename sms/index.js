//sms/index.js
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { setGlobalOptions } = require("firebase-functions");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit.
setGlobalOptions({ maxInstances: 10 });

// ============================================================
// SEND SMS — Hormuud SMS API (sendBulkSms)
// ============================================================
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const axios = require("axios");
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

const HORMUUD_USERNAME = defineSecret("HORMUUD_USERNAME");
const HORMUUD_PASSWORD = defineSecret("HORMUUD_PASSWORD");
const HORMUUD_SENDERID = defineSecret("HORMUUD_SENDERID");

const TOKEN_URL = "https://smsapi.hormuud.com/token";
const SEND_URL = "https://smsapi.hormuud.com/api/SendSMS";

async function getHormuudToken(username, password) {
  const payload = new URLSearchParams();
  payload.append("grant_type", "password");
  payload.append("username", username);
  payload.append("password", password);

  const res = await axios.post(TOKEN_URL, payload.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!res.data || !res.data.access_token) {
    throw new Error("Ma helin token Hormuud (access_token) — hubi username/password.");
  }
  return res.data.access_token;
}

async function sendOneSms(token, mobile, message, senderid) {
  try {
    const res = await axios.post(
      SEND_URL,
      {
        refid: "0",
        mobile,
        message,
        senderid: senderid || "RESING",
        validity: 0,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const code = res.data?.ResponseCode || res.data?.Data?.ResponseCode;
    const ok = String(code) === "200" || res.status === 200;
    return {
      mobile,
      success: ok,
      responseCode: code || String(res.status),
      message: res.data?.ResponseMessage || "Sent",
    };
  } catch (err) {
    return {
      mobile,
      success: false,
      responseCode: err.response?.data?.ResponseCode || "ERROR",
      message: err.response?.data?.ResponseMessage || err.message,
    };
  }
}

function cleanPhone(raw) {
  if (!raw) return null;
  const cleaned = String(raw).trim().replace(/[\s-]/g, "").replace(/^\+/, "");
  return cleaned || null;
}

async function resolveRecipients(audience, targetId) {
  const recipients = [];

  if (audience === "all_parents") {
    const snap = await db.collection("students").get();
    const seen = new Set();
    snap.forEach((doc) => {
      const d = doc.data();
      const phone = cleanPhone(d.parentPhone);
      if (phone && !seen.has(phone)) {
        seen.add(phone);
        recipients.push({ phone, label: `Parent of ${d.fullName || doc.id}` });
      }
    });
  }

  if (audience === "one_parent" && targetId) {
    const doc = await db.collection("students").doc(targetId).get();
    if (doc.exists) {
      const d = doc.data();
      const phone = cleanPhone(d.parentPhone);
      if (phone) recipients.push({ phone, label: `Parent of ${d.fullName || doc.id}` });
    }
  }

  if (audience === "all_teachers" || audience === "one_teacher") {
    const snap = audience === "one_teacher" && targetId
      ? [await db.collection("teachers").doc(targetId).get()]
      : (await db.collection("teachers").get()).docs;

    snap.forEach((doc) => {
      if (!doc.exists) return;
      const d = doc.data();
      const phone = cleanPhone(d.phone || d.teacherPhone || d.mobile);
      if (phone) recipients.push({ phone, label: d.fullName || doc.id });
    });
  }

  if (audience === "all_students" || audience === "one_student") {
    const snap = audience === "one_student" && targetId
      ? [await db.collection("students").doc(targetId).get()]
      : (await db.collection("students").get()).docs;

    snap.forEach((doc) => {
      if (!doc.exists) return;
      const d = doc.data();
      const phone = cleanPhone(d.studentPhone);
      if (phone) recipients.push({ phone, label: d.fullName || doc.id });
    });
  }

  const uniqueMap = new Map();
  recipients.forEach((r) => {
    if (!uniqueMap.has(r.phone)) uniqueMap.set(r.phone, r);
  });
  return Array.from(uniqueMap.values());
}

exports.sendBulkSms = onCall(
  {
    secrets: [HORMUUD_USERNAME, HORMUUD_PASSWORD, HORMUUD_SENDERID],
    region: "us-central1",
  },
  async (request) => {
    const { audience, targetId, message } = request.data || {};

    if (!audience) {
      throw new HttpsError("invalid-argument", "Fadlan dooro audience-ka (parents/teachers/students).");
    }
    if (!message || !message.trim()) {
      throw new HttpsError("invalid-argument", "Fariinta (message) waa faaruq.");
    }

    const recipients = await resolveRecipients(audience, targetId);

    if (recipients.length === 0) {
      throw new HttpsError(
        "not-found",
        "Lambar telefoon lama helin dadka la doortay (hubi in Firestore uu leeyahay taleefanno sax ah)."
      );
    }

    const token = await getHormuudToken(
      HORMUUD_USERNAME.value(),
      HORMUUD_PASSWORD.value()
    );
    const senderid = HORMUUD_SENDERID.value();

    const results = [];
    for (const r of recipients) {
      // eslint-disable-next-line no-await-in-loop
      const result = await sendOneSms(token, r.phone, message.trim(), senderid);
      results.push({ ...result, label: r.label });
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.length - successCount;

    return {
      total: results.length,
      successCount,
      failCount,
      results,
    };
  }
);