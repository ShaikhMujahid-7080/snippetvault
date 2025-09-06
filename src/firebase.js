// Import only the required Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // <-- Add this line

const firebaseConfig = {
  apiKey: "AIzaSyAQQR2LhALHOWcwIOZWec_ONRRtpG2A--A",
  authDomain: "snippetvault-db.firebaseapp.com",
  projectId: "snippetvault-db",
  storageBucket: "snippetvault-db.appspot.com", // <-- fix here
  messagingSenderId: "1067272557365",
  appId: "1:1067272557365:web:fdec2e79ca1041644f327c",
  measurementId: "G-DRWRYV6JF4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and export it
export const db = getFirestore(app);
