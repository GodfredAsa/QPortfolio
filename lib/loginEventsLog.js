import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const PATH = path.join(DATA_DIR, "loginEvents.json");
const MAX_EVENTS = 5000;

/**
 * @returns {Promise<{ events: { at: string }[] }>}
 */
export async function readLoginEvents() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(PATH, "utf8");
    const j = JSON.parse(raw);
    if (j && Array.isArray(j.events)) return { events: j.events };
  } catch (e) {
    if (e && e.code === "ENOENT") return { events: [] };
    throw e;
  }
  return { events: [] };
}

/**
 * Appends a successful sign-in event (used for admin analytics, daily counts only).
 */
export async function appendLoginEvent() {
  const at = new Date().toISOString();
  const { events } = await readLoginEvents();
  const next = [...events, { at }].slice(-MAX_EVENTS);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PATH, JSON.stringify({ events: next }, null, 2), "utf8");
}
