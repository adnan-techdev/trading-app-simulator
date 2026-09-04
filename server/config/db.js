import getFirestore from "./firebase.js";


export default async function connectDB() {
  const db = getFirestore();
  await db.collection("users").limit(1).get();
  console.log("Firebase Firestore connected");
}
