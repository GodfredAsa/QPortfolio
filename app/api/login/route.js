import bcrypt from "bcryptjs";
import { ensureDefaultAdminAccount } from "@/lib/ensureDefaultAdmin";
import { appendLoginEvent } from "@/lib/loginEventsLog";
import { getAccountsArray } from "@/lib/serverDataStore";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export async function POST(req) {
  try {
    await ensureDefaultAdminAccount();
    const body = await req.json();
    const email = normalizeEmail(body?.email);
    const password = String(body?.password || "");

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const accounts = await getAccountsArray();
    const account = accounts.find((a) => normalizeEmail(a.email) === email);
    if (!account?.passwordHash) {
      return Response.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, account.passwordHash);
    if (!ok) {
      return Response.json({ error: "Invalid credentials." }, { status: 401 });
    }

    try {
      await appendLoginEvent();
    } catch {
      /* do not block sign-in if analytics log fails */
    }

    return Response.json(
      {
        ok: true,
        account: {
          id: account.id,
          email: account.email,
          phone: account.phone,
          fullName: account.fullName,
          username: account.username,
        },
      },
      { status: 200 },
    );
  } catch (e) {
    if (e && e.code === "VERCEL_NO_KV") {
      return Response.json({ error: e.message }, { status: 503 });
    }
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
}

