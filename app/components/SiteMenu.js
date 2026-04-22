"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { MOOD_PICKER_EMOJIS } from "@/lib/moodEmojis";
import { getSuperPowers, mapLegacyAvatarId } from "@/lib/superPowers";

const LAST_EMAIL_KEY = "qp_last_email";

const pill =
  "rounded-full border-0 bg-[#ececec] text-sm font-semibold text-[#29243b] shadow-[8px_8px_16px_rgba(0,0,0,0.08),-6px_-6px_12px_rgba(255,255,255,0.92)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_6px_6px_10px_rgba(0,0,0,0.08),inset_-4px_-4px_8px_rgba(255,255,255,0.92)]";

const sectionTitle =
  "text-[10px] font-bold uppercase tracking-wider text-slate-500";

const navClass = (active) =>
  [
    "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors",
    active
      ? "bg-white/50 text-[#29243b] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-2px_-2px_6px_rgba(255,255,255,0.9)]"
      : "text-slate-600 hover:bg-white/30 hover:text-[#29243b]",
  ].join(" ");

function IconMenu({ open }) {
  return (
    <span className="grid h-5 w-5 place-items-center" aria-hidden>
      {open ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </span>
  );
}

function IconChevron({ open }) {
  return (
    <svg
      className={["h-4 w-4 opacity-70 transition-transform duration-200", open ? "rotate-180" : ""].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
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

function IconBan({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <line x1="8" y1="8" x2="16" y2="16" />
    </svg>
  );
}

const SUPER_EVENT = "qp-superpower-updated";

const powerRing = (on) =>
  on
    ? "ring-2 ring-[#29243b]/55 ring-offset-1 ring-offset-[#ececec]"
    : "ring-0";

export default function SiteMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastEmail, setLastEmail] = useState(null);
  const [selectedPower, setSelectedPower] = useState(null);
  const [powerPickerOpen, setPowerPickerOpen] = useState(false);
  const [powerSaveState, setPowerSaveState] = useState("idle"); // idle | saving | error
  const [profileMood, setProfileMood] = useState(null);
  const [moodPickerOpen, setMoodPickerOpen] = useState(false);
  const [moodSaveState, setMoodSaveState] = useState("idle");
  const allPowers = getSuperPowers();
  const menuId = useId();
  const containerRef = useRef(null);

  useEffect(() => {
    try {
      setLastEmail(localStorage.getItem(LAST_EMAIL_KEY));
    } catch {
      setLastEmail(null);
    }
  }, [open, pathname]);

  const loadSelectedPower = useCallback(async () => {
    if (!lastEmail) {
      setSelectedPower(null);
      setProfileMood(null);
      return;
    }
    try {
      const res = await fetch(
        `/api/profile?email=${encodeURIComponent(lastEmail)}`,
        { cache: "no-store" },
      );
      if (!res.ok) {
        setSelectedPower(null);
        setProfileMood(null);
        return;
      }
      const data = await res.json();
      setProfileMood(data?.profileMood ?? null);
      const id = mapLegacyAvatarId(data?.avatarId);
      const powers = getSuperPowers();
      const p = powers.find((x) => x.id === id) || powers[0];
      setSelectedPower(p ? { id: p.id, dataUrl: p.dataUrl, label: p.label } : null);
    } catch {
      setSelectedPower(null);
      setProfileMood(null);
    }
  }, [lastEmail]);

  useEffect(() => {
    loadSelectedPower();
  }, [loadSelectedPower, pathname, open]);

  useEffect(() => {
    const onSuper = () => loadSelectedPower();
    window.addEventListener(SUPER_EVENT, onSuper);
    return () => window.removeEventListener(SUPER_EVENT, onSuper);
  }, [loadSelectedPower]);

  const close = useCallback(() => {
    setOpen(false);
    setPowerPickerOpen(false);
    setMoodPickerOpen(false);
  }, []);

  useEffect(() => {
    if (!open) {
      setPowerPickerOpen(false);
      setMoodPickerOpen(false);
    }
  }, [open]);

  const applySuperPower = useCallback(
    async (p) => {
      if (!lastEmail) return;
      setPowerSaveState("saving");
      try {
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: lastEmail,
            gender: "",
            avatarId: p.id,
            imageUrl: p.dataUrl,
          }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) {
          setPowerSaveState("error");
          return;
        }
        setSelectedPower({ id: p.id, dataUrl: p.dataUrl, label: p.label });
        if (data.profileMood !== undefined) setProfileMood(data.profileMood ?? null);
        setPowerSaveState("idle");
        try {
          window.dispatchEvent(new Event(SUPER_EVENT));
        } catch {
          /* ignore */
        }
      } catch {
        setPowerSaveState("error");
      }
    },
    [lastEmail],
  );

  const applyMood = useCallback(
    async (mood) => {
      if (!lastEmail) return;
      setMoodSaveState("saving");
      try {
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: lastEmail, profileMood: mood }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) {
          setMoodSaveState("error");
          return;
        }
        setProfileMood(data?.profileMood ?? null);
        setMoodSaveState("idle");
        try {
          window.dispatchEvent(new Event(SUPER_EVENT));
        } catch {
          /* ignore */
        }
      } catch {
        setMoodSaveState("error");
      }
    },
    [lastEmail],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        close();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open, close]);

  const onVisitor = pathname === "/visitor";
  const onProfile = pathname === "/profile";
  const profileHref = lastEmail
    ? `/profile?email=${encodeURIComponent(lastEmail)}`
    : "/login";
  const visitorHref = lastEmail
    ? `/visitor?email=${encodeURIComponent(lastEmail)}`
    : "/visitor";

  const onLogout = useCallback(() => {
    try {
      localStorage.removeItem(LAST_EMAIL_KEY);
    } catch {
      /* ignore */
    }
    setLastEmail(null);
    setSelectedPower(null);
    setProfileMood(null);
    setPowerPickerOpen(false);
    setMoodPickerOpen(false);
    setPowerSaveState("idle");
    setMoodSaveState("idle");
    setOpen(false);
    if (pathname === "/profile") {
      router.replace("/login");
    } else {
      router.push("/login");
    }
  }, [pathname, router]);

  return (
    <header
      className="print:hidden sticky top-0 z-50 w-full border-b border-white/20 bg-[#ececec]/90 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/login"
          className="flex min-w-0 items-center gap-2.5 text-lg font-semibold tracking-tight text-[#29243b] sm:gap-3 sm:text-xl"
        >
          <Image
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            className="h-9 w-9 shrink-0 rounded-xl object-contain sm:h-10 sm:w-10"
            priority
          />
          <span className="min-w-0">Quick Portfolio</span>
        </Link>

        <div className="relative shrink-0" ref={containerRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`${pill} flex shrink-0 items-center gap-2 px-3.5 py-2`}
            aria-expanded={open}
            aria-controls={menuId}
            aria-haspopup="true"
            id={`${menuId}-trigger`}
          >
            <IconMenu open={open} />
            <span className="hidden sm:inline">Menu</span>
            <IconChevron open={open} />
          </button>

          {open ? (
            <div
              id={menuId}
              role="region"
              aria-label="Site menu"
              className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] max-h-[min(70vh,calc(100dvh-5rem))] origin-top-right overflow-y-auto overscroll-contain rounded-[20px] border border-white/30 bg-[#ececec] p-4 shadow-[18px_18px_48px_rgba(0,0,0,0.14),0_0_0_1px_rgba(255,255,255,0.5)]"
            >
              <div>
                <h3 className={sectionTitle}>Super power</h3>
                {lastEmail ? (
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-300/20 bg-white/25 p-3 shadow-[inset_3px_3px_8px_rgba(0,0,0,0.04)]">
                    {selectedPower ? (
                      <>
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-slate-200/60 bg-[#ececec] shadow-[4px_4px_10px_rgba(0,0,0,0.08),-2px_-2px_6px_rgba(255,255,255,0.92)]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={selectedPower.dataUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Selected
                          </p>
                          <p className="truncate text-sm font-semibold text-[#29243b]">
                            {selectedPower.label}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-slate-500" title={lastEmail}>
                            {lastEmail}
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500">Loading your power…</p>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    Sign in to see your selected super power here.
                  </p>
                )}
              </div>

              <div className="mt-4">
                <h3 className={sectionTitle}>Go to</h3>
                <nav className="mt-2 space-y-1" aria-label="Main navigation">
                  {lastEmail ? (
                    <div className="rounded-2xl border border-slate-300/20 bg-white/20 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.03)]">
                      <button
                        type="button"
                        onClick={() => {
                          setPowerSaveState("idle");
                          setPowerPickerOpen((v) => !v);
                        }}
                        className="flex w-full items-center justify-between gap-2 rounded-2xl px-3.5 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-white/30 hover:text-[#29243b]"
                        aria-expanded={powerPickerOpen}
                        aria-controls={`${menuId}-powers`}
                        id={`${menuId}-select-power`}
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-amber-500/20 text-amber-800" aria-hidden>
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                              <path d="M7 2v11h3v9l7-12h-4l4-10z" />
                            </svg>
                          </span>
                          <span>Select super power</span>
                        </span>
                        <IconChevron open={powerPickerOpen} />
                      </button>
                      {powerPickerOpen ? (
                        <div
                          id={`${menuId}-powers`}
                          role="listbox"
                          aria-labelledby={`${menuId}-select-power`}
                          className="max-h-48 overflow-y-auto border-t border-slate-300/20 px-2 py-2"
                        >
                          <div className="grid grid-cols-3 gap-1.5">
                            {allPowers.map((p) => {
                              const isSel = selectedPower?.id === p.id;
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  role="option"
                                  aria-selected={isSel}
                                  disabled={powerSaveState === "saving"}
                                  title={p.label}
                                  onClick={() => {
                                    setPowerSaveState("idle");
                                    applySuperPower(p);
                                  }}
                                  className={[
                                    "flex flex-col items-center gap-0.5 rounded-xl bg-[#ececec] p-1.5 text-center shadow-[2px_2px_6px_rgba(0,0,0,0.06),-1px_-1px_4px_rgba(255,255,255,0.9)] transition-transform hover:-translate-y-px disabled:opacity-50",
                                    powerRing(isSel),
                                  ].join(" ")}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={p.dataUrl}
                                    alt=""
                                    className="h-9 w-9 rounded-lg object-cover"
                                  />
                                  <span className="line-clamp-1 w-full text-[9px] font-semibold leading-tight text-[#29243b]/85">
                                    {p.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          {powerSaveState === "saving" ? (
                            <p className="mt-2 text-center text-[10px] font-medium text-slate-500">Saving…</p>
                          ) : null}
                          {powerSaveState === "error" ? (
                            <p className="mt-2 text-center text-[10px] font-medium text-red-600">Couldn’t save. Try again.</p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="rounded-2xl px-3.5 py-2.5 text-left text-sm text-slate-500">
                      <span className="font-medium text-slate-600">Select super power</span>
                      <span className="mt-0.5 block text-xs">Sign in to choose your power here.</span>
                    </div>
                  )}
                  {lastEmail ? (
                    <div className="rounded-2xl border border-slate-300/20 bg-white/20 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.03)]">
                      <button
                        type="button"
                        onClick={() => {
                          setMoodSaveState("idle");
                          setMoodPickerOpen((v) => !v);
                        }}
                        className="flex w-full items-center justify-between gap-2 rounded-2xl px-3.5 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-white/30 hover:text-[#29243b]"
                        aria-expanded={moodPickerOpen}
                        aria-controls={`${menuId}-mood`}
                        id={`${menuId}-select-mood`}
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span className="text-lg leading-none" aria-hidden>
                            😀
                          </span>
                          <span>Mood &amp; emoji</span>
                        </span>
                        <IconChevron open={moodPickerOpen} />
                      </button>
                      {moodPickerOpen ? (
                        <div
                          id={`${menuId}-mood`}
                          className="max-h-64 overflow-y-auto border-t border-slate-300/20 px-2 py-2"
                        >
                          <p className="px-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">Emojis</p>
                          <div className="mt-1 max-h-32 overflow-y-auto pr-0.5">
                            <div className="grid grid-cols-5 gap-1">
                              {MOOD_PICKER_EMOJIS.map((ch, i) => {
                                const isSel = profileMood?.type === "emoji" && profileMood.value === ch;
                                return (
                                  <button
                                    key={`${i}-${ch}`}
                                    type="button"
                                    disabled={moodSaveState === "saving"}
                                    onClick={() => {
                                      setMoodSaveState("idle");
                                      applyMood({ type: "emoji", value: ch });
                                    }}
                                    className={[
                                      "grid h-8 place-items-center rounded-lg bg-[#ececec] text-base leading-none shadow-[1px_1px_3px_rgba(0,0,0,0.06)] transition-transform hover:-translate-y-px disabled:opacity-50",
                                      powerRing(isSel),
                                    ].join(" ")}
                                    aria-label={`Mood ${ch}`}
                                  >
                                    {ch}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <p className="mt-2 px-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">Stickers</p>
                          <div className="mt-1 grid grid-cols-3 gap-1">
                            {allPowers.map((p) => {
                              const isSel =
                                profileMood?.type === "avatar" &&
                                mapLegacyAvatarId(profileMood.id) === p.id;
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  disabled={moodSaveState === "saving"}
                                  title={p.label}
                                  onClick={() => {
                                    setMoodSaveState("idle");
                                    applyMood({ type: "avatar", id: p.id });
                                  }}
                                  className={[
                                    "overflow-hidden rounded-lg bg-[#ececec] p-0.5 shadow-[1px_1px_3px_rgba(0,0,0,0.06)] transition-transform hover:-translate-y-px disabled:opacity-50",
                                    powerRing(isSel),
                                  ].join(" ")}
                                  aria-label={`Sticker ${p.label}`}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={p.dataUrl} alt="" className="h-7 w-7 object-cover" />
                                </button>
                              );
                            })}
                          </div>
                          <div className="mt-2 flex justify-end">
                            <button
                              type="button"
                              disabled={moodSaveState === "saving"}
                              onClick={() => {
                                setMoodSaveState("idle");
                                applyMood(null);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition-colors hover:bg-white/50"
                            >
                              <IconBan className="h-3.5 w-3.5 shrink-0" />
                              Clear
                            </button>
                          </div>
                          {moodSaveState === "saving" ? (
                            <p className="mt-1.5 text-center text-[10px] text-slate-500">Saving…</p>
                          ) : null}
                          {moodSaveState === "error" ? (
                            <p className="mt-1.5 text-center text-[10px] text-red-600">Couldn’t save. Try again.</p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="rounded-2xl px-3.5 py-2.5 text-left text-sm text-slate-500">
                      <span className="font-medium text-slate-600">Mood &amp; emoji</span>
                      <span className="mt-0.5 block text-xs">Sign in to set mood and stickers.</span>
                    </div>
                  )}
                  <Link
                    href={visitorHref}
                    onClick={close}
                    className={navClass(onVisitor)}
                  >
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M1 12s4-7 11-7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>Visitor page</span>
                  </Link>
                  <Link
                    href={profileHref}
                    onClick={close}
                    className={navClass(onProfile)}
                  >
                    <IconUser className="h-5 w-5 shrink-0" />
                    <span>My profile</span>
                  </Link>
                </nav>
              </div>

              {lastEmail ? (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-sm font-medium text-red-800 transition-colors hover:bg-red-100/50 hover:text-red-900"
                  >
                    <IconLogout className="h-5 w-5 shrink-0" />
                    <span>Log out</span>
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
