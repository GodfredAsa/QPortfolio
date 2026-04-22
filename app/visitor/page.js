import { Suspense } from "react";
import VisitorCvClient from "./VisitorCvClient";

export const metadata = {
  title: "Portfolio (CV) | Quick Portfolio",
  description:
    "Public read-only portfolio: add ?email= to the URL to view someone’s profile, skills, and experience.",
};

function VisitorFallback() {
  return (
    <div className="flex min-h-[50vh] flex-1 items-center justify-center bg-[#ececec] text-sm text-slate-500">
      Loading…
    </div>
  );
}

export default function VisitorPage() {
  return (
    <main className="min-h-0 flex-1 bg-[#ececec]" aria-label="Public portfolio">
      <Suspense fallback={<VisitorFallback />}>
        <VisitorCvClient />
      </Suspense>
    </main>
  );
}
