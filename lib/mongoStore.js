import { getDb } from "./mongodb";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export async function accountsCollection() {
  const db = await getDb();
  return db.collection("accounts");
}

export async function profilesCollection() {
  const db = await getDb();
  return db.collection("profiles");
}

export async function loginEventsCollection() {
  const db = await getDb();
  return db.collection("login_events");
}

export async function ensureMongoIndexes() {
  const [acc, prof, log] = await Promise.all([
    accountsCollection(),
    profilesCollection(),
    loginEventsCollection(),
  ]);

  await Promise.all([
    acc.createIndex({ email: 1 }, { unique: true }),
    acc.createIndex({ phoneDigits: 1 }, { unique: true, sparse: true }),
    prof.createIndex({ email: 1 }, { unique: true }),
    log.createIndex({ at: 1 }),
  ]);
}

export async function getAccountByEmail(email) {
  const acc = await accountsCollection();
  return acc.findOne({ email: normalizeEmail(email) });
}

export async function countAccounts() {
  const acc = await accountsCollection();
  return acc.countDocuments();
}

export async function countProfiles() {
  const prof = await profilesCollection();
  return prof.countDocuments();
}

export async function insertAccount(doc) {
  const acc = await accountsCollection();
  return acc.insertOne({ ...doc, email: normalizeEmail(doc.email) });
}

export async function upsertProfileByEmail(email, doc) {
  const prof = await profilesCollection();
  const e = normalizeEmail(email);
  const now = new Date().toISOString();
  const next = { ...doc, email: e, updatedAt: now };
  await prof.updateOne({ email: e }, { $setOnInsert: next }, { upsert: true });
  return prof.findOne({ email: e });
}

export async function getProfileByEmail(email) {
  const prof = await profilesCollection();
  return prof.findOne({ email: normalizeEmail(email) });
}

export async function updateProfileByEmail(email, setDoc) {
  const prof = await profilesCollection();
  const e = normalizeEmail(email);
  const now = new Date().toISOString();
  await prof.updateOne(
    { email: e },
    { $set: { ...setDoc, updatedAt: now }, $setOnInsert: { email: e } },
    { upsert: true },
  );
  return prof.findOne({ email: e });
}

export async function appendLoginEvent(atIso) {
  const log = await loginEventsCollection();
  const at = atIso || new Date().toISOString();
  await log.insertOne({ at });
}

export async function dailyCountsFromCollection(collName, dateField, days = 120) {
  const db = await getDb();
  const coll = db.collection(collName);
  // group by UTC day string YYYY-MM-DD
  const pipeline = [
    {
      $match: {
        [dateField]: { $type: "string" },
      },
    },
    {
      $addFields: {
        day: { $substrBytes: [`$${dateField}`, 0, 10] },
      },
    },
    { $group: { _id: "$day", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ];
  const rows = await coll.aggregate(pipeline).toArray();
  if (rows.length <= days) return rows;
  return rows.slice(-days);
}

export async function genderDonut() {
  const prof = await profilesCollection();
  const rows = await prof
    .aggregate([
      {
        $addFields: {
          g: {
            $cond: [
              { $or: [{ $eq: ["$gender", null] }, { $eq: ["$gender", ""] }] },
              "Not specified",
              "$gender",
            ],
          },
        },
      },
      { $group: { _id: "$g", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ])
    .toArray();

  const colorFor = (name) => {
    const n = String(name || "").trim().toLowerCase();
    if (n === "male") return "#29243b";
    if (n === "female") return "#0d9488";
    if (!n || n === "not specified") return "#94a3b8";
    return "#7c3aed";
  };

  return rows.map((r) => ({
    name: String(r._id || "Not specified"),
    value: r.value || 0,
    fill: colorFor(r._id),
  }));
}

export async function topProgrammingLanguages(limit = 12) {
  const prof = await profilesCollection();
  const rows = await prof
    .aggregate([
      { $match: { programmingLanguages: { $type: "array" } } },
      { $unwind: "$programmingLanguages" },
      {
        $addFields: {
          k: {
            $toLower: {
              $trim: { input: { $toString: "$programmingLanguages" } },
            },
          },
        },
      },
      { $match: { k: { $ne: "" } } },
      { $group: { _id: "$k", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ])
    .toArray();

  return rows.map((r) => ({
    name: r._id ? String(r._id).charAt(0).toUpperCase() + String(r._id).slice(1) : "",
    count: r.count || 0,
  }));
}

export { normalizeEmail };

