import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyBgXU8P-Wp0BRqdQJwYbedEiO_LTs039nA",
    authDomain: "decisionalgo-36e5c.firebaseapp.com",
    projectId: "decisionalgo-36e5c",
    storageBucket: "decisionalgo-36e5c.firebasestorage.app",
    messagingSenderId: "526875498420",
    appId: "1:526875498420:web:207f83a92afe7a44ea44e1",
    measurementId: "G-TREXPX323W"
};

// Initialize Firebase safely
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let firestoreInstance: any = null;

export async function getDb() {
    if (!firestoreInstance && typeof window !== "undefined") {
        const { getFirestore } = await import("firebase/firestore");
        firestoreInstance = getFirestore(app);
    }
    return firestoreInstance;
}

// For backwards compatibility
export const db = new Proxy({} as any, {
    get(target, prop) {
        if (firestoreInstance) {
            return (firestoreInstance as any)[prop];
        }
        return undefined;
    }
});
