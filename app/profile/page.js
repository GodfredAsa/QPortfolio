"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

function UserDetailsCard({ account }) {
  if (!account?.email) return null;
  return (
    <div
      className="min-w-0 w-full rounded-[20px] bg-[#ececec] px-4 py-3 shadow-[inset_8px_8px_14px_rgba(0,0,0,0.06),inset_-6px_-6px_12px_rgba(255,255,255,0.92)]"
    >
      <div className="text-[11px] font-semibold tracking-tight text-slate-800">
        Your account
      </div>
      <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
        How you appear on this portfolio
      </p>
      <div className="mt-2.5 space-y-1.5 text-[12px] leading-snug text-slate-800">
        {account.fullName ? (
          <div className="text-sm font-semibold text-slate-900">{account.fullName}</div>
        ) : null}
        <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-[5.25rem,1fr] sm:items-baseline sm:gap-x-2">
          <div className="text-slate-500">Email</div>
          <div className="min-w-0 break-all text-slate-800">{account.email}</div>
        </div>
        <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-[5.25rem,1fr] sm:items-baseline sm:gap-x-2">
          <div className="text-slate-500">Mobile</div>
          <div className="min-w-0 text-slate-800">{formatAccountPhone(account.phone)}</div>
        </div>
        <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-[5.25rem,1fr] sm:items-baseline sm:gap-x-2">
          <div className="text-slate-500">Username</div>
          <div className="text-slate-800">
            {account.username ? `@${account.username}` : "—"}
          </div>
        </div>
        {memberSinceLabel(account.createdAt) ? (
          <div className="border-t border-slate-300/30 pt-2 text-[11px] text-slate-500">
            Joined{" "}
            <span className="font-medium text-slate-600">
              {memberSinceLabel(account.createdAt)}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
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

const DEVICON_ROOT = "https://unpkg.com/devicon@2.16.0/icons";
const SIMPLE_ICONS_CDN =
  "https://cdn.jsdelivr.net/npm/simple-icons@11.0.0/icons";

const PROGRAMMING_LANGUAGE_OPTIONS = [
  { id: "javascript", label: "JavaScript", path: "javascript/javascript-original" },
  { id: "typescript", label: "TypeScript", path: "typescript/typescript-original" },
  { id: "python", label: "Python", path: "python/python-original" },
  { id: "java", label: "Java", path: "java/java-original" },
  { id: "c", label: "C", path: "c/c-original" },
  { id: "cpp", label: "C++", path: "cplusplus/cplusplus-original" },
  { id: "csharp", label: "C#", path: "csharp/csharp-original" },
  { id: "go", label: "Go", path: "go/go-original" },
  { id: "rust", label: "Rust", path: "rust/rust-original" },
  { id: "ruby", label: "Ruby", path: "ruby/ruby-original" },
  { id: "php", label: "PHP", path: "php/php-original" },
  { id: "swift", label: "Swift", path: "swift/swift-original" },
  { id: "kotlin", label: "Kotlin", path: "kotlin/kotlin-original" },
  { id: "dart", label: "Dart", path: "dart/dart-original" },
  { id: "scala", label: "Scala", path: "scala/scala-original" },
  { id: "elixir", label: "Elixir", path: "elixir/elixir-original" },
  { id: "haskell", label: "Haskell", path: "haskell/haskell-original" },
  { id: "html5", label: "HTML5", path: "html5/html5-original" },
  { id: "css3", label: "CSS3", path: "css3/css3-original" },
  { id: "react", label: "React", path: "react/react-original" },
  { id: "vuejs", label: "Vue.js", path: "vuejs/vuejs-original" },
  { id: "angular", label: "Angular", path: "angular/angular-original" },
  { id: "nodejs", label: "Node.js", path: "nodejs/nodejs-original" },
  { id: "svelte", label: "Svelte", path: "svelte/svelte-original" },
  { id: "bash", label: "Bash", path: "bash/bash-original" },
];

const DATABASE_OPTIONS = [
  { id: "mysql", label: "MySQL", path: "mysql/mysql-original" },
  { id: "postgresql", label: "PostgreSQL", path: "postgresql/postgresql-original" },
  { id: "mongodb", label: "MongoDB", path: "mongodb/mongodb-original" },
  { id: "redis", label: "Redis", path: "redis/redis-original" },
  { id: "sqlite", label: "SQLite", path: "sqlite/sqlite-original" },
  { id: "cassandra", label: "Cassandra", path: "cassandra/cassandra-original" },
  { id: "couchdb", label: "CouchDB", path: "couchdb/couchdb-original" },
  {
    id: "elasticsearch",
    label: "Elasticsearch",
    path: "elasticsearch/elasticsearch-original",
  },
  { id: "mariadb", label: "MariaDB", path: "mariadb/mariadb-original" },
  { id: "neo4j", label: "Neo4j", path: "neo4j/neo4j-original" },
  { id: "influxdb", label: "InfluxDB", path: "influxdb/influxdb-original" },
  {
    id: "mssql",
    label: "SQL Server",
    path: "microsoftsqlserver/microsoftsqlserver-plain",
  },
  { id: "oracle", label: "Oracle", path: "oracle/oracle-original" },
  { id: "firebase", label: "Firebase", path: "firebase/firebase-plain" },
  { id: "supabase", label: "Supabase", path: "supabase/supabase-original" },
  { id: "dynamodb", label: "DynamoDB", path: "dynamodb/dynamodb-original" },
];

const CLOUD_OPTIONS = [
  { id: "aws", label: "AWS", path: "amazonwebservices/amazonwebservices-original-wordmark" },
  { id: "azure", label: "Azure", path: "azure/azure-original" },
  { id: "gcp", label: "Google Cloud", path: "googlecloud/googlecloud-original" },
  { id: "k8s", label: "Kubernetes", path: "kubernetes/kubernetes-plain" },
  { id: "docker", label: "Docker", path: "docker/docker-original" },
  { id: "heroku", label: "Heroku", path: "heroku/heroku-original" },
  { id: "do", label: "DigitalOcean", path: "digitalocean/digitalocean-original" },
  { id: "cloudflare", label: "Cloudflare", path: "cloudflare/cloudflare-original" },
  { id: "nginx", label: "Nginx", path: "nginx/nginx-original" },
  { id: "vercel", label: "Vercel", path: "vercel/vercel-original" },
  { id: "netlify", label: "Netlify", path: "netlify/netlify-original" },
  { id: "vagrant", label: "Vagrant", path: "vagrant/vagrant-original" },
  { id: "prometheus", label: "Prometheus", path: "prometheus/prometheus-original" },
  { id: "grafana", label: "Grafana", path: "grafana/grafana-original" },
];

const PLATFORM_OPTIONS = [
  { id: "linux", label: "Linux", path: "linux/linux-original" },
  { id: "windows", label: "Windows", path: "windows11/windows11-original" },
  { id: "windows8", label: "Windows (legacy)", path: "windows8/windows8-original" },
  { id: "ubuntu", label: "Ubuntu", path: "ubuntu/ubuntu-plain" },
  { id: "centos", label: "CentOS", path: "centos/centos-original" },
  { id: "debian", label: "Debian", path: "debian/debian-original" },
  { id: "redhat", label: "Red Hat", path: "redhat/redhat-original" },
  { id: "fedora", label: "Fedora", path: "fedora/fedora-original" },
  { id: "opensuse", label: "openSUSE", path: "opensuse/opensuse-original" },
  { id: "rockylinux", label: "Rocky Linux", path: "rockylinux/rockylinux-original" },
  { id: "archlinux", label: "Arch Linux", path: "archlinux/archlinux-original" },
  { id: "gentoo", label: "Gentoo", path: "gentoo/gentoo-plain" },
  { id: "nixos", label: "NixOS", path: "nixos/nixos-original" },
  { id: "android", label: "Android", path: "android/android-original" },
  { id: "raspberrypi", label: "Raspberry Pi", path: "raspberrypi/raspberrypi-original" },
  { id: "macos", label: "macOS", path: "apple/apple-original" },
  { id: "docker", label: "Docker", path: "docker/docker-original" },
  { id: "kubernetes", label: "Kubernetes", path: "kubernetes/kubernetes-plain" },
  { id: "bash", label: "Bash / shell", path: "bash/bash-original" },
  { id: "chromeos", label: "Chrome / Chromebook", path: "chrome/chrome-original" },
];

/** Grouped stacks; 12 options, save up to 5. */
const FRAMEWORK_OPTIONS = [
  { id: "react", label: "React", path: "react/react-original", group: "Frontend" },
  { id: "vue", label: "Vue.js", path: "vuejs/vuejs-original", group: "Frontend" },
  { id: "angular", label: "Angular", path: "angular/angular-original", group: "Frontend" },
  { id: "django", label: "Django", path: "django/django-plain", group: "Python" },
  { id: "flask", label: "Flask", path: "flask/flask-original", group: "Python" },
  { id: "fastapi", label: "FastAPI", path: "fastapi/fastapi-original", group: "Python" },
  { id: "spring", label: "Spring", path: "spring/spring-original", group: "Java" },
  { id: "quarkus", label: "Quarkus", path: "quarkus/quarkus-original", group: "Java" },
  {
    id: "express",
    label: "Express",
    path: "express/express-original",
    group: "Node / TypeScript (backend)",
  },
  {
    id: "nestjs",
    label: "NestJS",
    path: "nestjs/nestjs-original",
    group: "Node / TypeScript (backend)",
  },
  {
    id: "fastify",
    label: "Fastify",
    path: "fastify/fastify-original",
    group: "Node / TypeScript (backend)",
  },
  {
    id: "trpc",
    label: "tRPC",
    path: "trpc/trpc-original",
    group: "Node / TypeScript (backend)",
  },
];

const PROGRAMMING_LANG_IDS = new Set(
  PROGRAMMING_LANGUAGE_OPTIONS.map((o) => o.id),
);
const DATABASE_IDS = new Set(DATABASE_OPTIONS.map((o) => o.id));
const CLOUD_IDS = new Set(CLOUD_OPTIONS.map((o) => o.id));
const PLATFORM_IDS = new Set(PLATFORM_OPTIONS.map((o) => o.id));
const FRAMEWORK_IDS = new Set(FRAMEWORK_OPTIONS.map((o) => o.id));

/** Test automation, CI/CD, and IaC — save up to 5 like other tech. */
const AUTOMATION_OPTIONS = [
  { id: "jest", label: "Jest", path: "jest/jest-plain", group: "Test automation" },
  { id: "mocha", label: "Mocha", path: "mocha/mocha-original", group: "Test automation" },
  {
    id: "selenium",
    label: "Selenium",
    path: "selenium/selenium-original",
    group: "Test automation",
  },
  { id: "junit", label: "JUnit", path: "junit/junit-original", group: "Test automation" },
  {
    id: "playwright",
    label: "Playwright",
    simpleIcon: "playwright",
    group: "Test automation",
  },
  { id: "vitest", label: "Vitest", simpleIcon: "vitest", group: "Test automation" },
  { id: "pytest", label: "pytest", simpleIcon: "pytest", group: "Test automation" },
  {
    id: "githubactions",
    label: "GitHub Actions",
    path: "githubactions/githubactions-original",
    group: "CI / CD",
  },
  { id: "gitlab", label: "GitLab CI", path: "gitlab/gitlab-original", group: "CI / CD" },
  { id: "jenkins", label: "Jenkins", path: "jenkins/jenkins-original", group: "CI / CD" },
  { id: "circleci", label: "CircleCI", path: "circleci/circleci-plain", group: "CI / CD" },
  { id: "travisci", label: "Travis CI", path: "travis/travis-plain", group: "CI / CD" },
  {
    id: "azuredevops",
    label: "Azure DevOps",
    path: "azuredevops/azuredevops-original",
    group: "CI / CD",
  },
  { id: "argocd", label: "Argo CD", path: "argocd/argocd-original", group: "CI / CD" },
  {
    id: "terraform",
    label: "Terraform",
    path: "terraform/terraform-original",
    group: "IaC & config",
  },
  { id: "ansible", label: "Ansible", path: "ansible/ansible-original", group: "IaC & config" },
  {
    id: "cloudformation",
    label: "AWS CloudFormation",
    simpleIcon: "amazonaws",
    group: "IaC & config",
  },
  { id: "puppet", label: "Puppet", simpleIcon: "puppet", group: "IaC & config" },
  { id: "chef", label: "Chef", simpleIcon: "chef", group: "IaC & config" },
];

const AUTOMATION_IDS = new Set(AUTOMATION_OPTIONS.map((o) => o.id));

const TOOLS_OPTIONS = [
  {
    id: "excel",
    label: "Microsoft Excel",
    simpleIcon: "microsoftexcel",
    group: "Analytics & BI",
  },
  {
    id: "tableau",
    label: "Tableau",
    simpleIcon: "tableau",
    group: "Analytics & BI",
  },
  {
    id: "powerbi",
    label: "Power BI",
    simpleIcon: "powerbi",
    group: "Analytics & BI",
  },
  {
    id: "googleanalytics",
    label: "Google Analytics",
    simpleIcon: "googleanalytics",
    group: "Analytics & BI",
  },
  {
    id: "looker",
    label: "Looker",
    simpleIcon: "looker",
    group: "Analytics & BI",
  },
  {
    id: "postman",
    label: "Postman",
    path: "postman/postman-original",
    group: "API & integration testing",
  },
  {
    id: "insomnia",
    label: "Insomnia",
    simpleIcon: "insomnia",
    group: "API & integration testing",
  },
  {
    id: "swagger",
    label: "Swagger / OpenAPI",
    simpleIcon: "swagger",
    group: "API & integration testing",
  },
  {
    id: "hoppscotch",
    label: "Hoppscotch",
    simpleIcon: "hoppscotch",
    group: "API & integration testing",
  },
  {
    id: "vscode",
    label: "VS Code",
    path: "vscode/vscode-original",
    group: "Developer & collaboration",
  },
  {
    id: "intellij",
    label: "IntelliJ IDEA",
    path: "intellij/intellij-original",
    group: "Developer & collaboration",
  },
  { id: "git", label: "Git", path: "git/git-original", group: "Developer & collaboration" },
  { id: "jira", label: "Jira", path: "jira/jira-original", group: "Developer & collaboration" },
  { id: "figma", label: "Figma", path: "figma/figma-original", group: "Developer & collaboration" },
  { id: "slack", label: "Slack", path: "slack/slack-original", group: "Developer & collaboration" },
  {
    id: "notion",
    label: "Notion",
    path: "notion/notion-original",
    group: "Developer & collaboration",
  },
];

const TOOL_IDS = new Set(TOOLS_OPTIONS.map((o) => o.id));

function deviconUrl(path) {
  return `${DEVICON_ROOT}/${path}.svg`;
}

/** Devicon `path`, or Simple Icons `simpleIcon` slug, or full `iconSrc` URL. */
function optionIconSrc(o) {
  if (o.iconSrc) return o.iconSrc;
  if (o.simpleIcon) return `${SIMPLE_ICONS_CDN}/${o.simpleIcon}.svg`;
  if (o.path) return deviconUrl(o.path);
  return "";
}

function normalizeTechIds(raw, idSet, max = 5) {
  const arr = Array.isArray(raw) ? raw : [];
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const id = typeof x === "string" ? x.trim() : String(x || "").trim();
    if (!id || !idSet.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= max) break;
  }
  return out;
}

function normalizeProgrammingLanguageIds(raw) {
  return normalizeTechIds(raw, PROGRAMMING_LANG_IDS, 5);
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

export default function ProfilePage() {
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
  const [headlineSaveState, setHeadlineSaveState] = useState("idle");

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

  async function saveHeadline() {
    if (!email) return;
    if (shortBioOverLimit) return;
    try {
      setHeadlineSaveState("saving");
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          profession: professionDraft,
          shortBio: shortBioDraft,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.error || "Save failed.");
      setProfile(data);
      setProfessionDraft(String(data.profession || ""));
      setShortBioDraft(String(data.shortBio || ""));
      setHeadlineSaveState("saved");
      window.setTimeout(() => setHeadlineSaveState("idle"), 1500);
    } catch {
      setHeadlineSaveState("error");
      window.setTimeout(() => setHeadlineSaveState("idle"), 2000);
    }
  }

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-[#ececec] px-6 py-16">
      <div className="mx-auto w-full max-w-[980px] rounded-[32px] bg-[#ececec] p-10 shadow-[18px_18px_42px_rgba(0,0,0,0.10),-18px_-18px_42px_rgba(255,255,255,0.95)]">
        <div className="w-full min-w-0">
          <div className="flex min-w-0 flex-col gap-3">
            {accountInfo ? <UserDetailsCard account={accountInfo} /> : null}
            {profile ? (
              <div
                className="w-full min-w-0 rounded-[20px] bg-[#ececec] px-4 py-3 shadow-[inset_8px_8px_14px_rgba(0,0,0,0.06),inset_-6px_-6px_12px_rgba(255,255,255,0.92)]"
              >
                <div className="text-[11px] font-semibold text-slate-800">
                  Role & summary
                </div>
                <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
                  How you describe yourself in one line, plus a short intro (max
                  100 words).
                </p>
                <div className="mt-2.5">
                  <div className="text-[10px] font-semibold text-slate-500">
                    Profession
                  </div>
                  <input
                    type="text"
                    value={professionDraft}
                    onChange={(e) => setProfessionDraft(e.target.value)}
                    maxLength={200}
                    className={
                      HANDLE_INPUT +
                      " mt-0.5 font-medium text-slate-900"
                    }
                    placeholder="e.g. Software engineer · Data analyst"
                  />
                </div>
                <div className="mt-2.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="text-[10px] font-semibold text-slate-500">
                      Short description
                    </div>
                    <div
                      className={[
                        "text-[10px] font-medium tabular-nums",
                        shortBioOverLimit
                          ? "text-red-600"
                          : "text-slate-500",
                      ].join(" ")}
                    >
                      {shortBioWordCount} / 100 words
                    </div>
                  </div>
                  <textarea
                    value={shortBioDraft}
                    onChange={(e) => setShortBioDraft(e.target.value)}
                    className={HEADLINE_TEXTAREA + " mt-0.5"}
                    placeholder="A brief overview of your background, focus, and what you care about in your work…"
                    rows={5}
                    aria-label="Short profile description"
                  />
                </div>
                <div className="flex w-full flex-col items-end gap-1.5 pt-1">
                  <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={saveHeadline}
                      disabled={
                        headlineSaveState === "saving" || shortBioOverLimit
                      }
                      className={PROFILE_NEU_PILL + " px-5 py-2.5"}
                      aria-label="Update role and summary"
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
            ) : null}
          </div>
        </div>

        {profile ? (
          <div
            className="mt-4 w-full min-w-0 rounded-[20px] bg-[#ececec] p-4 shadow-[inset_8px_8px_14px_rgba(0,0,0,0.06),inset_-6px_-6px_12px_rgba(255,255,255,0.92)]"
          >
            <div className="text-[11px] font-semibold text-slate-800">
              Profile links
            </div>
            <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
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
        ) : null}

        {loadError ? (
          <div className="mt-6 rounded-[22px] bg-[#ececec] px-5 py-4 text-sm text-red-700 shadow-[inset_10px_10px_18px_rgba(0,0,0,0.08),inset_-10px_-10px_18px_rgba(255,255,255,0.92)]">
            {loadError}
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
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
      </div>
    </div>
  );
}
