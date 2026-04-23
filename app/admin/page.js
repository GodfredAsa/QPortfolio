"use client";

import { useCallback, useEffect, useState } from "react";
import { Grand_Hotel } from "next/font/google";
import AdminAnalyticsCharts from "../components/AdminAnalyticsCharts";
import AdminDataBackupPanel from "../components/AdminDataBackupPanel";
import AdminUserApprovals from "../components/AdminUserApprovals";

const grandHotel = Grand_Hotel({
  subsets: ["latin"],
  weight: "400",
});

const card =
  "rounded-[32px] bg-[#ececec] p-8 shadow-[18px_18px_42px_rgba(0,0,0,0.10),-18px_-18px_42px_rgba(255,255,255,0.95)]";
const input =
  "w-full rounded-full bg-[#ececec] px-7 py-4 text-[15px] text-slate-700 placeholder:text-slate-400 outline-none shadow-[inset_10px_10px_18px_rgba(0,0,0,0.10),inset_-10px_-10px_18px_rgba(255,255,255,0.92)] focus:shadow-[inset_12px_12px_22px_rgba(0,0,0,0.12),inset_-10px_-10px_22px_rgba(255,255,255,0.96)]";
const buttonPrimary =
  "w-full rounded-full bg-[#0e172a] py-4 text-[15px] font-semibold text-white shadow-[14px_14px_28px_rgba(0,0,0,0.18),-14px_-14px_30px_rgba(255,255,255,0.90)] transition-transform hover:-translate-y-0.5 hover:bg-[#152238] active:translate-y-0 active:shadow-[inset_8px_8px_16px_rgba(0,0,0,0.35),inset_-4px_-4px_12px_rgba(255,255,255,0.08)] disabled:opacity-70";
const statCard =
  "min-h-[5.5rem] rounded-2xl border border-slate-200/40 bg-[#ececec] px-5 py-4 shadow-[8px_8px_20px_rgba(0,0,0,0.06),-6px_-6px_16px_rgba(255,255,255,0.85)]";

export default function AdminPage() {
  const [view, setView] = useState("loading");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

  const load = useCallback(async () => {
    setError("");
    setRefreshing(true);
    try {
      const res = await fetch(`/api/admin/analytics?t=${Date.now()}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (res.status === 401) {
        setData(null);
        setView("login");
        return;
      }
      if (!res.ok) {
        setData(null);
        setError("Could not load analytics.");
        setView("login");
        return;
      }
      const j = await res.json();
      if (j?.ok) {
        setData(j);
        setView("dashboard");
        setLastRefreshedAt(new Date().toISOString());
      } else {
        setView("login");
      }
    } catch {
      setData(null);
      setError("Network error.");
      setView("login");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onLogin(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(j?.error || "Sign-in failed.");
        return;
      }
      await load();
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onLogout() {
    setError("");
    try {
      await fetch("/api/admin/session", { method: "DELETE", credentials: "include" });
    } catch {
      /* ignore */
    }
    setData(null);
    setView("login");
  }

  if (view === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#ececec] px-4 py-10">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  if (view === "login") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#ececec] px-4 py-10">
        <div className={`w-full max-w-[420px] ${card}`}>
          <h1
            className={`${grandHotel.className} text-center text-4xl text-[#0f172a] sm:text-5xl`}
          >
            Admin
          </h1>
          <p className="mt-2 text-center text-sm text-slate-500">
            Sign in to view system analytics. Only the designated admin account can access this
            page.
          </p>
          {error ? (
            <p className="mt-4 text-center text-sm text-red-700">{error}</p>
          ) : null}
          <form className="mt-8 space-y-4" onSubmit={onLogin}>
            <input type="email" name="email" autoComplete="username" className={input} placeholder="Email" required />
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              className={input}
              placeholder="Password"
              required
            />
            <button type="submit" className={buttonPrimary} disabled={submitting}>
              {submitting ? "Signing in…" : "View dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === "dashboard" && data?.ok) {
    return (
      <div className="min-h-dvh bg-[#ececec] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h1
              className={`${grandHotel.className} text-3xl text-[#0f172a] sm:text-4xl`}
            >
              Dashboard
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  void load();
                }}
                disabled={refreshing}
                className="rounded-full border-0 bg-[#ececec] px-4 py-2 text-sm font-semibold text-[#29243b] shadow-[4px_4px_10px_rgba(0,0,0,0.06),-2px_-2px_6px_rgba(255,255,255,0.85)] disabled:opacity-60"
              >
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
              {lastRefreshedAt ? (
                <span className="text-xs font-medium text-slate-500" translate="no">
                  Updated {new Date(lastRefreshedAt).toLocaleTimeString()}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  void onLogout();
                }}
                className="rounded-full border-0 bg-[#0e172a] px-4 py-2 text-sm font-semibold text-white shadow-sm"
              >
                Sign out
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={statCard}>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Users</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-[#29243b]">
                {data.totalUsers}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">Registered accounts in the system</p>
            </div>
            <div className={statCard}>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Profiles</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-[#29243b]">
                {data.totalProfiles}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">Saved portfolio profiles in data</p>
            </div>
          </div>

          <div className="mt-6">
            <AdminUserApprovals
              onChanged={() => {
                void load();
              }}
            />
          </div>

          <div className="mt-6">
            <AdminDataBackupPanel
              onDataChanged={() => {
                void load();
              }}
            />
          </div>

          <AdminAnalyticsCharts
            genderDonut={data.genderDonut ?? []}
            dailyActivity={data.dailyActivity ?? []}
            topProgrammingLanguages={data.topProgrammingLanguages ?? []}
            totalProfiles={data.totalProfiles ?? 0}
          />

          <p className="mt-6 text-center text-xs text-slate-400" translate="no">
            Updated {data.generatedAt ? new Date(data.generatedAt).toLocaleString() : "—"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#ececec]">
      <p className="text-slate-500">Something went wrong.</p>
    </div>
  );
}
