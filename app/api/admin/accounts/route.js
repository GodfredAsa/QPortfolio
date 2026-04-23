import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureDefaultAdminAccount } from "@/lib/ensureDefaultAdmin";
import { COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminSession";
import { ensureMongoIndexes, listAccountsForAdminPaged } from "@/lib/mongoStore";

export async function GET(req) {
  try {
    await ensureDefaultAdminAccount();
    await ensureMongoIndexes();
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!verifyAdminSessionToken(token)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || "1");
    const pageSize = Number(searchParams.get("pageSize") || "20");
    const q = searchParams.get("q") || "";
    const out = await listAccountsForAdminPaged({ page, pageSize, q });
    return NextResponse.json({ ok: true, ...out }, { status: 200 });
  } catch (e) {
    if (e && e.code === "MONGO_MISSING_URI") {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

