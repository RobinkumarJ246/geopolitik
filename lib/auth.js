import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("Please define JWT_SECRET in your environment variables (.env.local)");
}

export function signToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token) {
  return jwt.verify(token, secret);
}
