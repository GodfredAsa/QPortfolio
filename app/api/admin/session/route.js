import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureDefaultAdminAccount } from "@/lib/ensureDefaultAdmin";
import { DEFAULT_ADMIN_EMAIL } from "@/lib/adminConstants";
import {
  COOKIE_NAME,
  MAX_AGE_SEC,
  signAdminSession,
} from "@/lib/adminSession";
import { ensureMongoIndexes, getAccountByEmail, normalizeEmail } from "@/lib/mongoStore";

/**
 * @param {import("next/server").NextRequest} req
 */
export async function POST(req) {
  try {
    await ensureDefaultAdminAccount();
    await ensureMongoIndexes();
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

    const account = await getAccountByEmail(email);
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
  } catch (e) {
    if (e && e.code === "MONGO_MISSING_URI") {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
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
