/** @param {string | undefined} iso */
export function toUtcDayKey(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

const GENDER_COLORS = {
  Male: "#29243b",
  Female: "#0d9488",
  "Not specified": "#94a3b8",
  Other: "#7c3aed",
};

/**
 * @returns {{ name: string, value: number, fill: string }[]}
 */
export function aggregateGenderForDonut(profiles) {
  const counts = { Male: 0, Female: 0, "Not specified": 0, Other: 0 };
  for (const p of profiles) {
    const raw = String(p?.gender ?? "").trim();
    if (!raw) {
      counts["Not specified"] += 1;
      continue;
    }
    const lower = raw.toLowerCase();
    if (lower === "male") counts.Male += 1;
    else if (lower === "female") counts.Female += 1;
    else counts.Other += 1;
  }
  return Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({
      name,
      value,
      fill: GENDER_COLORS[name] || "#64748b",
    }));
}

/**
 * @param {Array<{ createdAt?: string }>} accounts
 * @param {{ at: string }[]} events
 * @param {{ maxDays?: number }} [opts]
 * @returns {{ date: string, signups: number, logins: number }[]}
 */
export function buildDailySignupsAndLogins(accounts, events, opts = {}) {
  const maxDays = opts.maxDays ?? 120;
  const signByDay = {};
  for (const a of accounts) {
    const k = toUtcDayKey(a?.createdAt);
    if (k) signByDay[k] = (signByDay[k] || 0) + 1;
  }
  const loginByDay = {};
  for (const e of events) {
    const k = toUtcDayKey(e?.at);
    if (k) loginByDay[k] = (loginByDay[k] || 0) + 1;
  }
  const all = new Set([...Object.keys(signByDay), ...Object.keys(loginByDay)]);
  const sorted = [...all].sort();
  if (sorted.length === 0) {
    return [];
  }
  const from = maxDays > 0 && sorted.length > maxDays
    ? sorted[sorted.length - maxDays]
    : sorted[0];
  const slice = sorted.filter((d) => d >= from);
  return slice.map((date) => ({
    date,
    signups: signByDay[date] || 0,
    logins: loginByDay[date] || 0,
  }));
}
