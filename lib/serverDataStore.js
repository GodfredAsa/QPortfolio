/**
 * Persists app data for Vercel (serverless: no durable local disk) OR local `data/*.json`.
 * On Vercel, add Redis from the Marketplace (Upstash) and connect it. Env vars are typically
 * `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (legacy `KV_REST_*` still supported).
 * Without them, API writes return 503.
 * @see https://vercel.com/marketplace?category=storage&search=redis
 */

import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ACCOUNTS_PATH = path.join(DATA_DIR, "accounts.json");
const PROFILES_PATH = path.join(DATA_DIR, "profiles.json");
const LOGIN_EVENTS_PATH = path.join(DATA_DIR, "loginEvents.json");

const KV_ACCOUNTS = "qp_v1_accounts";
const KV_PROFILES = "qp_v1_profiles";
const KV_LOGIN_EVENTS = "qp_v1_login_events";

function redisUrl() {
  return process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
}

function redisToken() {
  return process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
}

export function useKV() {
  return Boolean(redisUrl() && redisToken());
}

/** @type {import("@upstash/redis").Redis | null} */
let redisSingleton = null;

/**
 * @returns {Promise<import("@upstash/redis").Redis | null>}
 */
export async function getRedis() {
  if (!useKV()) return null;
  if (redisSingleton) return redisSingleton;
  const { Redis } = await import("@upstash/redis");
  const url = redisUrl();
  const token = redisToken();
  if (!url || !token) return null;
  redisSingleton = new Redis({ url, token });
  return redisSingleton;
}

function mustUseKVOnVercelForWrites() {
  if (process.env.VERCEL && !useKV()) {
    const err = new Error(
      "This deployment has no Redis. In Vercel: Marketplace → add Upstash Redis, connect to this project (env: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN).",
    );
    err.code = "VERCEL_NO_KV";
    throw err;
  }
}

async function readAccountsArrayFromFs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
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

async function readProfilesArrayFromFs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
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

async function readLoginEventsDocFromFs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(LOGIN_EVENTS_PATH, "utf8");
    const j = JSON.parse(raw);
    if (j && Array.isArray(j.events)) {
      return {
        events: j.events.filter(
          (e) => e && typeof e === "object" && typeof e.at === "string",
        ),
      };
    }
    return { events: [] };
  } catch (err) {
    if (err && err.code === "ENOENT") return { events: [] };
    throw err;
  }
}

/**
 * When Redis is empty, copy from bundled `data/` once (git-included JSON in the deployment).
 * @param {import("@upstash/redis").Redis} r
 */
async function bootstrapAccountsFromFsIfNeeded(r) {
  const existing = await r.get(KV_ACCOUNTS);
  if (existing != null) {
    return normalizeAccountsDoc(existing);
  }
  const fromFs = await readAccountsArrayFromFs();
  const doc = { accounts: fromFs };
  await r.set(KV_ACCOUNTS, doc);
  return doc;
}

function normalizeAccountsDoc(v) {
  if (v && Array.isArray(v.accounts)) return { accounts: v.accounts };
  if (Array.isArray(v)) return { accounts: v };
  return { accounts: [] };
}

/** @param {import("@upstash/redis").Redis} r */
async function bootstrapProfilesFromFsIfNeeded(r) {
  const existing = await r.get(KV_PROFILES);
  if (existing != null) {
    return normalizeProfilesDoc(existing);
  }
  const fromFs = await readProfilesArrayFromFs();
  const doc = { profiles: fromFs };
  await r.set(KV_PROFILES, doc);
  return doc;
}

function normalizeProfilesDoc(v) {
  if (v && Array.isArray(v.profiles)) return { profiles: v.profiles };
  if (Array.isArray(v)) return { profiles: v };
  return { profiles: [] };
}

/** @param {import("@upstash/redis").Redis} r */
async function bootstrapLoginEventsFromFsIfNeeded(r) {
  const existing = await r.get(KV_LOGIN_EVENTS);
  if (existing != null) {
    return normalizeLoginDoc(existing);
  }
  const fromFs = await readLoginEventsDocFromFs();
  await r.set(KV_LOGIN_EVENTS, fromFs);
  return fromFs;
}

function normalizeLoginDoc(v) {
  if (v && Array.isArray(v.events)) {
    return {
      events: v.events.filter(
        (e) => e && typeof e === "object" && typeof e.at === "string",
      ),
    };
  }
  return { events: [] };
}

/**
 * @returns {Promise<unknown[]>}
 */
export async function getAccountsArray() {
  if (useKV()) {
    const r = await getRedis();
    if (!r) return readAccountsArrayFromFs();
    const doc = await bootstrapAccountsFromFsIfNeeded(r);
    return doc.accounts;
  }
  return readAccountsArrayFromFs();
}

/**
 * @param {unknown[]} accounts
 */
export async function setAccountsArray(accounts) {
  mustUseKVOnVercelForWrites();
  const doc = { accounts: Array.isArray(accounts) ? accounts : [] };
  if (useKV()) {
    const r = await getRedis();
    if (!r) throw new Error("Redis client unavailable.");
    await r.set(KV_ACCOUNTS, doc);
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    ACCOUNTS_PATH,
    JSON.stringify(doc, null, 2),
    "utf8",
  );
}

/**
 * @returns {Promise<unknown[]>}
 */
export async function getProfilesArray() {
  if (useKV()) {
    const r = await getRedis();
    if (!r) return readProfilesArrayFromFs();
    const doc = await bootstrapProfilesFromFsIfNeeded(r);
    return doc.profiles;
  }
  return readProfilesArrayFromFs();
}

/**
 * @param {unknown[]} profiles
 */
export async function setProfilesArray(profiles) {
  mustUseKVOnVercelForWrites();
  const doc = { profiles: Array.isArray(profiles) ? profiles : [] };
  if (useKV()) {
    const r = await getRedis();
    if (!r) throw new Error("Redis client unavailable.");
    await r.set(KV_PROFILES, doc);
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    PROFILES_PATH,
    JSON.stringify(doc, null, 2),
    "utf8",
  );
}

/**
 * @returns {Promise<{ events: { at: string }[] }>}
 */
export async function getLoginEventsDoc() {
  if (useKV()) {
    const r = await getRedis();
    if (!r) return readLoginEventsDocFromFs();
    return bootstrapLoginEventsFromFsIfNeeded(r);
  }
  return readLoginEventsDocFromFs();
}

/**
 * @param {{ events: { at: string }[] }} doc
 */
export async function setLoginEventsDoc(doc) {
  mustUseKVOnVercelForWrites();
  const events = Array.isArray(doc?.events)
    ? doc.events.filter(
        (e) => e && typeof e === "object" && typeof e.at === "string",
      )
    : [];
  const out = { events };
  if (useKV()) {
    const r = await getRedis();
    if (!r) throw new Error("Redis client unavailable.");
    await r.set(KV_LOGIN_EVENTS, out);
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    LOGIN_EVENTS_PATH,
    JSON.stringify(out, null, 2),
    "utf8",
  );
}

const MAX_LOGIN_EVENTS = 5000;

export async function appendLoginEvent() {
  const at = new Date().toISOString();
  const { events } = await getLoginEventsDoc();
  const next = [...events, { at }].slice(-MAX_LOGIN_EVENTS);
  await setLoginEventsDoc({ events: next });
}
