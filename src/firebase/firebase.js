// src/firebase/firebase-config.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

/* ===========================================================
   RISING STAR SCHOOL (NEW DATABASE)
=========================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyBXFegVGIyVk02zY6Ks3DhcoWjomNw_ht0",
  authDomain: "one-click-online.firebaseapp.com",
  projectId: "one-click-online",
  storageBucket: "one-click-online.firebasestorage.app",
  messagingSenderId: "988928725446",
  appId: "1:988928725446:web:64ce641d4da19b7643a2c7",
  measurementId: "G-PKTR17K6MX",
};

/* ===========================================================
   GALLAD STORAGE
=========================================================== */

const galladConfig = {
  apiKey: "AIzaSyCXOp6MPnwArV0NiPPAmkBBKdvQoc0gadk",
  authDomain: "rawaan-online-shop.firebaseapp.com",
  projectId: "rawaan-online-shop",
  storageBucket: "rawaan-online-shop.firebasestorage.app",
  messagingSenderId: "492970437433",
  appId: "1:492970437433:web:17249ff78baca4e86b56e8",
};

// Bilow labada app ee Firebase
const risingApp = initializeApp(firebaseConfig, "rising");
const galladApp = initializeApp(galladConfig, "gallad");

// Adeegyada la dhoofinayo (Exports)
export const db = getFirestore(risingApp);
export const auth = getAuth(risingApp);
export const storage = getStorage(galladApp);

// App-ka guud iyo magacyadiisa saxda ah
export { risingApp, galladApp };
export const app = risingApp;

// Default export
export default risingApp;