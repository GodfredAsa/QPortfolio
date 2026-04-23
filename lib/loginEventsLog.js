import { appendLoginEvent as appendMongo } from "./mongoStore";

/**
 * @returns {Promise<{ events: { at: string }[] }>}
 */
export async function readLoginEvents() {
  // Legacy wrapper: admin analytics now reads directly from Mongo aggregations.
  return { events: [] };
}

export async function appendLoginEvent() {
  return appendMongo();
}
