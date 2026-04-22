import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import { ensureDefaultAdminAccount } from "@/lib/ensureDefaultAdmin";
import { COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminSession";
import { readLoginEvents } from "@/lib/loginEventsLog";
import {
  aggregateGenderForDonut,
  buildDailySignupsAndLogins,
} from "@/lib/adminAggregates";

const DATA_DIR = path.join(process.cwd(), "data");
const ACCOUNTS_PATH = path.join(DATA_DIR, "accounts.json");
const PROFILES_PATH = path.join(DATA_DIR, "profiles.json");

async function readAccountsArray() {
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

async function readProfilesArray() {
  try {
    const raw = await fs.readFile(PROFILES_PATH, "utf8");
    const json = JSON.parse(raw);
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.profiles)) return json.profiles;
    return [];
  } catch (err) {
    if (err && err.code === "ENOENT") return [];
    throw err;
  }
}

/**
 * @param {unknown[]} profiles
 * @param {number} limit
 * @returns {{ name: string, count: number }[]}
 */
function aggregateTopProgrammingLanguages(profiles, limit = 12) {
  /** @type {Record<string, number>} */
  const counts = {};
  for (const p of profiles) {
    if (p == null || !Array.isArray(p.programmingLanguages)) continue;
    for (const id of p.programmingLanguages) {
      const k = String(id || "")
        .trim()
        .toLowerCase();
      if (!k) continue;
      counts[k] = (counts[k] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, count]) => ({
      name: id.length ? id.charAt(0).toUpperCase() + id.slice(1) : id,
      count,
    }));
}

export async function GET() {
  await ensureDefaultAdminAccount();
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 },
    );
  }

  const [accounts, profiles, { events: loginEvents }] = await Promise.all([
    readAccountsArray(),
    readProfilesArray(),
    readLoginEvents(),
  ]);

  const genderDonut = aggregateGenderForDonut(profiles);
  const dailyActivity = buildDailySignupsAndLogins(accounts, loginEvents, {
    maxDays: 120,
  });
  const topLanguages = aggregateTopProgrammingLanguages(profiles, 12);

  return NextResponse.json({
    ok: true,
    totalUsers: accounts.length,
    totalProfiles: profiles.length,
    genderDonut,
    dailyActivity,
    topProgrammingLanguages: topLanguages,
    loginEventsCount: loginEvents.length,
    generatedAt: new Date().toISOString(),
  });
}
