"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Grand_Hotel } from "next/font/google";

const grandHotel = Grand_Hotel({
  subsets: ["latin"],
  weight: "400",
});

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bg = "bg-[#ececec]";
  const card =
    "rounded-[32px] bg-[#ececec] shadow-[18px_18px_42px_rgba(0,0,0,0.10),-18px_-18px_42px_rgba(255,255,255,0.95)]";
  const input =
    "w-full rounded-full bg-[#ececec] px-7 py-4 text-[15px] text-slate-700 placeholder:text-slate-400 outline-none shadow-[inset_10px_10px_18px_rgba(0,0,0,0.10),inset_-10px_-10px_18px_rgba(255,255,255,0.92)] focus:shadow-[inset_12px_12px_22px_rgba(0,0,0,0.12),inset_-12px_-12px_22px_rgba(255,255,255,0.96)]";
  const button =
    "mt-2 w-full rounded-full bg-[#0e172a] py-4 text-[15px] font-semibold text-white shadow-[14px_14px_28px_rgba(0,0,0,0.18),-14px_-14px_30px_rgba(255,255,255,0.90)] transition-transform hover:-translate-y-0.5 hover:bg-[#152238] active:translate-y-0 active:shadow-[inset_8px_8px_16px_rgba(0,0,0,0.35),inset_-4px_-4px_12px_rgba(255,255,255,0.08)] disabled:opacity-70";

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Login failed.");
        return;
      }

      const email = data?.account?.email || payload.email;
      try {
        if (email) localStorage.setItem("qp_last_email", String(email).trim());
      } catch {
        /* ignore */
      }
      router.push(`/profile?email=${encodeURIComponent(email)}`);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className={`flex min-h-[calc(100dvh-3.5rem)] items-center justify-center ${bg} px-6 py-16`}
    >
      <div className={`w-full max-w-[420px] p-10 ${card}`}>
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <Image
              src="/logo.png"
              alt=""
              width={80}
              height={80}
              className="h-16 w-16 rounded-2xl object-contain sm:h-20 sm:w-20"
              priority
            />
          </div>
          <div
            className={`${grandHotel.className} text-[56px] leading-none tracking-wide text-[#0f172a]`}
          >
            Quick Portfolio
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Sign in to view and update your profile.
          </p>
        </div>

        <form className="mt-12 space-y-6" onSubmit={onSubmit}>
          <div className="relative">
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email"
              className={input}
              required
            />
          </div>

          <div className="relative">
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Password"
              className={input}
              required
            />
          </div>

          {error ? (
            <div className="rounded-2xl bg-[#ececec] px-4 py-3 text-sm text-red-700 shadow-[inset_10px_10px_18px_rgba(0,0,0,0.08),inset_-10px_-10px_18px_rgba(255,255,255,0.92)]">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className={button}
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>

          <div className="pt-2 text-center text-[13px] text-slate-500">
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="font-semibold text-slate-700 hover:underline"
            >
              Create account
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

