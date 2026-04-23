import bcrypt from "bcryptjs";
import { ensureDefaultAdminAccount } from "@/lib/ensureDefaultAdmin";
import {
  ensureMongoIndexes,
  getAccountByEmail,
  insertAccount,
  normalizeEmail,
} from "@/lib/mongoStore";

/** Digits only, min 10 max 15 (E.165-style without forcing country rules). */
function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function isValidPhone(digits) {
  return typeof digits === "string" && digits.length >= 10 && digits.length <= 15;
}

function accountPhoneDigits(phone) {
  if (phone == null) return "";
  return normalizePhone(String(phone));
}

export async function GET(req) {
  try {
    await ensureMongoIndexes();
    const { searchParams } = new URL(req.url);
    const email = normalizeEmail(searchParams.get("email"));
    if (!email) {
      return Response.json({ error: "email is required" }, { status: 400 });
    }
    const account = await getAccountByEmail(email);
    if (!account) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json(
      {
        id: account.id,
        email: account.email,
        phone: account.phone,
        fullName: account.fullName,
        username: account.username,
        createdAt: account.createdAt,
      },
      { status: 200 },
    );
  } catch (e) {
    if (e && e.code === "MONGO_MISSING_URI") {
      return Response.json({ error: e.message }, { status: 503 });
    }
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function POST(req) {
  try {
    await ensureDefaultAdminAccount();
    await ensureMongoIndexes();
    const body = await req.json();

    const email = normalizeEmail(body?.email);
    const phoneDigits = normalizePhone(body?.phone);
    const fullName = String(body?.fullName || "").trim();
    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");

    if (!email || !fullName || !username || !password) {
      return Response.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }

    if (!email.includes("@")) {
      return Response.json(
        { error: "Use a valid email address." },
        { status: 400 },
      );
    }

    if (!isValidPhone(phoneDigits)) {
      return Response.json(
        { error: "Enter a valid phone number (10–15 digits)." },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const account = {
      id:
        (globalThis.crypto?.randomUUID && globalThis.crypto.randomUUID()) ||
        `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      email,
      phone: phoneDigits,
      phoneDigits,
      fullName,
      username,
      passwordHash,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    try {
      await insertAccount(account);
    } catch (err) {
      // Mongo duplicate key errors
      if (err && err.code === 11000) {
        const msg = String(err.message || "");
        if (msg.includes("phoneDigits")) {
          return Response.json(
            { error: "An account with this phone number already exists." },
            { status: 409 },
          );
        }
        return Response.json(
          { error: "An account with this email already exists." },
          { status: 409 },
        );
      }
      throw err;
    }

    return Response.json({ ok: true }, { status: 201 });
  } catch (e) {
    if (e && e.code === "MONGO_MISSING_URI") {
      return Response.json({ error: e.message }, { status: 503 });
    }
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
}

