import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureDefaultAdminAccount } from "@/lib/ensureDefaultAdmin";
import { COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminSession";
import {
  ensureMongoIndexes,
  setAccountStatusByEmail,
  normalizeEmail,
  normalizeAccountStatus,
} from "@/lib/mongoStore";

export async function PUT(req) {
  try {
    await ensureDefaultAdminAccount();
    await ensureMongoIndexes();
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!verifyAdminSessionToken(token)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const body = await req.json();
    const email = normalizeEmail(body?.email);
    const status = normalizeAccountStatus(body?.status);
    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }
    const updated = await setAccountStatusByEmail(email, status);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, account: updated }, { status: 200 });
  } catch (e) {
    if (e && e.code === "MONGO_MISSING_URI") {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

