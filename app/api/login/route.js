import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { ensureDefaultAdminAccount } from "@/lib/ensureDefaultAdmin";
import { appendLoginEvent } from "@/lib/loginEventsLog";

const DATA_DIR = path.join(process.cwd(), "data");
const ACCOUNTS_PATH = path.join(DATA_DIR, "accounts.json");

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
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

export async function POST(req) {
  try {
    await ensureDefaultAdminAccount();
    const body = await req.json();
    const email = normalizeEmail(body?.email);
    const password = String(body?.password || "");

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const accounts = await readAccounts();
    const account = accounts.find((a) => normalizeEmail(a.email) === email);
    if (!account?.passwordHash) {
      return Response.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, account.passwordHash);
    if (!ok) {
      return Response.json({ error: "Invalid credentials." }, { status: 401 });
    }

    try {
      await appendLoginEvent();
    } catch {
      /* do not block sign-in if analytics log fails */
    }

    return Response.json(
      {
        ok: true,
        account: {
          id: account.id,
          email: account.email,
          phone: account.phone,
          fullName: account.fullName,
          username: account.username,
        },
      },
      { status: 200 },
    );
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
}

