import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureDefaultAdminAccount } from "@/lib/ensureDefaultAdmin";
import { COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminSession";
import { accountsCollection, profilesCollection, loginEventsCollection, ensureMongoIndexes } from "@/lib/mongoStore";

function stripMongoId(doc) {
  if (!doc || typeof doc !== "object") return doc;
  const { _id, ...rest } = doc;
  return rest;
}

export async function GET() {
  await ensureDefaultAdminAccount();
  await ensureMongoIndexes();

  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const [acc, prof, log] = await Promise.all([
    accountsCollection(),
    profilesCollection(),
    loginEventsCollection(),
  ]);

  const [accounts, profiles, loginEvents] = await Promise.all([
    acc.find({}).toArray(),
    prof.find({}).toArray(),
    log.find({}).sort({ at: 1 }).toArray(),
  ]);

  const payload = {
    version: 1,
    app: "quickPortfolio",
    exportedAt: new Date().toISOString(),
    accounts: accounts.map(stripMongoId),
    profiles: profiles.map(stripMongoId),
    loginEvents: loginEvents.map(stripMongoId),
  };

  const body = JSON.stringify(payload, null, 2);
  const day = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="quickportfolio-backup-${day}.json"`,
    },
  });
}

