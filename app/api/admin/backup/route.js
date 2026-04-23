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

  const [acc, legacyProf, log] = await Promise.all([
    accountsCollection(),
    profilesCollection(),
    loginEventsCollection(),
  ]);

  const [
    accounts,
    legacyProfiles,
    loginEvents,
    personal,
    links,
    education,
    work,
    skills,
  ] = await Promise.all([
    acc.find({}).toArray(),
    legacyProf.find({}).toArray(),
    log.find({}).sort({ at: 1 }).toArray(),
    profilePersonalCollection().then((c) => c.find({}).toArray()),
    profileLinksCollection().then((c) => c.find({}).toArray()),
    profileEducationCollection().then((c) => c.find({}).toArray()),
    profileWorkCollection().then((c) => c.find({}).toArray()),
    profileSkillsCollection().then((c) => c.find({}).toArray()),
  ]);

  const payload = {
    version: 2,
    app: "quickPortfolio",
    exportedAt: new Date().toISOString(),
    accounts: accounts.map(stripMongoId),
    profile_personal: personal.map(stripMongoId),
    profile_links: links.map(stripMongoId),
    profile_education: education.map(stripMongoId),
    profile_work: work.map(stripMongoId),
    profile_skills: skills.map(stripMongoId),
    profiles_legacy: legacyProfiles.map(stripMongoId),
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

