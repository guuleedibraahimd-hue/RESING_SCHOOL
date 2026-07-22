//src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

/* ===========================================================
   Rising School ERP
   Firestore + Authentication
=========================================================== */

const resingConfig = {
  apiKey: "API_KEY_GAAGA",
  authDomain: "resing-school-erp.firebaseapp.com",
  projectId: "resing-school-erp",
  storageBucket: "resing-school-erp.firebasestorage.app",
  messagingSenderId: "165001325650",
  appId: "1:165001325650:web:9190a1fea4e3459418438b",
};

const resingApp = initializeApp(resingConfig, "resing");

/* ===========================================================
   GALLAD TECH STORAGE
   Storage Only
=========================================================== */

const galladConfig = {
  apiKey: "AIzaSyCXOp6MPnwArV0NiPPAmkBBKdvQoc0gadk",
  authDomain: "rawaan-online-shop.firebaseapp.com",
  projectId: "rawaan-online-shop",
  storageBucket: "rawaan-online-shop.firebasestorage.app",
  messagingSenderId: "492970437433",
  appId: "1:492970437433:web:17249ff78baca4e86b56e8",
};

const galladApp = initializeApp(galladConfig, "gallad");

/* ===========================================================
   EXPORTS
=========================================================== */

export const db = getFirestore(resingApp);
export const auth = getAuth(resingApp);

export const storage = getStorage(galladApp);

export default resingApp;