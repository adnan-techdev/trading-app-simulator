import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Trader from "../models/Trader.js";
import Trade from "../models/Trade.js";

function tokenFor(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}

function safeUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email, createdAt: user.createdAt };
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: "Name, email and password are required." });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });
    const normalized = email.trim().toLowerCase();
    if (await User.findOne({ email: normalized })) return res.status(409).json({ message: "An account with this email already exists." });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), email: normalized, passwordHash });
    await Trader.create({ userId: user._id, name: user.name });
    return res.status(201).json({ token: tokenFor(user._id.toString()), user: safeUser(user) });
  } catch (error) { next(error); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) return res.status(400).json({ message: "Email and password are required." });
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: "Invalid email or password." });
    await Trader.updateOne({ userId: user._id }, { $set: { name: user.name } }, { upsert: true });
    return res.json({ token: tokenFor(user._id.toString()), user: safeUser(user) });
  } catch (error) { next(error); }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("_id name email createdAt");
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({ user: safeUser(user) });
  } catch (error) { next(error); }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, email, password, currentPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!name?.trim() || !email?.trim()) return res.status(400).json({ message: "Name and email are required." });
    if (password && password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });
    if (password && !(await bcrypt.compare(currentPassword || "", user.passwordHash))) return res.status(401).json({ message: "Current password is incorrect." });
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
    if (existingUser) return res.status(409).json({ message: "An account with this email already exists." });
    user.name = name.trim();
    user.email = normalizedEmail;
    if (password) user.passwordHash = await bcrypt.hash(password, 12);
    await user.save();
    await Trader.updateOne({ userId: user._id }, { $set: { name: user.name } }, { upsert: true });
    return res.json({ user: safeUser(user) });
  } catch (error) { next(error); }
}

export async function removeAccount(req, res, next) {
  try {
    await Promise.all([
      User.deleteOne({ _id: req.user.id }),
      Trader.deleteOne({ userId: req.user.id }),
      Trade.deleteMany({ userId: req.user.id }),
    ]);
    return res.json({ message: "Account deleted." });
  } catch (error) { next(error); }
}
