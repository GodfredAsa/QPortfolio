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
  return db.collection("profiles"); // legacy monolithic profile doc (migration source)
}

export async function loginEventsCollection() {
  const db = await getDb();
  return db.collection("login_events");
}

export async function profilePersonalCollection() {
  const db = await getDb();
  return db.collection("profile_personal");
}

export async function profileLinksCollection() {
  const db = await getDb();
  return db.collection("profile_links");
}

export async function profileEducationCollection() {
  const db = await getDb();
  return db.collection("profile_education");
}

export async function profileWorkCollection() {
  const db = await getDb();
  return db.collection("profile_work");
}

export async function profileSkillsCollection() {
  const db = await getDb();
  return db.collection("profile_skills");
}

export async function ensureMongoIndexes() {
  const [acc, legacyProf, log, personal, links, edu, work, skills] = await Promise.all([
    accountsCollection(),
    profilesCollection(),
    loginEventsCollection(),
    profilePersonalCollection(),
    profileLinksCollection(),
    profileEducationCollection(),
    profileWorkCollection(),
    profileSkillsCollection(),
  ]);

  await Promise.all([
    acc.createIndex({ email: 1 }, { unique: true }),
    acc.createIndex({ phoneDigits: 1 }, { unique: true, sparse: true }),
    acc.createIndex({ status: 1, createdAt: 1 }),
    legacyProf.createIndex({ email: 1 }, { unique: true }),
    log.createIndex({ at: 1 }),
    personal.createIndex({ email: 1 }, { unique: true }),
    links.createIndex({ email: 1 }, { unique: true }),
    edu.createIndex({ email: 1 }, { unique: true }),
    work.createIndex({ email: 1 }, { unique: true }),
    skills.createIndex({ email: 1 }, { unique: true }),
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
  // Treat the personal card as the “primary” profile record.
  const personal = await profilePersonalCollection();
  return personal.countDocuments();
}

export async function insertAccount(doc) {
  const acc = await accountsCollection();
  return acc.insertOne({ ...doc, email: normalizeEmail(doc.email) });
}

export const ACCOUNT_STATUSES = ["PENDING", "APPROVED", "LOCKED"];

export function normalizeAccountStatus(raw) {
  const t = String(raw || "").trim().toUpperCase();
  if (t === "APPROVED") return "APPROVED";
  if (t === "LOCKED") return "LOCKED";
  return "PENDING";
}

export async function listAccountsForAdmin() {
  const acc = await accountsCollection();
  const docs = await acc
    .find({}, { projection: { _id: 0, passwordHash: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map((d) => ({
    ...d,
    status: normalizeAccountStatus(d.status),
  }));
}

export async function listAccountsForAdminPaged({ page = 1, pageSize = 20, q = "" } = {}) {
  const acc = await accountsCollection();
  const safePageSize = Math.max(5, Math.min(100, Number(pageSize) || 20));
  const safePage = Math.max(1, Number(page) || 1);
  const skip = (safePage - 1) * safePageSize;
  const term = String(q || "").trim();

  const filter = term
    ? {
        $or: [
          { email: { $regex: term, $options: "i" } },
          { fullName: { $regex: term, $options: "i" } },
          { username: { $regex: term, $options: "i" } },
        ],
      }
    : {};

  const projection = { _id: 0, passwordHash: 0 };

  const [total, docs, statusRows] = await Promise.all([
    acc.countDocuments(filter),
    acc
      .find(filter, { projection })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safePageSize)
      .toArray(),
    acc
      .aggregate([
        { $match: filter },
        {
          $addFields: {
            s: {
              $cond: [
                { $or: [{ $eq: ["$status", null] }, { $eq: ["$status", ""] }] },
                "PENDING",
                "$status",
              ],
            },
          },
        },
        { $group: { _id: "$s", count: { $sum: 1 } } },
      ])
      .toArray(),
  ]);

  const accounts = docs.map((d) => ({ ...d, status: normalizeAccountStatus(d.status) }));
  const statusCounts = { PENDING: 0, APPROVED: 0, LOCKED: 0 };
  for (const r of statusRows) {
    const k = normalizeAccountStatus(r?._id);
    statusCounts[k] = Number(r?.count) || 0;
  }

  return {
    page: safePage,
    pageSize: safePageSize,
    total,
    accounts,
    statusCounts,
  };
}

export async function setAccountStatusByEmail(email, status) {
  const acc = await accountsCollection();
  const e = normalizeEmail(email);
  const next = normalizeAccountStatus(status);
  await acc.updateOne(
    { email: e },
    { $set: { status: next, statusUpdatedAt: new Date().toISOString() } },
  );
  const doc = await acc.findOne({ email: e }, { projection: { _id: 0, passwordHash: 0 } });
  if (!doc) return null;
  return { ...doc, status: normalizeAccountStatus(doc.status) };
}

export async function getLegacyProfileByEmail(email) {
  const legacy = await profilesCollection();
  return legacy.findOne({ email: normalizeEmail(email) });
}

export async function upsertLegacyProfileView(email, viewDoc) {
  const legacy = await profilesCollection();
  const e = normalizeEmail(email);
  const now = new Date().toISOString();
  const clean =
    viewDoc && typeof viewDoc === "object" && !Array.isArray(viewDoc)
      ? { ...viewDoc }
      : {};
  delete clean._id;
  delete clean.email;
  await legacy.updateOne(
    { email: e },
    { $set: { ...clean, updatedAt: now }, $setOnInsert: { email: e } },
    { upsert: true },
  );
  return legacy.findOne({ email: e });
}

function emptyHandles() {
  return {
    linkedIn: "",
    github: "",
    gitlab: "",
    otherSource: "bitbucket",
    otherSourceUrl: "",
  };
}

export function emptyProfileCards(email) {
  const e = normalizeEmail(email);
  const now = new Date().toISOString();
  return {
    personal: {
      email: e,
      gender: "",
      avatarId: "",
      imageUrl: "",
      profileMood: null,
      profession: "",
      shortBio: "",
      updatedAt: now,
    },
    links: {
      email: e,
      handles: emptyHandles(),
      updatedAt: now,
    },
    education: {
      email: e,
      education: [],
      updatedAt: now,
    },
    work: {
      email: e,
      workExperiences: [],
      updatedAt: now,
    },
    skills: {
      email: e,
      programmingLanguages: [],
      databases: [],
      cloud: [],
      automation: [],
      tools: [],
      platforms: [],
      frameworks: [],
      updatedAt: now,
    },
  };
}

export async function getProfileCardsByEmail(email) {
  const e = normalizeEmail(email);
  const [personal, links, education, work, skills] = await Promise.all([
    profilePersonalCollection().then((c) => c.findOne({ email: e })),
    profileLinksCollection().then((c) => c.findOne({ email: e })),
    profileEducationCollection().then((c) => c.findOne({ email: e })),
    profileWorkCollection().then((c) => c.findOne({ email: e })),
    profileSkillsCollection().then((c) => c.findOne({ email: e })),
  ]);
  return { personal, links, education, work, skills };
}

async function upsertCard(collPromise, email, doc) {
  const coll = await collPromise;
  const e = normalizeEmail(email);
  const now = new Date().toISOString();
  const { email: _ignoreEmail, _id: _ignoreId, ...rest } =
    doc && typeof doc === "object" && !Array.isArray(doc) ? doc : {};
  await coll.updateOne(
    { email: e },
    { $set: { ...rest, updatedAt: now }, $setOnInsert: { email: e } },
    { upsert: true },
  );
  return coll.findOne({ email: e });
}

export async function upsertPersonal(email, doc) {
  return upsertCard(profilePersonalCollection(), email, doc);
}
export async function upsertLinks(email, doc) {
  return upsertCard(profileLinksCollection(), email, doc);
}
export async function upsertEducation(email, doc) {
  return upsertCard(profileEducationCollection(), email, doc);
}
export async function upsertWork(email, doc) {
  return upsertCard(profileWorkCollection(), email, doc);
}
export async function upsertSkills(email, doc) {
  return upsertCard(profileSkillsCollection(), email, doc);
}

export async function ensureProfileCardsExist(email) {
  const cards = await getProfileCardsByEmail(email);
  const empties = emptyProfileCards(email);
  await Promise.all([
    cards.personal ? null : upsertPersonal(email, empties.personal),
    cards.links ? null : upsertLinks(email, empties.links),
    cards.education ? null : upsertEducation(email, empties.education),
    cards.work ? null : upsertWork(email, empties.work),
    cards.skills ? null : upsertSkills(email, empties.skills),
  ]);
}

export async function migrateLegacyProfileToCardsIfNeeded(email) {
  const e = normalizeEmail(email);
  const existing = await getProfileCardsByEmail(e);
  if (existing.personal && existing.links && existing.education && existing.work && existing.skills) {
    return;
  }
  const legacy = await getLegacyProfileByEmail(e);
  if (!legacy) {
    return;
  }
  const base = emptyProfileCards(e);
  const personal = {
    ...base.personal,
    gender: typeof legacy.gender === "string" ? legacy.gender : "",
    avatarId: typeof legacy.avatarId === "string" ? legacy.avatarId : "",
    imageUrl: typeof legacy.imageUrl === "string" ? legacy.imageUrl : "",
    profileMood: legacy.profileMood ?? null,
    profession: typeof legacy.profession === "string" ? legacy.profession : "",
    shortBio: typeof legacy.shortBio === "string" ? legacy.shortBio : "",
  };
  const links = {
    ...base.links,
    handles: legacy.handles && typeof legacy.handles === "object" ? { ...base.links.handles, ...legacy.handles } : base.links.handles,
  };
  const education = {
    ...base.education,
    education: Array.isArray(legacy.education) ? legacy.education : [],
  };
  const work = {
    ...base.work,
    workExperiences: Array.isArray(legacy.workExperiences) ? legacy.workExperiences : [],
  };
  const skills = {
    ...base.skills,
    programmingLanguages: Array.isArray(legacy.programmingLanguages) ? legacy.programmingLanguages : [],
    databases: Array.isArray(legacy.databases) ? legacy.databases : [],
    cloud: Array.isArray(legacy.cloud) ? legacy.cloud : [],
    automation: Array.isArray(legacy.automation) ? legacy.automation : [],
    tools: Array.isArray(legacy.tools) ? legacy.tools : [],
    platforms: Array.isArray(legacy.platforms) ? legacy.platforms : [],
    frameworks: Array.isArray(legacy.frameworks) ? legacy.frameworks : [],
  };

  await Promise.all([
    existing.personal ? null : upsertPersonal(e, personal),
    existing.links ? null : upsertLinks(e, links),
    existing.education ? null : upsertEducation(e, education),
    existing.work ? null : upsertWork(e, work),
    existing.skills ? null : upsertSkills(e, skills),
  ]);
}

export async function getFullProfileView(email) {
  const e = normalizeEmail(email);
  const { personal, links, education, work, skills } = await getProfileCardsByEmail(e);
  const base = emptyProfileCards(e);
  const p = personal || base.personal;
  const l = links || base.links;
  const ed = education || base.education;
  const w = work || base.work;
  const s = skills || base.skills;

  const updatedAt = [p.updatedAt, l.updatedAt, ed.updatedAt, w.updatedAt, s.updatedAt]
    .filter(Boolean)
    .sort()
    .slice(-1)[0] || new Date().toISOString();

  return {
    email: e,
    gender: p.gender || "",
    avatarId: p.avatarId || "",
    imageUrl: p.imageUrl || "",
    profileMood: p.profileMood ?? null,
    profession: p.profession || "",
    shortBio: p.shortBio || "",
    education: Array.isArray(ed.education) ? ed.education : [],
    workExperiences: Array.isArray(w.workExperiences) ? w.workExperiences : [],
    handles: l.handles && typeof l.handles === "object" ? { ...base.links.handles, ...l.handles } : base.links.handles,
    programmingLanguages: Array.isArray(s.programmingLanguages) ? s.programmingLanguages : [],
    databases: Array.isArray(s.databases) ? s.databases : [],
    cloud: Array.isArray(s.cloud) ? s.cloud : [],
    automation: Array.isArray(s.automation) ? s.automation : [],
    tools: Array.isArray(s.tools) ? s.tools : [],
    platforms: Array.isArray(s.platforms) ? s.platforms : [],
    frameworks: Array.isArray(s.frameworks) ? s.frameworks : [],
    updatedAt,
  };
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
  const personal = await profilePersonalCollection();
  const rows = await personal
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
  const skills = await profileSkillsCollection();
  const rows = await skills
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

