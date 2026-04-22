import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const DATA_DIR = path.join(process.cwd(), "data");
const ACCOUNTS_PATH = path.join(DATA_DIR, "accounts.json");

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

/** Digits only, min 10 max 15 (E.165-style without forcing country rules). */
function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function isValidPhone(digits) {
  return typeof digits === "string" && digits.length >= 10 && digits.length <= 15;
}

async function readAccounts() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(ACCOUNTS_PATH, "utf8");
    const json = JSON.parse(raw);
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.accounts)) return json.accounts;
    return [];
  } catch (err) {
    if (err && err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeAccounts(accounts) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    ACCOUNTS_PATH,
    JSON.stringify({ accounts }, null, 2),
    "utf8",
  );
}

function accountPhoneDigits(phone) {
  if (phone == null) return "";
  return normalizePhone(String(phone));
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = normalizeEmail(searchParams.get("email"));
    if (!email) {
      return Response.json({ error: "email is required" }, { status: 400 });
    }
    const accounts = await readAccounts();
    const account = accounts.find((a) => normalizeEmail(a.email) === email);
    if (!account) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json(
      {
        id: account.id,
        email: account.email,
        phone: account.phone,
        fullName: account.fullName,
        username: account.username,
        createdAt: account.createdAt,
      },
      { status: 200 },
    );
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const email = normalizeEmail(body?.email);
    const phoneDigits = normalizePhone(body?.phone);
    const fullName = String(body?.fullName || "").trim();
    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");

    if (!email || !fullName || !username || !password) {
      return Response.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }

    if (!email.includes("@")) {
      return Response.json(
        { error: "Use a valid email address." },
        { status: 400 },
      );
    }

    if (!isValidPhone(phoneDigits)) {
      return Response.json(
        { error: "Enter a valid phone number (10–15 digits)." },
        { status: 400 },
      );
    }

    const accounts = await readAccounts();

    const exists = accounts.some((a) => normalizeEmail(a.email) === email);
    if (exists) {
      return Response.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const phoneTaken = accounts.some(
      (a) => accountPhoneDigits(a.phone) === phoneDigits,
    );
    if (phoneTaken) {
      return Response.json(
        { error: "An account with this phone number already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const account = {
      id:
        (globalThis.crypto?.randomUUID && globalThis.crypto.randomUUID()) ||
        `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      email,
      phone: phoneDigits,
      fullName,
      username,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    accounts.push(account);
    await writeAccounts(accounts);

    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
}

