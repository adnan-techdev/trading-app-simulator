import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore as getAdminFirestore } from "firebase-admin/firestore";

let firestore;

export default function getFirestore() {
  if (firestore) return firestore;

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const hasExplicitCredentials = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey;

  if (!hasExplicitCredentials && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error("Firebase server credentials are missing. Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to server/.env.");
  }

  if (getApps().length === 0) {
    initializeApp(hasExplicitCredentials ? {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    } : { credential: applicationDefault() });
  }

  firestore = getAdminFirestore();
  return firestore;
}

export function serverTimestamp() {
  return FieldValue.serverTimestamp();
}

export function serializeDocument(snapshot) {
  return { _id: snapshot.id, ...snapshot.data() };
}