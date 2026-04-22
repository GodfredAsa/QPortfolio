import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { ensureDefaultAdminAccount } from "@/lib/ensureDefaultAdmin";
import { DEFAULT_ADMIN_EMAIL } from "@/lib/adminConstants";
import {
  COOKIE_NAME,
  MAX_AGE_SEC,
  signAdminSession,
} from "@/lib/adminSession";

const DATA_DIR = path.join(process.cwd(), "data");
const ACCOUNTS_PATH = path.join(DATA_DIR, "accounts.json");

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

async function readAccounts() {
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

/**
 * @param {import("next/server").NextRequest} req
 */
export async function POST(req) {
  try {
    await ensureDefaultAdminAccount();
    const body = await req.json();
    const email = normalizeEmail(body?.email);
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    if (email !== normalizeEmail(DEFAULT_ADMIN_EMAIL)) {
      return NextResponse.json(
        { error: "You do not have access to the dashboard." },
        { status: 403 },
      );
    }

    const accounts = await readAccounts();
    const account = accounts.find((a) => normalizeEmail(a.email) === email);
    if (!account?.passwordHash) {
      return NextResponse.json(
        { error: "You do not have access to the dashboard." },
        { status: 403 },
      );
    }

    const ok = await bcrypt.compare(password, account.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    let token;
    try {
      token = signAdminSession(account.email);
    } catch {
      return NextResponse.json(
        { error: "You do not have access to the dashboard." },
        { status: 403 },
      );
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: MAX_AGE_SEC,
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 },
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
  return res;
}
