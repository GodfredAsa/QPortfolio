import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_ADMIN_EMAIL } from "./adminConstants";

const DATA_DIR = path.join(process.cwd(), "data");
const ACCOUNTS_PATH = path.join(DATA_DIR, "accounts.json");

export { DEFAULT_ADMIN_EMAIL };

/** bcrypt for password `09876` */
export const DEFAULT_ADMIN_PASSWORD_HASH =
  "$2b$10$Q3Dp66m8Rku4R.SlCUJCEO98aqn7QRMi.dThctuKKN9/y9NyeqvdS";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

async function readAccountsRaw() {
  try {
    const raw = await fs.readFile(ACCOUNTS_PATH, "utf8");
    const json = JSON.parse(raw);
    if (Array.isArray(json)) return { accounts: json, useWrapper: false };
    if (json && Array.isArray(json.accounts)) return { accounts: json.accounts, useWrapper: true };
    return { accounts: [], useWrapper: true };
  } catch (err) {
    if (err && err.code === "ENOENT") return { accounts: [], useWrapper: true };
    throw err;
  }
}

async function writeAccounts(accounts, useWrapper) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const out = useWrapper ? { accounts } : accounts;
  await fs.writeFile(ACCOUNTS_PATH, JSON.stringify(out, null, 2), "utf8");
}

/**
 * If the default admin account is missing (fresh host / empty data), create it
 * with the expected credentials. Idempotent: does not overwrite an existing
 * account’s password.
 */
export async function ensureDefaultAdminAccount() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const { accounts, useWrapper } = await readAccountsRaw();
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

  await writeAccounts(accounts, useWrapper);
}
