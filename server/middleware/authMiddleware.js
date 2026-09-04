import { getAuth } from "firebase-admin/auth";

export default async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) return res.status(401).json({ message: "Authentication required." });
    const token = header.slice(7);
    const decoded = await getAuth().verifyIdToken(token);
    req.user = { id: decoded.uid, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}
