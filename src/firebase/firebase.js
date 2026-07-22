// src/firebase/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

/* ===========================================================
   RISING STAR SCHOOL
   (Project ID = one-click-online)
=========================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyBXFegVGIYVk02zY6Ks3DhcoWjomNw_ht0",
  authDomain: "one-click-online.firebaseapp.com",
  projectId: "one-click-online",
  storageBucket: "one-click-online.firebasestorage.app",
  messagingSenderId: "988928725446",
  appId: "1:988928725446:web:81f45c1187bc048343a2c7",
};

const app = initializeApp(firebaseConfig);

/* ===========================================================
   GALLAD TECH STORAGE
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

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(galladApp);

export default app;