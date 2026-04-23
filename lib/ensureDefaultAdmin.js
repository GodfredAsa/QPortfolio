import { randomUUID } from "crypto";
import { DEFAULT_ADMIN_EMAIL } from "./adminConstants";
import { getAccountsArray, setAccountsArray } from "./serverDataStore";

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
  const accounts = await getAccountsArray();
  const target = normalizeEmail(DEFAULT_ADMIN_EMAIL);
  if (accounts.some((a) => normalizeEmail(a.email) === target)) {
    return;
  }

  accounts.push({
    id: randomUUID(),
    email: DEFAULT_ADMIN_EMAIL,
    phone: "233548670632",
    fullName: "Godfred Asumadu Asamoah",
    username: "DeFRED",
    passwordHash: DEFAULT_ADMIN_PASSWORD_HASH,
    createdAt: new Date().toISOString(),
  });

  try {
    await setAccountsArray(accounts);
  } catch (e) {
    if (e && e.code === "VERCEL_NO_KV") {
      console.warn(
        "[Quick Portfolio] Skipped default admin: add Upstash Redis in Vercel and set UPSTASH_REDIS_* env vars for writable storage.",
      );
      return;
    }
    throw e;
  }
}
