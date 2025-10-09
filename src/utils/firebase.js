// Import only the required Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore, enableNetwork, disableNetwork } from "firebase/firestore"; 
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAQQR2LhALHOWcwIOZWec_ONRRtpG2A--A",
  authDomain: "snippetvault-db.firebaseapp.com",
  projectId: "snippetvault-db",
  storageBucket: "snippetvault-db.appspot.com",
  messagingSenderId: "1067272557365",
  appId: "1:1067272557365:web:fdec2e79ca1041644f327c",
  measurementId: "G-DRWRYV6JF4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Force disable and re-enable network to clear any cached corruption
const initializeFirestore = async () => {
  try {
    await disableNetwork(db);
    console.log('Firestore offline mode enabled');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await enableNetwork(db);
    console.log('Firestore online mode restored');
  } catch (error) {
    console.warn('Firestore network reset failed:', error);
  }
};

// Initialize on app start
initializeFirestore();

export default app;
