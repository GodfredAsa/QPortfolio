import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureDefaultAdminAccount } from "@/lib/ensureDefaultAdmin";
import { COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminSession";
import { accountsCollection, profilesCollection, loginEventsCollection, ensureMongoIndexes } from "@/lib/mongoStore";

function asArray(v) {
  return Array.isArray(v) ? v : null;
}

function sanitizeLoginEvents(arr) {
  const out = [];
  for (const e of arr || []) {
    if (e && typeof e === "object" && typeof e.at === "string") {
      out.push({ at: e.at });
    }
  }
  return out;
}

export async function POST(req) {
  await ensureDefaultAdminAccount();
  await ensureMongoIndexes();

  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let json;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be valid JSON." }, { status: 400 });
  }

  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return NextResponse.json({ error: "Invalid JSON: expected an object." }, { status: 400 });
  }

  const accounts = asArray(json.accounts);
  const profiles = asArray(json.profiles);
  if (!accounts) {
    return NextResponse.json({ error: "Invalid backup: `accounts` must be an array." }, { status: 400 });
  }
  if (!profiles) {
    return NextResponse.json({ error: "Invalid backup: `profiles` must be an array." }, { status: 400 });
  }

  const loginEvents = json.loginEvents ? asArray(json.loginEvents) : [];
  if (json.loginEvents != null && !loginEvents) {
    return NextResponse.json({ error: "Invalid backup: `loginEvents` must be an array." }, { status: 400 });
  }
  const cleanLoginEvents = sanitizeLoginEvents(loginEvents);

  const [acc, prof, log] = await Promise.all([
    accountsCollection(),
    profilesCollection(),
    loginEventsCollection(),
  ]);

  // Replace all data
  await Promise.all([acc.deleteMany({}), prof.deleteMany({}), log.deleteMany({})]);
  if (accounts.length) await acc.insertMany(accounts, { ordered: false });
  if (profiles.length) await prof.insertMany(profiles, { ordered: false });
  if (cleanLoginEvents.length) await log.insertMany(cleanLoginEvents, { ordered: false });

  // Ensure admin always exists
  await ensureDefaultAdminAccount();

  return NextResponse.json({
    ok: true,
    accountsCount: accounts.length,
    profilesCount: profiles.length,
    loginEventsCount: cleanLoginEvents.length,
  });
}

