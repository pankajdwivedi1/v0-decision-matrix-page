import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCxaTqdHVdapHgZ_xaA_umR9qx8Nygbzs8",
    authDomain: "rankova-b3c2d.firebaseapp.com",
    projectId: "rankova-b3c2d",
    storageBucket: "rankova-b3c2d.firebasestorage.app",
    messagingSenderId: "799418357632",
    appId: "1:799418357632:web:7a2cdec078c8f6083e5365",
    measurementId: "G-T384CNYQTH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let analytics;
// Analytics is only supported in browser environments
if (typeof window !== "undefined") {
    isSupported().then((yes) => {
        if (yes) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, db, analytics };
