import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getFirestore, { serializeDocument, serverTimestamp } from "../config/firebase.js";

function tokenFor(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}

function safeUser(user) {
  return { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt };
}

export async function createProfile(req, res, next) {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Name is required." });
    const db = getFirestore();
    const userRef = db.collection("users").doc(req.user.id);
    const existing = await userRef.get();
    if (existing.exists) return res.json({ user: safeUser(serializeDocument(existing)) });
    const user = { _id: req.user.id, name: name.trim(), email: req.user.email, createdAt: new Date().toISOString() };
    await userRef.set(user);
    await db.collection("traders").doc(req.user.id).set({ userId: req.user.id, name: user.name, cash: 100000, portfolioValue: 100000, pnl: 0, holdings: {}, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return res.status(201).json({ user: safeUser(user) });
  } catch (error) { next(error); }
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: "Name, email and password are required." });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });
    const normalized = email.trim().toLowerCase();
    const db = getFirestore();
    const existingUsers = await db.collection("users").where("email", "==", normalized).limit(1).get();
    if (!existingUsers.empty) return res.status(409).json({ message: "An account with this email already exists." });
    const passwordHash = await bcrypt.hash(password, 12);
    const userRef = db.collection("users").doc();
    const user = { _id: userRef.id, name: name.trim(), email: normalized, passwordHash, createdAt: new Date().toISOString() };
    await userRef.set(user);
    await db.collection("traders").doc(userRef.id).set({ userId: userRef.id, name: user.name, cash: 100000, portfolioValue: 100000, pnl: 0, holdings: {}, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return res.status(201).json({ token: tokenFor(user._id), user: safeUser(user) });
  } catch (error) { next(error); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) return res.status(400).json({ message: "Email and password are required." });
    const db = getFirestore();
    const userSnapshot = await db.collection("users").where("email", "==", email.trim().toLowerCase()).limit(1).get();
    const user = userSnapshot.empty ? null : serializeDocument(userSnapshot.docs[0]);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: "Invalid email or password." });
    await db.collection("traders").doc(user._id).set({ userId: user._id, name: user.name, updatedAt: serverTimestamp() }, { merge: true });
    return res.json({ token: tokenFor(user._id), user: safeUser(user) });
  } catch (error) { next(error); }
}

export async function me(req, res, next) {
  try {
    const userSnapshot = await getFirestore().collection("users").doc(req.user.id).get();
    if (!userSnapshot.exists) return res.status(404).json({ message: "User not found." });
    return res.json({ user: safeUser(serializeDocument(userSnapshot)) });
  } catch (error) { next(error); }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, email, password, currentPassword } = req.body;
    const db = getFirestore();
    const userRef = db.collection("users").doc(req.user.id);
    const userSnapshot = await userRef.get();
    if (!userSnapshot.exists) return res.status(404).json({ message: "User not found." });
    const user = serializeDocument(userSnapshot);
    if (!name?.trim() || !email?.trim()) return res.status(400).json({ message: "Name and email are required." });
    if (password && password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });
    if (password && !(await bcrypt.compare(currentPassword || "", user.passwordHash))) return res.status(401).json({ message: "Current password is incorrect." });
    const normalizedEmail = email.trim().toLowerCase();
    const existingUsers = await db.collection("users").where("email", "==", normalizedEmail).limit(2).get();
    if (existingUsers.docs.some((doc) => doc.id !== user._id)) return res.status(409).json({ message: "An account with this email already exists." });
    const updates = { name: name.trim(), email: normalizedEmail, updatedAt: new Date().toISOString() };
    if (password) updates.passwordHash = await bcrypt.hash(password, 12);
    await userRef.update(updates);
    await db.collection("traders").doc(user._id).set({ userId: user._id, name: updates.name, updatedAt: serverTimestamp() }, { merge: true });
    return res.json({ user: safeUser({ ...user, ...updates }) });
  } catch (error) { next(error); }
}

export async function removeAccount(req, res, next) {
  try {
    const db = getFirestore();
    const trades = await db.collection("trades").where("userId", "==", req.user.id).get();
    const batch = db.batch();
    trades.docs.forEach((doc) => batch.delete(doc.ref));
    batch.delete(db.collection("users").doc(req.user.id));
    batch.delete(db.collection("traders").doc(req.user.id));
    await batch.commit();
    return res.json({ message: "Account deleted." });
  } catch (error) { next(error); }
}
