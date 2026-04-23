import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureDefaultAdminAccount } from "@/lib/ensureDefaultAdmin";
import { COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminSession";
import {
  accountsCollection,
  ensureMongoIndexes,
  loginEventsCollection,
  profileEducationCollection,
  profileLinksCollection,
  profilePersonalCollection,
  profileSkillsCollection,
  profileWorkCollection,
  profilesCollection,
} from "@/lib/mongoStore";

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
  const personal = asArray(json.profile_personal) || [];
  const links = asArray(json.profile_links) || [];
  const education = asArray(json.profile_education) || [];
  const work = asArray(json.profile_work) || [];
  const skills = asArray(json.profile_skills) || [];
  const profilesLegacy = asArray(json.profiles_legacy) || asArray(json.profiles) || [];
  if (!accounts) {
    return NextResponse.json({ error: "Invalid backup: `accounts` must be an array." }, { status: 400 });
  }
  // card collections are preferred; legacy profiles are optional

  const loginEvents = json.loginEvents ? asArray(json.loginEvents) : [];
  if (json.loginEvents != null && !loginEvents) {
    return NextResponse.json({ error: "Invalid backup: `loginEvents` must be an array." }, { status: 400 });
  }
  const cleanLoginEvents = sanitizeLoginEvents(loginEvents);

  const [acc, legacyProf, log, personalColl, linksColl, eduColl, workColl, skillsColl] = await Promise.all([
    accountsCollection(),
    profilesCollection(),
    loginEventsCollection(),
    profilePersonalCollection(),
    profileLinksCollection(),
    profileEducationCollection(),
    profileWorkCollection(),
    profileSkillsCollection(),
  ]);

  // Replace all data
  await Promise.all([
    acc.deleteMany({}),
    legacyProf.deleteMany({}),
    log.deleteMany({}),
    personalColl.deleteMany({}),
    linksColl.deleteMany({}),
    eduColl.deleteMany({}),
    workColl.deleteMany({}),
    skillsColl.deleteMany({}),
  ]);
  if (accounts.length) await acc.insertMany(accounts, { ordered: false });
  if (profilesLegacy.length) await legacyProf.insertMany(profilesLegacy, { ordered: false });
  if (personal.length) await personalColl.insertMany(personal, { ordered: false });
  if (links.length) await linksColl.insertMany(links, { ordered: false });
  if (education.length) await eduColl.insertMany(education, { ordered: false });
  if (work.length) await workColl.insertMany(work, { ordered: false });
  if (skills.length) await skillsColl.insertMany(skills, { ordered: false });
  if (cleanLoginEvents.length) await log.insertMany(cleanLoginEvents, { ordered: false });

  // Ensure admin always exists
  await ensureDefaultAdminAccount();

  return NextResponse.json({
    ok: true,
    accountsCount: accounts.length,
    profilesCount: personal.length || profilesLegacy.length,
    loginEventsCount: cleanLoginEvents.length,
  });
}

