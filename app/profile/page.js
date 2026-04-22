"use client";

import Link from "next/link";
import { Fragment, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_ADMIN_EMAIL } from "@/lib/adminConstants";
import { getSuperPowers, mapLegacyAvatarId } from "@/lib/superPowers";
import {
  AUTOMATION_OPTIONS,
  AUTOMATION_IDS,
  CLOUD_OPTIONS,
  CLOUD_IDS,
  DATABASE_OPTIONS,
  DATABASE_IDS,
  FRAMEWORK_OPTIONS,
  FRAMEWORK_IDS,
  optionIconSrc,
  PLATFORM_OPTIONS,
  PLATFORM_IDS,
  PROGRAMMING_LANGUAGE_OPTIONS,
  PROGRAMMING_LANG_IDS,
  normalizeProgrammingLanguageIds,
  normalizeTechIds,
  SIMPLE_ICONS_CDN,
  TOOLS_OPTIONS,
  TOOL_IDS,
} from "@/lib/techOptions";

function Card({ title, children, headerRight }) {
  return (
    <section className="rounded-[26px] bg-[#ececec] p-6 shadow-[14px_14px_28px_rgba(0,0,0,0.10),-14px_-14px_28px_rgba(255,255,255,0.92)]">
      <div className="flex min-h-[1.25rem] items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-700">{title}</div>
        {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
      </div>
      <div className="mt-3 text-sm text-slate-600">{children}</div>
    </section>
  );
}

/** Pill control: light neumorphic surface, dark copy — matches page shell */
const PROFILE_NEU_PILL =
  "inline-flex items-center justify-center gap-2 rounded-full border-0 bg-[#ececec] text-sm font-semibold text-[#29243b] shadow-[12px_12px_24px_rgba(0,0,0,0.10),-12px_-12px_24px_rgba(255,255,255,0.92)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_10px_10px_18px_rgba(0,0,0,0.10),inset_-10px_-10px_18px_rgba(255,255,255,0.92)] disabled:opacity-50";

const PROFILE_NEU_ICON_LG =
  "grid h-9 w-9 shrink-0 place-items-center rounded-full border-0 bg-[#ececec] text-[#29243b] shadow-[10px_10px_18px_rgba(0,0,0,0.10),-10px_-10px_18px_rgba(255,255,255,0.92)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_8px_8px_14px_rgba(0,0,0,0.10),inset_-8px_-8px_14px_rgba(255,255,255,0.92)] disabled:opacity-50 [&_svg]:stroke-[#29243b]";

const PROFILE_NEU_ICON_SM =
  "grid h-8 w-8 shrink-0 place-items-center rounded-full border-0 bg-[#ececec] text-[#29243b] shadow-[10px_10px_18px_rgba(0,0,0,0.10),-10px_-10px_18px_rgba(255,255,255,0.92)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_8px_8px_14px_rgba(0,0,0,0.10),inset_-8px_-8px_14px_rgba(255,255,255,0.92)] [&_svg]:stroke-[#29243b]";

const PROFILE_NEU_RING =
  "ring-2 ring-[#29243b]/55 ring-offset-2 ring-offset-[#ececec]";

const PROFILE_NEU_RING_COMPACT =
  "ring-2 ring-[#29243b]/55 ring-offset-1 ring-offset-[#ececec]";

function formatAccountPhone(phone) {
  if (phone == null || phone === "") return "—";
  const d = String(phone).replace(/\D/g, "");
  if (d.length < 4) return d || "—";
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 10)}${d.length > 10 ? ` ${d.slice(10)}` : ""}`.trim();
}

function memberSinceLabel(createdAt) {
  if (!createdAt) return null;
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

const DEFAULT_HANDLES = {
  linkedIn: "",
  github: "",
  gitlab: "",
  otherSource: "bitbucket",
  otherSourceUrl: "",
};

const PRIMARY_HANDLES = [
  {
    key: "linkedIn",
    label: "LinkedIn",
    simpleIcon: "linkedin",
    placeholder: "https://www.linkedin.com/in/…",
  },
  {
    key: "github",
    label: "GitHub",
    simpleIcon: "github",
    placeholder: "https://github.com/…",
  },
  {
    key: "gitlab",
    label: "GitLab",
    simpleIcon: "gitlab",
    placeholder: "https://gitlab.com/…",
  },
];

const OTHER_SOURCE_CHOICES = [
  { id: "bitbucket", label: "Bitbucket", simpleIcon: "bitbucket" },
  { id: "gitea", label: "Gitea", simpleIcon: "gitea" },
];

const HANDLE_INPUT =
  "w-full min-w-0 rounded-full bg-[#ececec] px-4 py-2.5 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none shadow-[inset_8px_8px_14px_rgba(0,0,0,0.08),inset_-5px_-5px_10px_rgba(255,255,255,0.92)]";

const LAST_EMAIL_KEY = "qp_last_email";

const PROFILE_MAIN_CARD =
  "rounded-[28px] bg-[#ececec] p-6 shadow-[14px_14px_28px_rgba(0,0,0,0.10),-14px_-14px_28px_rgba(255,255,255,0.92)] sm:p-8";

const PROFILE_FORM_LABEL = "text-xs font-semibold text-slate-500";

const PROFILE_PILL_INSET =
  "w-full min-w-0 rounded-full border-0 bg-[#ececec] px-4 py-3 text-sm text-slate-800 shadow-[inset_8px_8px_14px_rgba(0,0,0,0.08),inset_-5px_-5px_10px_rgba(255,255,255,0.92)]";

function profileNavClass(active) {
  return [
    "flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors",
    active
      ? "bg-white/50 text-[#29243b] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-2px_-2px_6px_rgba(255,255,255,0.9)]"
      : "text-slate-600 hover:bg-white/30 hover:text-[#29243b]",
  ].join(" ");
}

function IconUser({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconLogout({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16,17,21,12,16,7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconCopy({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconExternalLink({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15,3 21,3 21,9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function normalizeClientHandles(h) {
  if (!h || typeof h !== "object") return { ...DEFAULT_HANDLES };
  return {
    linkedIn: String(h.linkedIn || "").trim(),
    github: String(h.github || "").trim(),
    gitlab: String(h.gitlab || "").trim(),
    otherSource: h.otherSource === "gitea" ? "gitea" : "bitbucket",
    otherSourceUrl: String(h.otherSourceUrl || "").trim(),
  };
}

function countWords(s) {
  const t = String(s || "").trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

const HEADLINE_TEXTAREA =
  "w-full min-w-0 rounded-[20px] bg-[#ececec] px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-800 placeholder:text-slate-400 outline-none shadow-[inset_8px_8px_14px_rgba(0,0,0,0.08),inset_-5px_-5px_10px_rgba(255,255,255,0.92)] min-h-[6rem] max-h-48 resize-y";

function IconAdd({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconTrash({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

/** Floppy / save for Update actions */
function IconSave({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function blankEdu() {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    schoolName: "",
    program: "",
    startDate: "",
    endDate: "",
    current: false,
  };
}

function blankWork() {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    companyName: "",
    position: "",
    duties: ["", "", ""],
  };
}

function MaxFiveTechPicker({
  options,
  selectedIds,
  onToggle,
  onSave,
  saveState,
  saveButtonLabel,
  description,
}) {
  const atMax = selectedIds.length >= 5;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs text-slate-600">{description}</p>
        <div className="text-xs font-semibold text-slate-700">
          {selectedIds.length} / 5 selected
        </div>
      </div>
      {atMax ? (
        <p className="text-xs font-medium text-amber-800/90">
          Maximum reached — deselect one to choose another.
        </p>
      ) : null}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {options.map((o, i) => {
          const selected = selectedIds.includes(o.id);
          const dimmed = atMax && !selected;
          const showGroup =
            o.group &&
            (i === 0 || options[i - 1].group !== o.group);
          return (
            <Fragment key={o.id}>
              {showGroup ? (
                <div
                  className={[
                    "col-span-full -mb-0.5",
                    i > 0 ? "mt-3" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    {o.group}
                  </div>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => onToggle(o.id)}
                title={o.label}
                aria-pressed={selected}
                aria-label={o.label}
                disabled={saveState === "saving"}
                className={[
                  "flex flex-col items-center gap-1.5 rounded-[18px] bg-[#ececec] p-2.5 text-center transition-transform",
                  "shadow-[8px_8px_16px_rgba(0,0,0,0.08),-6px_-6px_12px_rgba(255,255,255,0.92)]",
                  "hover:-translate-y-0.5 active:translate-y-0",
                  selected
                    ? PROFILE_NEU_RING
                    : "ring-0",
                  dimmed ? "opacity-45" : "opacity-100",
                  saveState === "saving" ? "pointer-events-none opacity-60" : "",
                ].join(" ")}
              >
                <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-white/50 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-2px_-2px_6px_rgba(255,255,255,0.9)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={optionIconSrc(o)}
                  alt=""
                  className="h-8 w-8 object-contain"
                  loading="lazy"
                />
                </span>
                <span className="line-clamp-2 w-full text-[10px] font-semibold leading-tight text-[#29243b]/85">
                  {o.label}
                </span>
              </button>
            </Fragment>
          );
        })}
      </div>
      <div className="flex w-full flex-col items-end gap-1.5 pt-1">
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={saveState === "saving"}
            className={PROFILE_NEU_PILL + " px-6 py-3"}
            aria-label={saveButtonLabel}
          >
            <IconSave className="h-4 w-4 shrink-0" />
            {saveState === "saving" ? "Updating…" : "Update"}
          </button>
        </div>
        {saveState === "saved" ? (
          <span className="text-sm font-semibold text-slate-600">Updated</span>
        ) : null}
        {saveState === "error" ? (
          <span className="text-sm font-semibold text-red-700">Update failed</span>
        ) : null}
      </div>
    </div>
  );
}

function ProfilePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [accountInfo, setAccountInfo] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState("");

  const [educationDraft, setEducationDraft] = useState([]);
  const [eduSaveState, setEduSaveState] = useState("idle"); // idle | saving | saved | error

  const [workDraft, setWorkDraft] = useState([]);
  const [workSaveState, setWorkSaveState] = useState("idle"); // idle | saving | saved | error

  const [languagesDraft, setLanguagesDraft] = useState([]);
  const [langSaveState, setLangSaveState] = useState("idle");

  const [databasesDraft, setDatabasesDraft] = useState([]);
  const [dbSaveState, setDbSaveState] = useState("idle");
  const [cloudDraft, setCloudDraft] = useState([]);
  const [cloudSaveState, setCloudSaveState] = useState("idle");
  const [automationDraft, setAutomationDraft] = useState([]);
  const [automationSaveState, setAutomationSaveState] = useState("idle");
  const [platformsDraft, setPlatformsDraft] = useState([]);
  const [platformSaveState, setPlatformSaveState] = useState("idle");

  const [frameworksDraft, setFrameworksDraft] = useState([]);
  const [frameworkSaveState, setFrameworkSaveState] = useState("idle");

  const [toolsDraft, setToolsDraft] = useState([]);
  const [toolSaveState, setToolSaveState] = useState("idle");

  const [handlesDraft, setHandlesDraft] = useState(() => ({ ...DEFAULT_HANDLES }));
  const [handlesSaveState, setHandlesSaveState] = useState("idle");

  const [professionDraft, setProfessionDraft] = useState("");
  const [shortBioDraft, setShortBioDraft] = useState("");
  const [genderDraft, setGenderDraft] = useState("");
  const [headlineSaveState, setHeadlineSaveState] = useState("idle");
  const [genderSaveState, setGenderSaveState] = useState("idle");
  const [activeNav, setActiveNav] = useState("personal");
  const [siteOrigin, setSiteOrigin] = useState("");
  const [copyFlash, setCopyFlash] = useState(null);

  useEffect(() => {
    if (!email) router.replace("/login");
  }, [email, router]);

  useEffect(() => {
    if (!email) return;
    try {
      localStorage.setItem("qp_last_email", String(email).trim());
    } catch {
      /* ignore */
    }
  }, [email]);

  useEffect(() => {
    setSiteOrigin(typeof window !== "undefined" ? window.location.origin : "");
  }, []);

  useEffect(() => {
    if (!email) return;
    let cancelled = false;

    (async () => {
      try {
        setLoadError("");
        setAccountInfo(null);
        const [res, accRes] = await Promise.all([
          fetch(`/api/profile?email=${encodeURIComponent(email)}`),
          fetch(`/api/accounts?email=${encodeURIComponent(email)}`),
        ]);
        if (accRes.ok) {
          const acc = await accRes.json();
          if (!cancelled) setAccountInfo(acc);
        } else if (!cancelled) {
          setAccountInfo({
            email,
            fullName: null,
            phone: null,
            username: null,
            createdAt: null,
          });
        }
        if (cancelled) return;

        const data = await res.json().catch(() => null);
        if (!res.ok || !data) {
          throw new Error(data?.error || "Failed to load profile.");
        }

        setProfile(data);

        const existingEdu = Array.isArray(data?.education) ? data.education : [];
        const normalizedEdu = existingEdu.map((e) => {
          if (typeof e === "string") {
            return { ...blankEdu(), schoolName: e };
          }
          return {
            id: e?.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            schoolName: String(e?.schoolName || ""),
            program: String(e?.program || ""),
            startDate: String(e?.startDate || ""),
            endDate: String(e?.endDate || ""),
            current: Boolean(e?.current),
          };
        });
        setEducationDraft(normalizedEdu.length ? normalizedEdu : [blankEdu()]);

        const existingWork = Array.isArray(data?.workExperiences)
          ? data.workExperiences
          : [];
        const normalizedWork = existingWork.map((w) => {
          if (typeof w === "string") {
            return { ...blankWork(), companyName: w };
          }
          const duties = Array.isArray(w?.duties) ? w.duties.map(String) : [];
          const padded = [...duties, "", "", ""].slice(0, 3);
          return {
            id: w?.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            companyName: String(w?.companyName || w?.company || ""),
            position: String(w?.position || w?.role || ""),
            duties: padded,
          };
        });
        setWorkDraft(normalizedWork.length ? normalizedWork : [blankWork()]);

        setLanguagesDraft(
          normalizeProgrammingLanguageIds(data?.programmingLanguages),
        );
        setDatabasesDraft(
          normalizeTechIds(data?.databases, DATABASE_IDS, 5),
        );
        setCloudDraft(normalizeTechIds(data?.cloud, CLOUD_IDS, 5));
        setAutomationDraft(
          normalizeTechIds(data?.automation, AUTOMATION_IDS, 5),
        );
        setPlatformsDraft(
          normalizeTechIds(data?.platforms, PLATFORM_IDS, 5),
        );
        setFrameworksDraft(
          normalizeTechIds(data?.frameworks, FRAMEWORK_IDS, 5),
        );
        setToolsDraft(normalizeTechIds(data?.tools, TOOL_IDS, 5));
        setHandlesDraft(normalizeClientHandles(data?.handles));
        setProfessionDraft(String(data?.profession || ""));
        setShortBioDraft(String(data?.shortBio || ""));
        setGenderDraft(String(data?.gender || ""));
      } catch (e) {
        if (!cancelled) setLoadError(e?.message || "Failed to load profile.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [email]);

  if (!email) return null;

  function updateEdu(id, patch) {
    setEducationDraft((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  }

  function addEdu() {
    setEducationDraft((prev) => [...prev, blankEdu()]);
  }

  function deleteEdu(id) {
    setEducationDraft((prev) => {
      const next = prev.filter((e) => e.id !== id);
      return next.length ? next : [blankEdu()];
    });
  }

  async function onSaveEducation() {
    if (!email) return;
    try {
      setEduSaveState("saving");
      const cleaned = educationDraft.map((e) => ({
        id: e.id,
        schoolName: String(e.schoolName || "").trim(),
        program: String(e.program || "").trim(),
        startDate: String(e.startDate || "").trim(),
        endDate: e.current ? "" : String(e.endDate || "").trim(),
        current: Boolean(e.current),
      }));

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, education: cleaned }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.error || "Save failed.");
      setProfile(data);
      setEduSaveState("saved");
      window.setTimeout(() => setEduSaveState("idle"), 1500);
    } catch {
      setEduSaveState("error");
      window.setTimeout(() => setEduSaveState("idle"), 2000);
    }
  }

  function updateWork(id, patch) {
    setWorkDraft((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    );
  }

  function updateWorkDuty(workId, dutyIndex, value) {
    setWorkDraft((prev) =>
      prev.map((w) => {
        if (w.id !== workId) return w;
        const nextDuties = [...(w.duties || ["", "", ""])];
        nextDuties[dutyIndex] = value;
        return { ...w, duties: nextDuties };
      }),
    );
  }

  function addWork() {
    setWorkDraft((prev) => [...prev, blankWork()]);
  }

  function deleteWork(id) {
    setWorkDraft((prev) => {
      const next = prev.filter((w) => w.id !== id);
      return next.length ? next : [blankWork()];
    });
  }

  async function onSaveWork() {
    if (!email) return;
    try {
      setWorkSaveState("saving");
      const cleaned = workDraft.map((w) => ({
        id: w.id,
        companyName: String(w.companyName || "").trim(),
        position: String(w.position || "").trim(),
        duties: [0, 1, 2].map((i) => String(w.duties?.[i] || "").trim()),
      }));

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, workExperiences: cleaned }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.error || "Save failed.");
      setProfile(data);
      setWorkSaveState("saved");
      window.setTimeout(() => setWorkSaveState("idle"), 1500);
    } catch {
      setWorkSaveState("error");
      window.setTimeout(() => setWorkSaveState("idle"), 2000);
    }
  }

  function toggleMaxFive(setter, id) {
    setter((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  }

  async function saveTechField(apiKey, draft, idSet, setDraft, setSaveState) {
    if (!email) return;
    try {
      setSaveState("saving");
      const cleaned = normalizeTechIds(draft, idSet, 5);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, [apiKey]: cleaned }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.error || "Save failed.");
      setProfile(data);
      setDraft(normalizeTechIds(data[apiKey], idSet, 5));
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1500);
    } catch {
      setSaveState("error");
      window.setTimeout(() => setSaveState("idle"), 2000);
    }
  }

  async function saveHandles() {
    if (!email) return;
    try {
      setHandlesSaveState("saving");
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, handles: handlesDraft }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.error || "Save failed.");
      setProfile(data);
      setHandlesDraft(normalizeClientHandles(data.handles));
      setHandlesSaveState("saved");
      window.setTimeout(() => setHandlesSaveState("idle"), 1500);
    } catch {
      setHandlesSaveState("error");
      window.setTimeout(() => setHandlesSaveState("idle"), 2000);
    }
  }

  const shortBioWordCount = countWords(shortBioDraft);
  const shortBioOverLimit = shortBioWordCount > 100;

  const sidebarAvatar = useMemo(() => {
    if (!profile) return null;
    const url = profile.imageUrl;
    if (url) return { type: "url", url };
    const powers = getSuperPowers();
    const id = mapLegacyAvatarId(profile.avatarId);
    const p = powers.find((x) => x.id === id) || powers[0];
    return p ? { type: "url", url: p.dataUrl } : null;
  }, [profile]);

  const displayName = accountInfo?.fullName?.trim() || null;
  const professionLine = (professionDraft || "").trim() || (profile?.profession || "").trim() || "Your profession";

  const goToSection = useCallback((navKey, elId) => {
    setActiveNav(navKey);
    const el = document.getElementById(elId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const onLogout = useCallback(() => {
    try {
      localStorage.removeItem(LAST_EMAIL_KEY);
    } catch {
      /* ignore */
    }
    router.replace("/login");
  }, [router]);

  const copyToClipboard = useCallback(async (text, flashKey) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopyFlash(flashKey);
      window.setTimeout(() => {
        setCopyFlash((k) => (k === flashKey ? null : k));
      }, 2000);
    } catch {
      setCopyFlash("error");
      window.setTimeout(() => setCopyFlash(null), 2000);
    }
  }, []);

  async function saveHeadline() {
    if (!email) return;
    try {
      setHeadlineSaveState("saving");
      const shortBioPayload = shortBioOverLimit
        ? String(profile?.shortBio ?? "")
        : shortBioDraft;
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          profession: professionDraft,
          shortBio: shortBioPayload,
          gender: genderDraft,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.error || "Save failed.");
      setProfile(data);
      setProfessionDraft(String(data.profession || ""));
      setShortBioDraft(String(data.shortBio || ""));
      setGenderDraft(String(data.gender || ""));
      setHeadlineSaveState("saved");
      window.setTimeout(() => setHeadlineSaveState("idle"), 1500);
    } catch {
      setHeadlineSaveState("error");
      window.setTimeout(() => setHeadlineSaveState("idle"), 2000);
    }
  }

  async function saveGenderOnly() {
    if (!email) return;
    try {
      setGenderSaveState("saving");
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, gender: genderDraft }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.error || "Save failed.");
      setProfile(data);
      setGenderDraft(String(data.gender || ""));
      setGenderSaveState("saved");
      window.setTimeout(() => setGenderSaveState("idle"), 1500);
    } catch {
      setGenderSaveState("error");
      window.setTimeout(() => setGenderSaveState("idle"), 2000);
    }
  }

  const accountEmailTrimmed =
    accountInfo?.email && String(accountInfo.email).trim() ? String(accountInfo.email).trim() : "";
  const visitorPath = accountEmailTrimmed
    ? `/visitor?email=${encodeURIComponent(accountEmailTrimmed)}`
    : "";
  const visitorAbsoluteUrl = siteOrigin && visitorPath ? `${siteOrigin}${visitorPath}` : visitorPath;

  const showAdminAnalyticsLink = useMemo(() => {
    const e = String(accountInfo?.email || email || "")
      .trim()
      .toLowerCase();
    return Boolean(e && e === DEFAULT_ADMIN_EMAIL.toLowerCase());
  }, [accountInfo?.email, email]);

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-[#ececec] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-[min(20rem,100%)]">
          <div className={PROFILE_MAIN_CARD}>
            <div className="flex flex-col items-center text-center">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border border-slate-200/50 bg-white/30 shadow-[8px_8px_20px_rgba(0,0,0,0.08),-4px_-4px_12px_rgba(255,255,255,0.9)] sm:h-32 sm:w-32">
                {sidebarAvatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={sidebarAvatar.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-4xl text-slate-400">
                    …
                  </div>
                )}
              </div>
              <h2 className="mt-4 text-lg font-bold tracking-tight text-[#0e172a] sm:text-xl">
                {displayName || email || "Your name"}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{professionLine}</p>
            </div>

            <nav className="mt-6 space-y-1.5 border-t border-slate-300/30 pt-5" aria-label="Profile sections">
              <button
                type="button"
                onClick={() => goToSection("personal", "profile-section-personal")}
                className={profileNavClass(activeNav === "personal")}
              >
                <IconUser className="h-[18px] w-[18px] shrink-0" />
                Personal information
              </button>
              <button
                type="button"
                onClick={() => goToSection("links", "profile-section-links")}
                className={profileNavClass(activeNav === "links")}
              >
                <span className="grid h-[18px] w-[18px] shrink-0 place-items-center opacity-90" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </span>
                Profile links
              </button>
              <button
                type="button"
                onClick={() => goToSection("experience", "profile-section-experience")}
                className={profileNavClass(activeNav === "experience")}
              >
                <span className="grid h-[18px] w-[18px] shrink-0 place-items-center" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 20V10l8-4 8 4v10" />
                    <path d="M4 10l8 4 8-4" />
                    <path d="M12 6v12" />
                  </svg>
                </span>
                Education & work
              </button>
              <button
                type="button"
                onClick={() => goToSection("skills", "profile-section-skills")}
                className={profileNavClass(activeNav === "skills")}
              >
                <span className="grid h-[18px] w-[18px] shrink-0 place-items-center" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </span>
                Skills
              </button>
              {showAdminAnalyticsLink ? (
                <Link
                  href="/admin"
                  className={profileNavClass(false)}
                >
                  <span className="grid h-[18px] w-[18px] shrink-0 place-items-center" aria-hidden>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3v18h18" />
                      <path d="M7 16v-3" />
                      <path d="M12 16V8" />
                      <path d="M17 16v-6" />
                    </svg>
                  </span>
                  Analytics
                </Link>
              ) : null}
            </nav>

            <div className="mt-4 space-y-1.5 border-t border-slate-300/30 pt-4">
              <button type="button" onClick={onLogout} className={profileNavClass(false)}>
                <IconLogout className="h-[18px] w-[18px] shrink-0" />
                Log out
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          {profile ? (
            <section id="profile-section-personal" className="scroll-mt-24">
              <div className={PROFILE_MAIN_CARD}>
                <h1 className="text-xl font-bold text-[#0e172a] sm:text-2xl">Personal information</h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  Account details and how you describe yourself. Fields from signup are read-only; update headline and
                  description below.
                </p>

                {accountInfo ? (
                  <div className="mt-6 space-y-4">
                    {accountEmailTrimmed && visitorPath ? (
                      <div>
                        <div className={PROFILE_FORM_LABEL}>Public portfolio URL</div>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                          Share this link as your hosted CV with potential clients or customers. It&apos;s a read-only
                          view — the same address as{" "}
                          <code className="rounded bg-slate-200/60 px-1 font-mono text-[11px]">/visitor?email=…</code>
                        </p>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                          <div
                            className={
                              PROFILE_PILL_INSET +
                              " flex min-h-[2.75rem] min-w-0 flex-1 items-center gap-2 py-2.5"
                            }
                          >
                            <span className="min-w-0 flex-1 break-all text-sm font-medium text-slate-800">
                              {visitorAbsoluteUrl || visitorPath}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Link
                              href={visitorPath}
                              target="_blank"
                              rel="noreferrer"
                              className={PROFILE_NEU_ICON_SM}
                              title="Open public portfolio"
                              aria-label="Open public portfolio in new tab"
                            >
                              <IconExternalLink className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(visitorAbsoluteUrl, "url")}
                              className={PROFILE_NEU_ICON_SM}
                              title="Copy URL"
                              aria-label="Copy public portfolio URL"
                            >
                              <IconCopy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {copyFlash ? (
                      <p
                        className={[
                          "text-xs font-medium",
                          copyFlash === "error" ? "text-red-600" : "text-emerald-700",
                        ].join(" ")}
                        role="status"
                      >
                        {copyFlash === "error"
                          ? "Could not copy."
                          : "Copied to clipboard."}
                      </p>
                    ) : null}

                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Gender</div>
                      <button
                        type="button"
                        onClick={saveGenderOnly}
                        disabled={genderSaveState === "saving"}
                        className={PROFILE_NEU_PILL + " px-4 py-2 text-xs"}
                        aria-label="Save gender"
                      >
                        <IconSave className="h-3.5 w-3.5 shrink-0" />
                        {genderSaveState === "saving" ? "Saving…" : "Save gender"}
                      </button>
                    </div>
                    {genderSaveState === "saved" ? (
                      <p className="text-xs font-medium text-emerald-700" role="status">
                        Gender saved
                      </p>
                    ) : null}
                    {genderSaveState === "error" ? (
                      <p className="text-xs font-medium text-red-700" role="status">
                        Could not save gender
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                      {["Male", "Female"].map((g) => {
                        const checked = genderDraft === g;
                        return (
                          <label key={g} className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-800">
                            <input
                              type="radio"
                              name="profile-gender"
                              checked={checked}
                              onChange={() => setGenderDraft(g)}
                              className="h-4 w-4 accent-[#29243b]"
                            />
                            {g}
                          </label>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                      <div>
                        <div className={PROFILE_FORM_LABEL}>Full name</div>
                        <div className={PROFILE_PILL_INSET + " mt-1.5 text-slate-700"}>
                          {accountInfo.fullName?.trim() || "—"}
                        </div>
                      </div>
                      <div>
                        <div className={PROFILE_FORM_LABEL}>Username</div>
                        <div className={PROFILE_PILL_INSET + " mt-1.5 text-slate-700"}>
                          {accountInfo.username ? `@${accountInfo.username}` : "—"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className={PROFILE_FORM_LABEL}>Email</div>
                      <div
                        className={
                          PROFILE_PILL_INSET +
                          " mt-1.5 flex min-h-[2.75rem] items-center justify-between gap-2"
                        }
                      >
                        <span className="min-w-0 break-all text-slate-800">{accountInfo.email || "—"}</span>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                            Verified
                          </span>
                          {accountEmailTrimmed ? (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(accountEmailTrimmed, "email")}
                              className={PROFILE_NEU_ICON_SM}
                              title="Copy email"
                              aria-label="Copy email address"
                            >
                              <IconCopy className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                      <div>
                        <div className={PROFILE_FORM_LABEL}>Phone number</div>
                        <div className={PROFILE_PILL_INSET + " mt-1.5 text-slate-700"}>
                          {formatAccountPhone(accountInfo.phone)}
                        </div>
                      </div>
                      <div>
                        <div className={PROFILE_FORM_LABEL}>Member since</div>
                        <div className={PROFILE_PILL_INSET + " mt-1.5 text-slate-700"}>
                          {memberSinceLabel(accountInfo.createdAt) || "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 border-t border-slate-300/30 pt-6">
                  <div className="text-sm font-semibold text-slate-800">Role & summary</div>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
                    How you describe yourself in one line, plus a short intro (max 100 words).
                  </p>
                  <div className="mt-4">
                    <div className={PROFILE_FORM_LABEL}>Profession</div>
                    <input
                      type="text"
                      value={professionDraft}
                      onChange={(e) => setProfessionDraft(e.target.value)}
                      maxLength={200}
                      className={HANDLE_INPUT + " mt-1.5 font-medium text-slate-900"}
                      placeholder="e.g. Software engineer · Data analyst"
                    />
                  </div>
                  <div className="mt-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className={PROFILE_FORM_LABEL}>Short description</div>
                      <div
                        className={[
                          "text-xs font-medium tabular-nums",
                          shortBioOverLimit ? "text-red-600" : "text-slate-500",
                        ].join(" ")}
                      >
                        {shortBioWordCount} / 100 words
                      </div>
                    </div>
                    <textarea
                      value={shortBioDraft}
                      onChange={(e) => setShortBioDraft(e.target.value)}
                      className={HEADLINE_TEXTAREA + " mt-1.5"}
                      placeholder="A brief overview of your background, focus, and what you care about in your work…"
                      rows={5}
                      aria-label="Short profile description"
                    />
                  </div>
                  <div className="mt-4 flex w-full flex-col items-end gap-1.5">
                    <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={saveHeadline}
                        disabled={headlineSaveState === "saving"}
                        className={PROFILE_NEU_PILL + " px-6 py-2.5"}
                        aria-label="Update personal information"
                      >
                        <IconSave className="h-4 w-4 shrink-0" />
                        {headlineSaveState === "saving" ? "Updating…" : "Update"}
                      </button>
                    </div>
                    {headlineSaveState === "saved" ? (
                      <span className="text-sm font-semibold text-slate-600">Updated</span>
                    ) : null}
                    {headlineSaveState === "error" ? (
                      <span className="text-sm font-semibold text-red-700">Update failed</span>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

        {profile ? (
          <section id="profile-section-links" className="scroll-mt-24">
          <div
            className="w-full min-w-0 rounded-[20px] bg-[#ececec] p-5 shadow-[inset_8px_8px_14px_rgba(0,0,0,0.06),inset_-6px_-6px_12px_rgba(255,255,255,0.92)] sm:p-6"
          >
            <div className="text-base font-semibold text-slate-800">
              Profile links
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              Add public URLs. Pick Bitbucket or Gitea for one more repo host
              (besides GitHub and GitLab above).
            </p>
            <div className="mt-3 space-y-2.5">
              {PRIMARY_HANDLES.map((h) => (
                <div
                  key={h.key}
                  className="flex min-w-0 items-center gap-2.5 sm:gap-3"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-white/50 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.95)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${SIMPLE_ICONS_CDN}/${h.simpleIcon}.svg`}
                      alt=""
                      className="h-5 w-5 object-contain opacity-90"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold text-slate-500">
                      {h.label}
                    </div>
                    <input
                      type="url"
                      value={handlesDraft[h.key]}
                      onChange={(e) =>
                        setHandlesDraft((prev) => ({
                          ...prev,
                          [h.key]: e.target.value,
                        }))
                      }
                      className={HANDLE_INPUT + " mt-0.5"}
                      placeholder={h.placeholder}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-slate-300/30 pt-3">
              <div className="text-[10px] font-semibold text-slate-500">
                Extra source / hosting
              </div>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Choose one, then enter your profile or repo page URL
              </p>
              <div className="mt-2 flex flex-wrap justify-end gap-2">
                {OTHER_SOURCE_CHOICES.map((o) => {
                  const on = handlesDraft.otherSource === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() =>
                        setHandlesDraft((prev) => ({
                          ...prev,
                          otherSource: o.id,
                        }))
                      }
                      className={[
                        "inline-flex min-h-[2.5rem] items-center gap-1.5 rounded-full border-0 bg-[#ececec] px-3.5 py-1.5 text-left text-xs font-semibold text-[#29243b] transition-transform",
                        "shadow-[6px_6px_12px_rgba(0,0,0,0.06),-3px_-3px_8px_rgba(255,255,255,0.92)]",
                        on
                          ? PROFILE_NEU_RING_COMPACT
                          : "ring-0 opacity-90 hover:-translate-y-0.5 hover:opacity-100",
                      ].join(" ")}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${SIMPLE_ICONS_CDN}/${o.simpleIcon}.svg`}
                        alt=""
                        className={["h-4 w-4 object-contain", on ? "opacity-100" : "opacity-80"].join(" ")}
                      />
                      {o.label}
                    </button>
                  );
                })}
              </div>
              <input
                type="url"
                value={handlesDraft.otherSourceUrl}
                onChange={(e) =>
                  setHandlesDraft((prev) => ({
                    ...prev,
                    otherSourceUrl: e.target.value,
                  }))
                }
                className={HANDLE_INPUT + " mt-2"}
                placeholder={
                  handlesDraft.otherSource === "gitea"
                    ? "https://gitea.example.com/…"
                    : "https://bitbucket.org/…"
                }
              />
            </div>

            <div className="mt-3 flex w-full flex-col items-end gap-1.5 pt-1">
              <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={saveHandles}
                  disabled={handlesSaveState === "saving"}
                  className={PROFILE_NEU_PILL + " px-5 py-2.5"}
                  aria-label="Update profile links"
                >
                  <IconSave className="h-4 w-4 shrink-0" />
                  {handlesSaveState === "saving" ? "Updating…" : "Update"}
                </button>
              </div>
              {handlesSaveState === "saved" ? (
                <span className="text-sm font-semibold text-slate-600">Updated</span>
              ) : null}
              {handlesSaveState === "error" ? (
                <span className="text-sm font-semibold text-red-700">Update failed</span>
              ) : null}
            </div>
          </div>
          </section>
        ) : null}

        {loadError ? (
          <div className="mt-6 rounded-[22px] bg-[#ececec] px-5 py-4 text-sm text-red-700 shadow-[inset_10px_10px_18px_rgba(0,0,0,0.08),inset_-10px_-10px_18px_rgba(255,255,255,0.92)]">
            {loadError}
          </div>
        ) : null}

        <section id="profile-section-experience" className="scroll-mt-24">
        <div className="mt-2 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Card
            title="Education"
            headerRight={
              profile ? (
                <button
                  type="button"
                  onClick={addEdu}
                  className={PROFILE_NEU_ICON_LG}
                  aria-label="Add education"
                  title="Add education"
                >
                  <IconAdd />
                </button>
              ) : null
            }
          >
            {!profile ? (
              "Loading..."
            ) : (
              <div className="space-y-4">
                {educationDraft.map((e) => (
                  <div
                    key={e.id}
                    className="rounded-[22px] bg-[#ececec] p-4 shadow-[inset_10px_10px_18px_rgba(0,0,0,0.08),inset_-10px_-10px_18px_rgba(255,255,255,0.92)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold text-slate-600">Education</div>
                      <button
                        type="button"
                        onClick={() => deleteEdu(e.id)}
                        className={PROFILE_NEU_ICON_SM}
                        aria-label="Delete education"
                        title="Delete"
                      >
                        <IconTrash />
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-600">School name</div>
                        <input
                          value={e.schoolName}
                          onChange={(ev) => updateEdu(e.id, { schoolName: ev.target.value })}
                          className="mt-2 w-full rounded-full bg-[#ececec] px-5 py-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none shadow-[inset_10px_10px_18px_rgba(0,0,0,0.10),inset_-10px_-10px_18px_rgba(255,255,255,0.92)]"
                          placeholder="e.g. University of ..."
                        />
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-slate-600">Course / program</div>
                        <input
                          value={e.program}
                          onChange={(ev) => updateEdu(e.id, { program: ev.target.value })}
                          className="mt-2 w-full rounded-full bg-[#ececec] px-5 py-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none shadow-[inset_10px_10px_18px_rgba(0,0,0,0.10),inset_-10px_-10px_18px_rgba(255,255,255,0.92)]"
                          placeholder="e.g. BSc Computer Science"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <div className="text-xs font-semibold text-slate-600">Start date</div>
                          <input
                            type="date"
                            value={e.startDate}
                            onChange={(ev) => updateEdu(e.id, { startDate: ev.target.value })}
                            className="mt-2 w-full rounded-full bg-[#ececec] px-5 py-3 text-[13px] text-slate-700 outline-none shadow-[inset_10px_10px_18px_rgba(0,0,0,0.10),inset_-10px_-10px_18px_rgba(255,255,255,0.92)]"
                          />
                        </div>

                        {e.current ? null : (
                          <div>
                            <div className="text-xs font-semibold text-slate-600">End date</div>
                            <input
                              type="date"
                              value={e.endDate}
                              onChange={(ev) => updateEdu(e.id, { endDate: ev.target.value })}
                              className="mt-2 w-full rounded-full bg-[#ececec] px-5 py-3 text-[13px] text-slate-700 outline-none shadow-[inset_10px_10px_18px_rgba(0,0,0,0.10),inset_-10px_-10px_18px_rgba(255,255,255,0.92)]"
                            />
                          </div>
                        )}
                      </div>

                      <label className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                        <input
                          type="checkbox"
                          checked={e.current}
                          onChange={(ev) =>
                            updateEdu(e.id, {
                              current: ev.target.checked,
                              ...(ev.target.checked ? { endDate: "" } : {}),
                            })
                          }
                          className="h-4 w-4 accent-[#29243b]"
                        />
                        Currently in school
                      </label>
                    </div>
                  </div>
                ))}

                <div className="flex w-full flex-col items-end gap-1.5 pt-1">
                  <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={onSaveEducation}
                      disabled={eduSaveState === "saving"}
                      className={PROFILE_NEU_PILL + " px-6 py-3"}
                      aria-label="Update education entries"
                    >
                      <IconSave className="h-4 w-4 shrink-0" />
                      {eduSaveState === "saving" ? "Updating…" : "Update"}
                    </button>
                  </div>
                  {eduSaveState === "saved" ? (
                    <span className="text-sm font-semibold text-slate-600">Updated</span>
                  ) : null}
                  {eduSaveState === "error" ? (
                    <span className="text-sm font-semibold text-red-700">Update failed</span>
                  ) : null}
                </div>
              </div>
            )}
          </Card>

          <Card
            title="Work Experiences"
            headerRight={
              profile ? (
                <button
                  type="button"
                  onClick={addWork}
                  className={PROFILE_NEU_ICON_LG}
                  aria-label="Add work experience"
                  title="Add work experience"
                >
                  <IconAdd />
                </button>
              ) : null
            }
          >
            {!profile ? (
              "Loading..."
            ) : (
              <div className="space-y-4">
                {workDraft.map((w) => (
                  <div
                    key={w.id}
                    className="rounded-[22px] bg-[#ececec] p-4 shadow-[inset_10px_10px_18px_rgba(0,0,0,0.08),inset_-10px_-10px_18px_rgba(255,255,255,0.92)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold text-slate-600">
                        Work experience
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteWork(w.id)}
                        className={PROFILE_NEU_ICON_SM}
                        aria-label="Delete work experience"
                        title="Delete"
                      >
                        <IconTrash />
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-600">
                          Company name
                        </div>
                        <input
                          value={w.companyName}
                          onChange={(ev) =>
                            updateWork(w.id, { companyName: ev.target.value })
                          }
                          className="mt-2 w-full rounded-full bg-[#ececec] px-5 py-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none shadow-[inset_10px_10px_18px_rgba(0,0,0,0.10),inset_-10px_-10px_18px_rgba(255,255,255,0.92)]"
                          placeholder="e.g. Acme Inc."
                        />
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-slate-600">
                          Position held
                        </div>
                        <input
                          value={w.position}
                          onChange={(ev) =>
                            updateWork(w.id, { position: ev.target.value })
                          }
                          className="mt-2 w-full rounded-full bg-[#ececec] px-5 py-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none shadow-[inset_10px_10px_18px_rgba(0,0,0,0.10),inset_-10px_-10px_18px_rgba(255,255,255,0.92)]"
                          placeholder="e.g. Software Engineer"
                        />
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-slate-600">
                          Duties (3 bullets)
                        </div>
                        <div className="mt-2 space-y-2">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="flex items-start gap-2">
                              <div className="mt-3 h-2 w-2 shrink-0 rounded-full bg-slate-500" />
                              <input
                                value={w.duties?.[i] || ""}
                                onChange={(ev) =>
                                  updateWorkDuty(w.id, i, ev.target.value)
                                }
                                className="w-full rounded-full bg-[#ececec] px-5 py-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none shadow-[inset_10px_10px_18px_rgba(0,0,0,0.10),inset_-10px_-10px_18px_rgba(255,255,255,0.92)]"
                                placeholder={`Duty ${i + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex w-full flex-col items-end gap-1.5 pt-1">
                  <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={onSaveWork}
                      disabled={workSaveState === "saving"}
                      className={PROFILE_NEU_PILL + " px-6 py-3"}
                      aria-label="Update work experience entries"
                    >
                      <IconSave className="h-4 w-4 shrink-0" />
                      {workSaveState === "saving" ? "Updating…" : "Update"}
                    </button>
                  </div>
                  {workSaveState === "saved" ? (
                    <span className="text-sm font-semibold text-slate-600">Updated</span>
                  ) : null}
                  {workSaveState === "error" ? (
                    <span className="text-sm font-semibold text-red-700">Update failed</span>
                  ) : null}
                </div>
              </div>
            )}
          </Card>
        </div>
        </section>

        <section id="profile-section-skills" className="scroll-mt-24">
        <div className="mt-2 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Card title="Programming languages">
            {!profile ? (
              "Loading..."
            ) : (
              <MaxFiveTechPicker
                options={PROGRAMMING_LANGUAGE_OPTIONS}
                selectedIds={languagesDraft}
                onToggle={(id) => toggleMaxFive(setLanguagesDraft, id)}
                onSave={() =>
                  saveTechField(
                    "programmingLanguages",
                    languagesDraft,
                    PROGRAMMING_LANG_IDS,
                    setLanguagesDraft,
                    setLangSaveState,
                  )
                }
                saveState={langSaveState}
                  saveButtonLabel="Update programming languages"
                description={
                  <>
                    Add up to{" "}
                    <span className="font-semibold text-slate-700">5</span>{" "}
                    languages you use day to day.
                  </>
                }
              />
            )}
          </Card>
          <Card title="Databases">
            {!profile ? (
              "Loading..."
            ) : (
              <MaxFiveTechPicker
                options={DATABASE_OPTIONS}
                selectedIds={databasesDraft}
                onToggle={(id) => toggleMaxFive(setDatabasesDraft, id)}
                onSave={() =>
                  saveTechField(
                    "databases",
                    databasesDraft,
                    DATABASE_IDS,
                    setDatabasesDraft,
                    setDbSaveState,
                  )
                }
                saveState={dbSaveState}
                saveButtonLabel="Update databases"
                description={
                  <>
                    List up to{" "}
                    <span className="font-semibold text-slate-700">5</span>{" "}
                    databases you work with.
                  </>
                }
              />
            )}
          </Card>
          <Card title="Cloud">
            {!profile ? (
              "Loading..."
            ) : (
              <MaxFiveTechPicker
                options={CLOUD_OPTIONS}
                selectedIds={cloudDraft}
                onToggle={(id) => toggleMaxFive(setCloudDraft, id)}
                onSave={() =>
                  saveTechField(
                    "cloud",
                    cloudDraft,
                    CLOUD_IDS,
                    setCloudDraft,
                    setCloudSaveState,
                  )
                }
                saveState={cloudSaveState}
                saveButtonLabel="Update cloud platforms"
                description={
                  <>
                    Up to <span className="font-semibold text-slate-700">5</span>{" "}
                    — cloud providers, edge, and hosting you use.
                  </>
                }
              />
            )}
          </Card>
          <Card title="Automation">
            {!profile ? (
              "Loading..."
            ) : (
              <MaxFiveTechPicker
                options={AUTOMATION_OPTIONS}
                selectedIds={automationDraft}
                onToggle={(id) => toggleMaxFive(setAutomationDraft, id)}
                onSave={() =>
                  saveTechField(
                    "automation",
                    automationDraft,
                    AUTOMATION_IDS,
                    setAutomationDraft,
                    setAutomationSaveState,
                  )
                }
                saveState={automationSaveState}
                saveButtonLabel="Update automation tools"
                description={
                  <>
                    Up to <span className="font-semibold text-slate-700">5</span>{" "}
                    — testing, CI/CD, and infrastructure-as-code.
                  </>
                }
              />
            )}
          </Card>
          <Card title="Tools">
            {!profile ? (
              "Loading..."
            ) : (
              <MaxFiveTechPicker
                options={TOOLS_OPTIONS}
                selectedIds={toolsDraft}
                onToggle={(id) => toggleMaxFive(setToolsDraft, id)}
                onSave={() =>
                  saveTechField(
                    "tools",
                    toolsDraft,
                    TOOL_IDS,
                    setToolsDraft,
                    setToolSaveState,
                  )
                }
                saveState={toolSaveState}
                saveButtonLabel="Update dev tools"
                description={
                  <>
                    Up to <span className="font-semibold text-slate-700">5</span>{" "}
                    — analytics, APIs, and everyday dev tools.
                  </>
                }
              />
            )}
          </Card>
          <Card title="Platforms">
            {!profile ? (
              "Loading..."
            ) : (
              <MaxFiveTechPicker
                options={PLATFORM_OPTIONS}
                selectedIds={platformsDraft}
                onToggle={(id) => toggleMaxFive(setPlatformsDraft, id)}
                onSave={() =>
                  saveTechField(
                    "platforms",
                    platformsDraft,
                    PLATFORM_IDS,
                    setPlatformsDraft,
                    setPlatformSaveState,
                  )
                }
                saveState={platformSaveState}
                saveButtonLabel="Update platforms"
                description={
                  <>
                    Up to <span className="font-semibold text-slate-700">5</span>{" "}
                    OS, servers, and environments you use.
                  </>
                }
              />
            )}
          </Card>
          <Card title="Frameworks">
            {!profile ? (
              "Loading..."
            ) : (
              <MaxFiveTechPicker
                options={FRAMEWORK_OPTIONS}
                selectedIds={frameworksDraft}
                onToggle={(id) => toggleMaxFive(setFrameworksDraft, id)}
                onSave={() =>
                  saveTechField(
                    "frameworks",
                    frameworksDraft,
                    FRAMEWORK_IDS,
                    setFrameworksDraft,
                    setFrameworkSaveState,
                  )
                }
                saveState={frameworkSaveState}
                saveButtonLabel="Update frameworks"
                description={
                  <>
                    Up to <span className="font-semibold text-slate-700">5</span>{" "}
                    — mix and match from the groups in the list.
                  </>
                }
              />
            )}
          </Card>
        </div>
        </section>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100dvh-3.5rem)] flex-1 items-center justify-center bg-[#ececec] text-sm text-slate-500">
          Loading…
        </div>
      }
    >
      <ProfilePageInner />
    </Suspense>
  );
}
