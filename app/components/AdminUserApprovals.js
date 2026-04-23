"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const panel =
  "rounded-2xl border border-slate-200/40 bg-[#ececec] p-5 shadow-[8px_8px_20px_rgba(0,0,0,0.06),-6px_-6px_16px_rgba(255,255,255,0.85)] sm:p-6";
const btnNeu =
  "inline-flex items-center justify-center rounded-full border-0 bg-[#ececec] px-4 py-2.5 text-sm font-semibold text-[#29243b] shadow-[4px_4px_10px_rgba(0,0,0,0.06),-2px_-2px_6px_rgba(255,255,255,0.85)] transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50";
const btnDark =
  "inline-flex items-center justify-center rounded-full border-0 bg-[#0e172a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50";

const badge = (s) =>
  [
    "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
    s === "APPROVED"
      ? "bg-emerald-100 text-emerald-800"
      : s === "LOCKED"
        ? "bg-red-100 text-red-800"
        : "bg-slate-200 text-slate-700",
  ].join(" ");

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative w-full max-w-lg rounded-[28px] bg-[#ececec] p-6 shadow-[18px_18px_42px_rgba(0,0,0,0.18),-18px_-18px_42px_rgba(255,255,255,0.90)]">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-base font-bold text-[#0e172a]">{title}</h3>
          <button type="button" className={btnNeu} onClick={onClose}>
            Close
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export default function AdminUserApprovals({ onChanged }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ PENDING: 0, APPROVED: 0, LOCKED: 0 });
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [statusPick, setStatusPick] = useState("PENDING");
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/admin/accounts?${params.toString()}`, { credentials: "include" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(j?.error || "Could not load users.");
        setAccounts([]);
        return;
      }
      setAccounts(Array.isArray(j.accounts) ? j.accounts : []);
      setTotal(Number(j.total) || 0);
      setStatusCounts(j.statusCounts || { PENDING: 0, APPROVED: 0, LOCKED: 0 });
    } catch {
      setError("Network error.");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, q]);

  useEffect(() => {
    void load();
  }, [load]);

  const chartData = useMemo(() => {
    return [
      { name: "PENDING", value: Number(statusCounts.PENDING) || 0, fill: "#94a3b8" },
      { name: "APPROVED", value: Number(statusCounts.APPROVED) || 0, fill: "#0d9488" },
      { name: "REJECTED", value: Number(statusCounts.LOCKED) || 0, fill: "#ef4444" },
    ];
  }, [statusCounts]);

  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 20)));

  async function saveStatus() {
    if (!selected?.email) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/accounts/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: selected.email, status: statusPick }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(j?.error || "Update failed.");
        return;
      }
      const updated = j?.account;
      setAccounts((prev) => prev.map((a) => (a.email === updated.email ? updated : a)));
      setSelected(updated);
      onChanged?.();
      await load();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={panel}>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Users</h2>
            <p className="mt-1 text-sm text-slate-600">
              Accounts must be <strong>APPROVED</strong> before they can sign in.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search email/name…"
              className="w-full rounded-full bg-[#ececec] px-4 py-2.5 text-sm text-slate-700 outline-none shadow-[inset_8px_8px_14px_rgba(0,0,0,0.08),inset_-5px_-5px_10px_rgba(255,255,255,0.92)] sm:w-64"
            />
            <button type="button" className={btnNeu} onClick={() => void load()} disabled={loading}>
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Statuses</div>
            <div className="mt-3 h-[180px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px" }}
                    formatter={(v) => [v, "Users"]}
                  />
                  <Bar dataKey="value" name="Users" radius={[10, 10, 0, 0]} maxBarSize={60}>
                    {chartData.map((d) => (
                      <Cell key={d.name} fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Showing {accounts.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, total)} of {total}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">
                  Page size{" "}
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value) || 20);
                      setPage(1);
                    }}
                    className="ml-2 rounded-full bg-[#ececec] px-3 py-1.5 text-xs text-slate-700 shadow-[inset_6px_6px_10px_rgba(0,0,0,0.08),inset_-4px_-4px_8px_rgba(255,255,255,0.92)]"
                  >
                    {[10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className={btnNeu}
                  disabled={loading || page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className={btnNeu}
                  disabled={loading || page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
                <div className="text-xs font-semibold text-slate-600">
                  Page {page} / {totalPages}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Username</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr
                  key={a.email}
                  className="cursor-pointer border-t border-slate-300/30 hover:bg-white/25"
                  onClick={() => {
                    setSelected(a);
                    setStatusPick(a.status || "PENDING");
                    setError("");
                  }}
                >
                  <td className="py-3 pr-4 font-mono text-[12px] text-slate-700">{a.email}</td>
                  <td className="py-3 pr-4 text-slate-700">{a.fullName || "—"}</td>
                  <td className="py-3 pr-4 text-slate-700">{a.username ? `@${a.username}` : "—"}</td>
                  <td className="py-3 pr-4 text-slate-600">{fmtDate(a.createdAt)}</td>
                  <td className="py-3 pr-4">
                    <span className={badge(a.status || "PENDING")}>{a.status || "PENDING"}</span>
                  </td>
                </tr>
              ))}
              {!loading && accounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={Boolean(selected)}
        title={selected ? `Account: ${selected.email}` : "Account"}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Name</div>
                <div className="mt-1 text-sm text-slate-700">{selected.fullName || "—"}</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Phone</div>
                <div className="mt-1 font-mono text-[12px] text-slate-700">{selected.phone || "—"}</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Created</div>
                <div className="mt-1 text-sm text-slate-700">{fmtDate(selected.createdAt)}</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Current status</div>
                <div className="mt-1">
                  <span className={badge(selected.status || "PENDING")}>{selected.status || "PENDING"}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Set status</div>
              <div className="mt-2 flex flex-wrap gap-4">
                {["PENDING", "APPROVED", "LOCKED"].map((s) => (
                  <label key={s} className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="account-status"
                      className="h-4 w-4 accent-[#29243b]"
                      checked={statusPick === s}
                      onChange={() => setStatusPick(s)}
                    />
                    {s === "LOCKED" ? "REJECTED" : s}
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Only <strong>APPROVED</strong> accounts can sign in. <strong>LOCKED</strong> accounts stay in the system but cannot log in.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button type="button" className={btnNeu} onClick={() => setSelected(null)} disabled={saving}>
                Cancel
              </button>
              <button type="button" className={btnDark} onClick={() => void saveStatus()} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

