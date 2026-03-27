import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBgXU8P-Wp0BRqdQJwYbedEiO_LTs039nA",
    authDomain: "decisionalgo-36e5c.firebaseapp.com",
    projectId: "decisionalgo-36e5c",
    storageBucket: "decisionalgo-36e5c.firebasestorage.app",
    messagingSenderId: "526875498420",
    appId: "1:526875498420:web:207f83a92afe7a44ea44e1",
    measurementId: "G-TREXPX323M"
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
