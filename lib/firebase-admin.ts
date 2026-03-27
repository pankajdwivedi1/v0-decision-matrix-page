import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

function getFirebaseAdminDB(): Firestore {
    if (!getApps().length) {
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            initializeApp({
                credential: cert(serviceAccount as any),
            });
        } else {
            // Throw an error that will be caught by the API route's try-catch.
            // This error will only occur at runtime IF the API is called without credentials.
            throw new Error("Firebase Admin credentials missing. Check your .env file.");
        }
    }
    return getFirestore();
}

// Use a Proxy to-lazily initialize the Firestore instance.
// This prevents getFirestore() from being called during the Next.js build import phase.
export const db = new Proxy({} as Firestore, {
    get(target, prop, receiver) {
        const instance = getFirebaseAdminDB();
        return Reflect.get(instance, prop, receiver);
    }
});


