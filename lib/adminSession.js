import crypto from "crypto";
import { DEFAULT_ADMIN_EMAIL } from "./adminConstants";

const COOKIE_NAME = "qp_admin_session";
const MAX_AGE_SEC = 7 * 24 * 60 * 60;

function getSecret() {
  return (
    process.env.QP_SESSION_SECRET ||
    "qp-dev-default-session-secret-rotate-with-QP_SESSION_SECRET"
  );
}

/**
 * @param {string} email
 * @returns {string}
 */
export function signAdminSession(email) {
  if (String(email).trim().toLowerCase() !== DEFAULT_ADMIN_EMAIL) {
    throw new Error("not admin");
  }
  const exp = Date.now() + MAX_AGE_SEC * 1000;
  const payload = Buffer.from(
    JSON.stringify({ e: email.trim().toLowerCase(), exp }),
    "utf8",
  ).toString("base64url");
  const sig = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

/**
 * @param {string|undefined} token
 * @returns {string | null} email if valid
 */
export function verifyAdminSessionToken(token) {
  if (!token || typeof token !== "string") return null;
  const i = token.lastIndexOf(".");
  if (i < 0) return null;
  const payloadB64 = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expect = crypto
    .createHmac("sha256", getSecret())
    .update(payloadB64)
    .digest("hex");
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expect, "utf8");
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;
  let data;
  try {
    data = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    );
  } catch {
    return null;
  }
  if (!data || typeof data.exp !== "number") return null;
  if (data.exp < Date.now()) return null;
  const e = String(data.e || "")
    .trim()
    .toLowerCase();
  if (e !== DEFAULT_ADMIN_EMAIL) return null;
  return DEFAULT_ADMIN_EMAIL;
}

export { COOKIE_NAME, MAX_AGE_SEC, DEFAULT_ADMIN_EMAIL as ADMIN_EMAIL };

