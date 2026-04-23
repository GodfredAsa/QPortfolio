import { randomUUID } from "crypto";
import { DEFAULT_ADMIN_EMAIL } from "./adminConstants";
import { getAccountByEmail, insertAccount, ensureMongoIndexes } from "./mongoStore";

export { DEFAULT_ADMIN_EMAIL };

/** bcrypt for password `09876` */
export const DEFAULT_ADMIN_PASSWORD_HASH =
  "$2b$10$Q3Dp66m8Rku4R.SlCUJCEO98aqn7QRMi.dThctuKKN9/y9NyeqvdS";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

/**
 * If the default admin account is missing (fresh host / empty data), create it
 * with the expected credentials. Idempotent: does not overwrite an existing
 * account’s password.
 */
export async function ensureDefaultAdminAccount() {
  await ensureMongoIndexes();
  const existing = await getAccountByEmail(DEFAULT_ADMIN_EMAIL);
  if (existing) {
    return;
  }

  await insertAccount({
    id: randomUUID(),
    email: DEFAULT_ADMIN_EMAIL,
    phone: "233548670632",
    phoneDigits: "233548670632",
    fullName: "Godfred Asumadu Asamoah",
    username: "DeFRED",
    passwordHash: DEFAULT_ADMIN_PASSWORD_HASH,
    createdAt: new Date().toISOString(),
  });
}
