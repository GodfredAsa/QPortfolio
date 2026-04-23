"use client";

import { useState } from "react";

const panel =
  "rounded-2xl border border-slate-200/40 bg-[#ececec] p-5 shadow-[8px_8px_20px_rgba(0,0,0,0.06),-6px_-6px_16px_rgba(255,255,255,0.85)] sm:p-6";
const btnNeu =
  "inline-flex items-center justify-center rounded-full border-0 bg-[#ececec] px-4 py-2.5 text-sm font-semibold text-[#29243b] shadow-[4px_4px_10px_rgba(0,0,0,0.06),-2px_-2px_6px_rgba(255,255,255,0.85)] transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50";
const btnDark =
  "inline-flex items-center justify-center rounded-full border-0 bg-[#0e172a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50";

export default function AdminDataBackupPanel({ onDataChanged }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function onDownload() {
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/backup", { credentials: "include" });
      if (res.status === 401) {
        setError("Session expired. Sign in again.");
        return;
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error || "Download failed.");
        return;
      }
      const text = await res.text();
      const day = new Date().toISOString().slice(0, 10);
      const blob = new Blob([text], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quickportfolio-backup-${day}.json`;
      a.rel = "noopener";
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Backup file downloaded.");
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function onFileChange(e) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const text = await file.text();
      try {
        JSON.parse(text);
      } catch {
        setError("The file is not valid JSON.");
        return;
      }

      const res = await fetch("/api/admin/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: text,
      });
      const j = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setError("Session expired. Sign in again.");
        return;
      }
      if (!res.ok) {
        setError(j?.error || "Restore failed.");
        return;
      }
      if (j?.ok) {
        setMessage(
          `Data restored: ${j.accountsCount} account(s), ${j.profilesCount} profile(s), ${j.loginEventsCount} sign-in event(s).`,
        );
        onDataChanged?.();
      } else {
        setError("Unexpected response.");
      }
    } catch {
      setError("Network error or file could not be read.");
    } finally {
      setBusy(false);
      input.value = "";
    }
  }

  return (
    <div className={panel}>
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Data export / restore</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
        Download a single JSON backup from MongoDB. Uploading a backup will <strong>replace all current
        data</strong> in the database.
      </p>
      {error ? (
        <p className="mt-3 text-sm text-red-700" role="status">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-3 text-sm text-emerald-800" role="status">
          {message}
        </p>
      ) : null}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button type="button" className={btnNeu} disabled={busy} onClick={() => void onDownload()}>
          {busy ? "Working…" : "Download backup (JSON)"}
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            id="admin-restore-file"
            onChange={onFileChange}
            disabled={busy}
          />
          <label
            htmlFor="admin-restore-file"
            className={btnDark + (busy ? " pointer-events-none opacity-50" : " cursor-pointer")}
          >
            Upload & replace data
          </label>
        </div>
      </div>
    </div>
  );
}

