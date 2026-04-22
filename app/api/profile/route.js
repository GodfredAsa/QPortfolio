import { getProfilesArray, setProfilesArray } from "@/lib/serverDataStore";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

const OTHER_SOURCE_ALIASES = new Set(["bitbucket", "gitea"]);

function emptyHandles() {
  return {
    linkedIn: "",
    github: "",
    gitlab: "",
    otherSource: "bitbucket",
    otherSourceUrl: "",
  };
}

function sanitizeHandleUrl(s) {
  const t = String(s || "").trim();
  if (!t) return "";
  let u;
  try {
    u = new URL(t);
  } catch {
    throw new Error("Each link must be a valid http(s) URL.");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Use http or https URLs only.");
  }
  return u.href;
}

function normalizeHandlesFromBody(raw) {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("handles must be an object");
  }
  const linkedIn = sanitizeHandleUrl(raw.linkedIn);
  const github = sanitizeHandleUrl(raw.github);
  const gitlab = sanitizeHandleUrl(raw.gitlab);
  const otherSourceUrl = sanitizeHandleUrl(raw.otherSourceUrl);
  const otherSource = String(raw.otherSource || "bitbucket").toLowerCase();
  if (!OTHER_SOURCE_ALIASES.has(otherSource)) {
    throw new Error("otherSource must be bitbucket or gitea");
  }
  return {
    linkedIn,
    github,
    gitlab,
    otherSource,
    otherSourceUrl,
  };
}

function countWordsInString(s) {
  const t = String(s || "").trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

function sanitizeShortBioValue(raw) {
  const t = String(raw ?? "").trim();
  if (!t) return "";
  if (countWordsInString(t) > 100) {
    throw new Error("Short description must be 100 words or fewer.");
  }
  return t;
}

function emptyProfile(email) {
  return {
    email,
    gender: "",
    avatarId: "",
    imageUrl: "",
    profileMood: null,
    profession: "",
    shortBio: "",
    education: [],
    workExperiences: [],
    handles: emptyHandles(),
    programmingLanguages: [],
    databases: [],
    cloud: [],
    automation: [],
    tools: [],
    platforms: [],
    frameworks: [],
    updatedAt: new Date().toISOString(),
  };
}

async function readProfiles() {
  return getProfilesArray();
}

async function writeProfiles(profiles) {
  return setProfilesArray(profiles);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = normalizeEmail(searchParams.get("email"));
  if (!email) {
    return Response.json({ error: "email is required" }, { status: 400 });
  }

  try {
    const profiles = await readProfiles();
    const existing = profiles.find((p) => normalizeEmail(p.email) === email);
    if (existing) {
      const withHandles = {
        ...existing,
        profession: typeof existing.profession === "string" ? existing.profession : "",
        shortBio: typeof existing.shortBio === "string" ? existing.shortBio : "",
        handles:
          existing.handles && typeof existing.handles === "object"
            ? {
                ...emptyHandles(),
                ...existing.handles,
                otherSource:
                  existing.handles.otherSource === "gitea" ? "gitea" : "bitbucket",
              }
            : emptyHandles(),
      };
      return Response.json(withHandles, { status: 200 });
    }

    const created = emptyProfile(email);
    profiles.push(created);
    await writeProfiles(profiles);

    return Response.json(created, { status: 200 });
  } catch (e) {
    if (e && e.code === "VERCEL_NO_KV") {
      return Response.json({ error: e.message }, { status: 503 });
    }
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body?.email);
    const hasImageUrl = Object.prototype.hasOwnProperty.call(body || {}, "imageUrl");
    const hasGender = Object.prototype.hasOwnProperty.call(body || {}, "gender");
    const hasAvatarId = Object.prototype.hasOwnProperty.call(body || {}, "avatarId");
    const hasProfileMood = Object.prototype.hasOwnProperty.call(
      body || {},
      "profileMood",
    );
    const hasEducation = Object.prototype.hasOwnProperty.call(body || {}, "education");
    const hasWorkExperiences = Object.prototype.hasOwnProperty.call(
      body || {},
      "workExperiences",
    );
    const hasProgrammingLanguages = Object.prototype.hasOwnProperty.call(
      body || {},
      "programmingLanguages",
    );
    const hasDatabases = Object.prototype.hasOwnProperty.call(
      body || {},
      "databases",
    );
    const hasCloud = Object.prototype.hasOwnProperty.call(body || {}, "cloud");
    const hasAutomation = Object.prototype.hasOwnProperty.call(
      body || {},
      "automation",
    );
    const hasPlatforms = Object.prototype.hasOwnProperty.call(
      body || {},
      "platforms",
    );
    const hasFrameworks = Object.prototype.hasOwnProperty.call(
      body || {},
      "frameworks",
    );
    const hasTools = Object.prototype.hasOwnProperty.call(body || {}, "tools");
    const hasHandles = Object.prototype.hasOwnProperty.call(body || {}, "handles");
    const hasHeadline =
      Object.prototype.hasOwnProperty.call(body || {}, "profession") ||
      Object.prototype.hasOwnProperty.call(body || {}, "shortBio");
    const imageUrl = hasImageUrl ? String(body?.imageUrl || "").trim() : undefined;
    const gender = hasGender ? String(body?.gender || "").trim() : undefined;
    const avatarId = hasAvatarId ? String(body?.avatarId || "").trim() : undefined;
    const education = hasEducation ? body?.education : undefined;
    const profileMood = hasProfileMood ? body?.profileMood : undefined;
    const workExperiences = hasWorkExperiences ? body?.workExperiences : undefined;
    const programmingLanguages = hasProgrammingLanguages
      ? body?.programmingLanguages
      : undefined;
    const databases = hasDatabases ? body?.databases : undefined;
    const cloud = hasCloud ? body?.cloud : undefined;
    const automation = hasAutomation ? body?.automation : undefined;
    const platforms = hasPlatforms ? body?.platforms : undefined;
    const frameworks = hasFrameworks ? body?.frameworks : undefined;
    const tools = hasTools ? body?.tools : undefined;

    let handles;
    if (hasHandles) {
      try {
        handles = normalizeHandlesFromBody(body?.handles);
      } catch (e) {
        return Response.json(
          { error: e?.message || "Invalid handles" },
          { status: 400 },
        );
      }
    }

    let profession;
    let shortBio;
    if (hasHeadline) {
      profession = String(body?.profession ?? "").trim().slice(0, 200);
      try {
        shortBio = sanitizeShortBioValue(body?.shortBio);
      } catch (e) {
        return Response.json(
          { error: e?.message || "Invalid short description" },
          { status: 400 },
        );
      }
    }

    if (!email) {
      return Response.json({ error: "email is required" }, { status: 400 });
    }

    const profiles = await readProfiles();
    const idx = profiles.findIndex((p) => normalizeEmail(p.email) === email);

    if (hasEducation && !Array.isArray(education)) {
      return Response.json(
        { error: "education must be an array" },
        { status: 400 },
      );
    }

    if (hasWorkExperiences && !Array.isArray(workExperiences)) {
      return Response.json(
        { error: "workExperiences must be an array" },
        { status: 400 },
      );
    }

    if (hasProgrammingLanguages) {
      if (!Array.isArray(programmingLanguages)) {
        return Response.json(
          { error: "programmingLanguages must be an array" },
          { status: 400 },
        );
      }
      if (programmingLanguages.length > 5) {
        return Response.json(
          { error: "at most 5 programming languages allowed" },
          { status: 400 },
        );
      }
    }

    if (hasDatabases) {
      if (!Array.isArray(databases)) {
        return Response.json(
          { error: "databases must be an array" },
          { status: 400 },
        );
      }
      if (databases.length > 5) {
        return Response.json(
          { error: "at most 5 databases allowed" },
          { status: 400 },
        );
      }
    }

    if (hasCloud) {
      if (!Array.isArray(cloud)) {
        return Response.json({ error: "cloud must be an array" }, { status: 400 });
      }
      if (cloud.length > 5) {
        return Response.json(
          { error: "at most 5 cloud items allowed" },
          { status: 400 },
        );
      }
    }

    if (hasAutomation) {
      if (!Array.isArray(automation)) {
        return Response.json(
          { error: "automation must be an array" },
          { status: 400 },
        );
      }
      if (automation.length > 5) {
        return Response.json(
          { error: "at most 5 automation items allowed" },
          { status: 400 },
        );
      }
    }

    if (hasPlatforms) {
      if (!Array.isArray(platforms)) {
        return Response.json(
          { error: "platforms must be an array" },
          { status: 400 },
        );
      }
      if (platforms.length > 5) {
        return Response.json(
          { error: "at most 5 platforms allowed" },
          { status: 400 },
        );
      }
    }

    if (hasFrameworks) {
      if (!Array.isArray(frameworks)) {
        return Response.json(
          { error: "frameworks must be an array" },
          { status: 400 },
        );
      }
      if (frameworks.length > 5) {
        return Response.json(
          { error: "at most 5 frameworks allowed" },
          { status: 400 },
        );
      }
    }

    if (hasTools) {
      if (!Array.isArray(tools)) {
        return Response.json({ error: "tools must be an array" }, { status: 400 });
      }
      if (tools.length > 5) {
        return Response.json(
          { error: "at most 5 tools allowed" },
          { status: 400 },
        );
      }
    }

    if (hasProfileMood && profileMood !== null) {
      if (typeof profileMood !== "object" || Array.isArray(profileMood)) {
        return Response.json(
          { error: "profileMood must be null or an object" },
          { status: 400 },
        );
      }
      if (profileMood.type === "emoji") {
        if (typeof profileMood.value !== "string" || !profileMood.value.trim().length) {
          return Response.json(
            { error: "profileMood.value is required for emoji" },
            { status: 400 },
          );
        }
      } else if (profileMood.type === "avatar") {
        if (typeof profileMood.id !== "string" || !profileMood.id.length) {
          return Response.json(
            { error: "profileMood.id is required for avatar" },
            { status: 400 },
          );
        }
      } else {
        return Response.json(
          { error: "profileMood.type must be emoji or avatar" },
          { status: 400 },
        );
      }
    }

    function sanitizeIdArray(arr) {
      const seen = new Set();
      const out = [];
      for (const x of arr) {
        const s = String(x || "").trim();
        if (!s || seen.has(s)) continue;
        seen.add(s);
        out.push(s);
        if (out.length >= 5) break;
      }
      return out;
    }

    const prevProfile = idx >= 0 ? profiles[idx] : emptyProfile(email);
    const mergedHandles =
      prevProfile.handles && typeof prevProfile.handles === "object"
        ? {
            ...emptyHandles(),
            ...prevProfile.handles,
            otherSource:
              prevProfile.handles.otherSource === "gitea" ? "gitea" : "bitbucket",
          }
        : emptyHandles();

    const next = {
      ...prevProfile,
      email,
      profession: hasHeadline
        ? profession || ""
        : typeof prevProfile.profession === "string"
          ? prevProfile.profession
          : "",
      shortBio: hasHeadline
        ? shortBio || ""
        : typeof prevProfile.shortBio === "string"
          ? prevProfile.shortBio
          : "",
      ...(hasImageUrl ? { imageUrl } : {}),
      ...(hasGender ? { gender } : {}),
      ...(hasAvatarId ? { avatarId } : {}),
      ...(hasProfileMood ? { profileMood } : {}),
      ...(hasEducation ? { education } : {}),
      ...(hasWorkExperiences ? { workExperiences } : {}),
      ...(hasProgrammingLanguages
        ? { programmingLanguages: sanitizeIdArray(programmingLanguages) }
        : {}),
      ...(hasDatabases ? { databases: sanitizeIdArray(databases) } : {}),
      ...(hasCloud ? { cloud: sanitizeIdArray(cloud) } : {}),
      ...(hasAutomation ? { automation: sanitizeIdArray(automation) } : {}),
      ...(hasPlatforms ? { platforms: sanitizeIdArray(platforms) } : {}),
      ...(hasFrameworks ? { frameworks: sanitizeIdArray(frameworks) } : {}),
      ...(hasTools ? { tools: sanitizeIdArray(tools) } : {}),
      handles: hasHandles ? handles : mergedHandles,
      updatedAt: new Date().toISOString(),
    };

    if (idx >= 0) profiles[idx] = next;
    else profiles.push(next);

    await writeProfiles(profiles);

    return Response.json(next, { status: 200 });
  } catch (e) {
    if (e && e.code === "VERCEL_NO_KV") {
      return Response.json({ error: e.message }, { status: 503 });
    }
    return Response.json(
      { error: e && e.message ? String(e.message) : "Invalid request." },
      { status: 400 },
    );
  }
}

