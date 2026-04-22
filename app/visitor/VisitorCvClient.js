"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  AUTOMATION_OPTIONS,
  CLOUD_OPTIONS,
  DATABASE_OPTIONS,
  FRAMEWORK_OPTIONS,
  getIconsForSelectedIds,
  PLATFORM_OPTIONS,
  PROGRAMMING_LANGUAGE_OPTIONS,
  SIMPLE_ICONS_CDN,
  TOOLS_OPTIONS,
} from "@/lib/techOptions";
import { getSuperPowers, mapLegacyAvatarId } from "@/lib/superPowers";

/** One neumorphic “sheet” containing the full CV (template-style layout) */
const CV_SHEET =
  "overflow-hidden rounded-[28px] bg-[#ececec] p-5 shadow-[16px_16px_36px_rgba(0,0,0,0.11),-14px_-14px_32px_rgba(255,255,255,0.94)] sm:p-8 md:p-10 print:overflow-visible print:[print-color-adjust:exact] print:break-inside-auto";

const PDF_ACTION_PILL =
  "inline-flex items-center gap-2 rounded-full border-0 bg-[#ececec] px-4 py-2.5 text-sm font-semibold text-[#29243b] shadow-[12px_12px_24px_rgba(0,0,0,0.10),-12px_-12px_24px_rgba(255,255,255,0.92)] transition-transform hover:-translate-y-0.5";

const H_RULE = "border-0 border-t border-slate-400/45";

const SECTION_LABEL = "text-xs font-bold uppercase tracking-[0.2em] text-slate-800";

const SUB_LABEL = "mt-3 text-[11px] font-bold uppercase tracking-wide text-slate-500";

function memberSinceLabel(createdAt) {
  if (!createdAt) return null;
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

function MoodAvatarSticker({ id }) {
  const a = getSuperPowers().find((x) => x.id === mapLegacyAvatarId(id));
  if (!a) return null;
  return (
    <span className="inline-block h-7 w-7 overflow-hidden rounded-md align-middle sm:h-8 sm:w-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={a.dataUrl} alt="" className="h-full w-full object-cover" />
    </span>
  );
}

function formatPhone(phone) {
  if (phone == null || phone === "") return null;
  const d = String(phone).replace(/\D/g, "");
  if (d.length < 4) return d || null;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 10)}${d.length > 10 ? ` ${d.slice(10)}` : ""}`.trim();
}

function formatEduRange(e) {
  const start = e.startDate
    ? new Date(e.startDate + "T12:00:00").toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
      })
    : "";
  if (e.current) return start ? `${start} – Present` : "Present";
  const end = e.endDate
    ? new Date(e.endDate + "T12:00:00").toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
      })
    : "";
  if (start && end) return `${start} – ${end}`;
  return start || end || "";
}

const OTHER_SOURCE_META = {
  bitbucket: { label: "Bitbucket", simpleIcon: "bitbucket" },
  gitea: { label: "Gitea", simpleIcon: "gitea" },
};

function ContactLine({ value, children }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-end gap-2.5 text-sm text-slate-800">
      <span className="min-w-0 break-all text-right text-[13px] leading-snug">{value}</span>
      <span className="shrink-0 text-slate-500 [&_img]:h-3.5 [&_img]:w-3.5 [&_svg]:h-3.5 [&_svg]:w-3.5">
        {children}
      </span>
    </div>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500" aria-hidden>
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="2,6 12,13 22,6" />
    </svg>
  );
}

function IconFileDown({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="12" y1="18" x2="12" y2="11" />
      <polyline points="9,15 12,18 15,15" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500" aria-hidden>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export default function VisitorCvClient() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  const [profile, setProfile] = useState(null);
  const [account, setAccount] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(!!emailParam);

  useEffect(() => {
    if (!emailParam?.trim()) {
      setProfile(null);
      setAccount(null);
      setLoadError("");
      setLoading(false);
      return;
    }
    const email = emailParam.trim();
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [profRes, accRes] = await Promise.all([
          fetch(`/api/profile?email=${encodeURIComponent(email)}`, {
            cache: "no-store",
          }),
          fetch(`/api/accounts?email=${encodeURIComponent(email)}`, {
            cache: "no-store",
          }),
        ]);
        const prof = await profRes.json().catch(() => null);
        if (!profRes.ok || !prof) {
          throw new Error(prof?.error || "Could not load profile.");
        }
        if (cancelled) return;
        setProfile(prof);
        if (accRes.ok) {
          setAccount(await accRes.json());
        } else {
          setAccount({ email, fullName: null, phone: null, username: null });
        }
      } catch (e) {
        if (!cancelled) setLoadError(e?.message || "Something went wrong.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [emailParam]);

  const avatar = useMemo(() => {
    if (!profile) return null;
    const url = profile.imageUrl;
    if (url) return { type: "url", url };
    const powers = getSuperPowers();
    const id = mapLegacyAvatarId(profile.avatarId);
    const p = powers.find((x) => x.id === id) || powers[0];
    return p ? { type: "url", url: p.dataUrl } : null;
  }, [profile]);

  const superPowerName = useMemo(() => {
    if (!profile) return null;
    const id = mapLegacyAvatarId(profile.avatarId);
    const p = getSuperPowers().find((x) => x.id === id);
    return p?.label || null;
  }, [profile]);

  const displayName = account?.fullName?.trim() || null;
  const profLine = (profile?.profession || "").trim();
  const bio = (profile?.shortBio || "").trim();
  const handles = profile?.handles;

  if (!emailParam?.trim()) {
    return (
      <div className="mx-auto min-h-0 w-full max-w-3xl flex-1 px-4 py-12 sm:px-8">
        <div className="rounded-[32px] bg-[#ececec] p-8 text-center shadow-[18px_18px_42px_rgba(0,0,0,0.10),-18px_-18px_42px_rgba(255,255,255,0.95)] sm:p-10">
          <div className="mb-4 flex justify-center">
            <Image
              src="/logo.png"
              alt=""
              width={72}
              height={72}
              className="h-16 w-16 rounded-2xl object-contain"
              priority
            />
          </div>
          <h1 className="text-xl font-semibold text-[#29243b] sm:text-2xl">Public portfolio (CV) view</h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
            Add an email to the address bar to see someone&apos;s shared portfolio, e.g.{" "}
            <code className="rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-sm sm:text-base">
              /visitor?email=name@email.com
            </code>
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-1 items-center justify-center text-base text-slate-500">
        Loading…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <p className="rounded-2xl bg-red-100/50 px-4 py-3 text-base text-red-800">{loadError}</p>
      </div>
    );
  }

  if (!profile) return null;

  const edu = Array.isArray(profile.education) ? profile.education : [];
  const work = Array.isArray(profile.workExperiences) ? profile.workExperiences : [];
  const emailLine = (account?.email || emailParam || "").trim();
  const phoneLine = formatPhone(account?.phone);
  const skillGroups = [
    ["Languages", getIconsForSelectedIds(profile.programmingLanguages, PROGRAMMING_LANGUAGE_OPTIONS)],
    ["Frameworks", getIconsForSelectedIds(profile.frameworks, FRAMEWORK_OPTIONS)],
    ["Databases", getIconsForSelectedIds(profile.databases, DATABASE_OPTIONS)],
    ["Cloud & infra", getIconsForSelectedIds(profile.cloud, CLOUD_OPTIONS)],
    ["Platforms", getIconsForSelectedIds(profile.platforms, PLATFORM_OPTIONS)],
    ["Automation", getIconsForSelectedIds(profile.automation, AUTOMATION_OPTIONS)],
    ["Tools", getIconsForSelectedIds(profile.tools, TOOLS_OPTIONS)],
  ];

  const hasAnyTechnical = skillGroups.some(([, items]) => items?.length);

  const nameCaps = (displayName || emailLine || "Portfolio").toLocaleUpperCase();
  const titleCaps = (profLine || "Professional title").toLocaleUpperCase();

  function handleDownloadPdf() {
    window.print();
  }

  return (
    <div className="visitor-cv-page min-h-0 flex-1 bg-[#ececec] px-4 py-8 sm:px-8 sm:py-10 print:bg-[#ececec]">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-4 flex flex-wrap items-center justify-end gap-2 sm:mb-5 print:hidden">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className={PDF_ACTION_PILL}
            title="Opens your browser print dialog — choose &quot;Save as PDF&quot; (or &quot;Microsoft Print to PDF&quot;)."
            aria-label="Download as PDF. Opens the print dialog; pick Save as PDF or Microsoft Print to PDF."
          >
            <IconFileDown className="h-4 w-4 shrink-0" />
            Download PDF
          </button>
        </div>
        <article className={CV_SHEET} id="visitor-cv-print-root">
          {/* —— Header: name (left) + contact (right) —— */}
          <header className="grid grid-cols-1 gap-8 break-inside-avoid md:grid-cols-2 md:items-start md:gap-x-12 print:grid-cols-2 print:items-start print:gap-x-12">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                {avatar ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-slate-300/40 bg-white/30 shadow-[4px_4px_10px_rgba(0,0,0,0.06)] sm:h-20 sm:w-20 print:h-20 print:w-20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatar.url} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold uppercase leading-tight tracking-[0.12em] text-[#0a0a0a] sm:text-3xl md:text-4xl print:text-4xl">
                    {nameCaps}
                  </h1>
                  {profile?.profileMood?.type === "emoji" ? (
                    <span className="ml-1 text-2xl leading-none" role="img" aria-label="Mood">
                      {profile.profileMood.value}
                    </span>
                  ) : null}
                  {profile?.profileMood?.type === "avatar" ? (
                    <MoodAvatarSticker id={profile.profileMood.id} />
                  ) : null}
                </div>
              </div>
              <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-slate-600 sm:text-base print:text-base">
                {titleCaps}
              </p>
              <div className="mt-3 h-px w-full max-w-[12rem] bg-slate-500/50" />
            </div>

            <div className="flex min-w-0 flex-col gap-2 md:items-end md:text-right print:items-end print:text-right">
              {phoneLine ? (
                <ContactLine value={phoneLine}>
                  <IconPhone />
                </ContactLine>
              ) : null}
              {emailLine ? (
                <ContactLine value={emailLine}>
                  <IconMail />
                </ContactLine>
              ) : null}
              <ContactLine value="—">
                <IconHome />
              </ContactLine>
              {handles?.linkedIn ? (
                <a
                  href={handles.linkedIn}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-end gap-2.5 text-sm text-[#0e172a]"
                >
                  <span className="min-w-0 break-all text-right text-[13px] font-medium group-hover:underline">LinkedIn</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${SIMPLE_ICONS_CDN}/linkedin.svg`} alt="" className="h-3.5 w-3.5 opacity-80" />
                </a>
              ) : null}
              {handles?.github ? (
                <a
                  href={handles.github}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-end gap-2.5 text-sm text-[#0e172a]"
                >
                  <span className="min-w-0 break-all text-right text-[13px] font-medium group-hover:underline">GitHub</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${SIMPLE_ICONS_CDN}/github.svg`} alt="" className="h-3.5 w-3.5 opacity-80" />
                </a>
              ) : null}
              {handles?.gitlab ? (
                <a
                  href={handles.gitlab}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-end gap-2.5 text-sm text-[#0e172a]"
                >
                  <span className="min-w-0 break-all text-right text-[13px] font-medium group-hover:underline">GitLab</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${SIMPLE_ICONS_CDN}/gitlab.svg`} alt="" className="h-3.5 w-3.5 opacity-80" />
                </a>
              ) : null}
              {handles?.otherSourceUrl && OTHER_SOURCE_META[handles.otherSource || "bitbucket"] ? (
                <a
                  href={handles.otherSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-end gap-2.5 text-sm text-[#0e172a]"
                >
                  <span className="min-w-0 break-all text-right text-[13px] font-medium group-hover:underline">
                    {OTHER_SOURCE_META[handles.otherSource || "bitbucket"].label}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${SIMPLE_ICONS_CDN}/${OTHER_SOURCE_META[handles.otherSource || "bitbucket"].simpleIcon}.svg`}
                    alt=""
                    className="h-3.5 w-3.5 opacity-80"
                  />
                </a>
              ) : null}
            </div>
          </header>

          {/* —— Professional summary (full width, banded like classic CV) —— */}
          <div className="my-6 border-0 border-y border-slate-400/45 py-5 sm:my-8 sm:py-6 print:my-8 print:py-6" aria-label="Professional summary">
            {bio ? (
              <p className="text-justify text-[15px] italic leading-relaxed text-slate-700 sm:text-base print:text-base">{bio}</p>
            ) : (
              <p className="text-justify text-sm italic text-slate-500">
                Add a short professional summary on your profile to show it here.
              </p>
            )}
          </div>

          {/* —— Two columns: skills + education | work experience —— */}
          <div className="mt-6 grid grid-cols-1 gap-8 lg:mt-8 lg:grid-cols-12 lg:gap-0 lg:divide-x lg:divide-slate-400/40 print:mt-8 print:grid-cols-12 print:gap-0 print:divide-x print:divide-slate-400/40">
            {/* Left ~ 1/3 */}
            <div className="min-w-0 space-y-8 lg:col-span-4 lg:pr-8 print:col-span-4 print:pr-8">
              <section>
                <h2 className={SECTION_LABEL}>Core skills</h2>

                <div className={SUB_LABEL}>// Professional</div>
                <ul className="mt-1.5 list-none space-y-1 text-sm leading-relaxed text-slate-800">
                  {profLine ? <li>{profLine}</li> : null}
                  {superPowerName ? (
                    <li>
                      <span className="font-medium">Strength:</span> {superPowerName}
                    </li>
                  ) : null}
                  {account?.username ? (
                    <li>
                      <span className="font-medium">@</span>
                      {account.username}
                    </li>
                  ) : null}
                  {!profLine && !superPowerName && !account?.username ? (
                    <li className="text-slate-500">—</li>
                  ) : null}
                </ul>

                {hasAnyTechnical ? (
                  <>
                    <div className={SUB_LABEL}>// Technical</div>
                    <div className="mt-1.5 space-y-3 text-sm leading-relaxed text-slate-800">
                      {skillGroups.map(([label, items]) => {
                        if (!items?.length) return null;
                        const labels = items.map((x) => x.label).join(" · ");
                        return (
                          <p key={label}>
                            <span className="font-semibold text-slate-700">{label}:</span> {labels}
                          </p>
                        );
                      })}
                    </div>
                  </>
                ) : null}
              </section>

              {edu.length > 0 ? (
                <section>
                  <div className={`${H_RULE} mb-4 sm:mb-5`} />
                  <h2 className={SECTION_LABEL}>Education</h2>
                  <ul className="mt-3 space-y-4">
                    {edu.map((e) => {
                      if (typeof e === "string") {
                        return (
                          <li key={e} className="text-sm text-slate-800">
                            {e}
                          </li>
                        );
                      }
                      return (
                        <li key={e.id || e.schoolName}>
                          <p className="text-sm font-bold text-slate-900">{e.program || "Program"}</p>
                          <p className="text-sm text-slate-700">{e.schoolName || "—"}</p>
                          {formatEduRange(e) ? (
                            <p className="mt-0.5 text-sm text-slate-600">{formatEduRange(e)}</p>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}
            </div>

            {/* Right ~ 2/3 */}
            <div className="min-w-0 lg:col-span-8 lg:pl-8 print:col-span-8 print:pl-8">
              <section>
                <h2 className={SECTION_LABEL}>Work experience</h2>
                {work.length === 0 ? (
                  <p className="mt-3 text-sm italic text-slate-500">No work experience added yet.</p>
                ) : (
                  <ul className="mt-4 space-y-6">
                    {work.map((w) => {
                      if (typeof w === "string") {
                        return (
                          <li key={w} className="text-sm text-slate-800">
                            {w}
                          </li>
                        );
                      }
                      const duties = Array.isArray(w.duties) ? w.duties.filter((d) => String(d).trim()) : [];
                      const pos = (w.position || w.role || "").trim();
                      const comp = (w.companyName || w.company || "—").trim();
                      return (
                        <li key={w.id || w.companyName}>
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                            <span className="text-sm font-bold uppercase tracking-wide text-slate-900">
                              {pos || "Position"}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-slate-700">{comp}</p>
                          {duties.length > 0 ? (
                            <ul className="mt-2.5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-700">
                              {duties.map((d, i) => (
                                <li key={i} className="pl-0.5">
                                  {d}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          </div>

          {profile.updatedAt ? (
            <p className="mt-8 border-0 border-t border-slate-400/40 pt-4 text-center text-xs text-slate-500">
              Profile updated{" "}
              {new Date(profile.updatedAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          ) : null}
        </article>
      </div>
    </div>
  );
}
