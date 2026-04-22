import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureDefaultAdminAccount } from "@/lib/ensureDefaultAdmin";
import { COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminSession";
import { readLoginEvents } from "@/lib/loginEventsLog";
import {
  aggregateGenderForDonut,
  buildDailySignupsAndLogins,
} from "@/lib/adminAggregates";
import { getAccountsArray, getProfilesArray } from "@/lib/serverDataStore";

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
    getAccountsArray(),
    getProfilesArray(),
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
