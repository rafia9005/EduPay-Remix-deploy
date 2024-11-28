import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDBeXeapZoS2ngEAVWzkPDJnsaBBlmLJ5M",
  authDomain: "edupay-16d18.firebaseapp.com",
  projectId: "edupay-16d18",
  storageBucket: "edupay-16d18.firebasestorage.app",
  messagingSenderId: "719598117831",
  appId: "1:719598117831:web:6f3858e0b1066452472fe2",
  measurementId: "G-FMS7WREH30"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
