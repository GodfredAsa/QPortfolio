import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureDefaultAdminAccount } from "@/lib/ensureDefaultAdmin";
import { COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminSession";
import {
  ensureMongoIndexes,
  countAccounts,
  countProfiles,
  genderDonut,
  topProgrammingLanguages,
  dailyCountsFromCollection,
} from "@/lib/mongoStore";

function mergeDaily(signupsRows, loginsRows) {
  const map = new Map();
  for (const r of signupsRows) {
    if (!r?._id) continue;
    map.set(String(r._id), { date: String(r._id), signups: r.count || 0, logins: 0 });
  }
  for (const r of loginsRows) {
    if (!r?._id) continue;
    const k = String(r._id);
    const cur = map.get(k) || { date: k, signups: 0, logins: 0 };
    cur.logins = r.count || 0;
    map.set(k, cur);
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export async function GET() {
  await ensureDefaultAdminAccount();
  await ensureMongoIndexes();
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 },
    );
  }

  const [totalUsers, totalProfiles, donut, langs, signupsRows, loginsRows] =
    await Promise.all([
      countAccounts(),
      countProfiles(),
      genderDonut(),
      topProgrammingLanguages(12),
      dailyCountsFromCollection("accounts", "createdAt", 120),
      dailyCountsFromCollection("login_events", "at", 120),
    ]);
  const dailyActivity = mergeDaily(signupsRows, loginsRows);

  return NextResponse.json({
    ok: true,
    totalUsers,
    totalProfiles,
    genderDonut: donut,
    dailyActivity,
    topProgrammingLanguages: langs,
    loginEventsCount: loginsRows.reduce((n, r) => n + (r?.count || 0), 0),
    generatedAt: new Date().toISOString(),
  });
}
