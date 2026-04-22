import { appendLoginEvent as append, getLoginEventsDoc } from "./serverDataStore";

/**
 * @returns {Promise<{ events: { at: string }[] }>}
 */
export async function readLoginEvents() {
  return getLoginEventsDoc();
}

export async function appendLoginEvent() {
  return append();
}
