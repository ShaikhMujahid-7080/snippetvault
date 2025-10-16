// ✅ UPDATED (2025-10-17 00:28 IST)

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, onSnapshot, collection } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAQQR2LhALHOWcwIOZWec_ONRRtpG2A--A",  // ✅ CORRECT API KEY
  authDomain: "snippetvault-db.firebaseapp.com",
  projectId: "snippetvault-db",
  storageBucket: "snippetvault-db.appspot.com",
  messagingSenderId: "1067272557365",
  appId: "1:1067272557365:web:fdec2e79ca1041644f327c",
  measurementId: "G-DRWRYV6JF4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// 🆕 ADDED (2025-10-17 00:30 IST)
// Track Firestore connectivity status
let isFirestoreOnline = false;
const firestoreReadyCallbacks = [];

// Network state monitor using a dummy collection listener
const monitorFirestoreConnection = () => {
  const dummyRef = collection(db, '__connection_test__');
  
  onSnapshot(
    dummyRef,
    () => {
      if (!isFirestoreOnline) {
        isFirestoreOnline = true;
        console.log('✅ Firestore is now ONLINE');
        
        // Execute all pending callbacks waiting for connection
        firestoreReadyCallbacks.forEach(callback => callback());
        firestoreReadyCallbacks.length = 0;
      }
    },
    (error) => {
      if (isFirestoreOnline) {
        isFirestoreOnline = false;
        console.warn('⚠️ Firestore went OFFLINE:', error);
      }
    }
  );
};

// 🆕 ADDED (2025-10-17 00:32 IST)
// Wait for Firestore to be online before executing callback
export const whenFirestoreReady = (callback) => {
  if (isFirestoreOnline) {
    callback();
  } else {
    firestoreReadyCallbacks.push(callback);
  }
};

// ✅ UPDATED (2025-10-17 01:55 IST)

// Remove the force disable/enable network cycle
const initializeFirestore = async () => {
  try {
    // Just start monitoring, don't force offline/online cycle
    console.log("Firestore initialized");
    monitorFirestoreConnection();
  } catch (error) {
    console.warn("Firestore initialization failed:", error);
  }
};

initializeFirestore();


export default app;
