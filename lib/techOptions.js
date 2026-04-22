export const DEVICON_ROOT = "https://unpkg.com/devicon@2.16.0/icons";
export const SIMPLE_ICONS_CDN =
  "https://cdn.jsdelivr.net/npm/simple-icons@11.0.0/icons";

export const PROGRAMMING_LANGUAGE_OPTIONS = [
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

export const DATABASE_OPTIONS = [
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

export const CLOUD_OPTIONS = [
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

export const PLATFORM_OPTIONS = [
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
export const FRAMEWORK_OPTIONS = [
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

export const PROGRAMMING_LANG_IDS = new Set(
  PROGRAMMING_LANGUAGE_OPTIONS.map((o) => o.id),
);
export const DATABASE_IDS = new Set(DATABASE_OPTIONS.map((o) => o.id));
export const CLOUD_IDS = new Set(CLOUD_OPTIONS.map((o) => o.id));
export const PLATFORM_IDS = new Set(PLATFORM_OPTIONS.map((o) => o.id));
export const FRAMEWORK_IDS = new Set(FRAMEWORK_OPTIONS.map((o) => o.id));

/** Test automation, CI/CD, and IaC — save up to 5 like other tech. */
export const AUTOMATION_OPTIONS = [
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

export const AUTOMATION_IDS = new Set(AUTOMATION_OPTIONS.map((o) => o.id));

export const TOOLS_OPTIONS = [
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

export const TOOL_IDS = new Set(TOOLS_OPTIONS.map((o) => o.id));

export function deviconUrl(path) {
  return `${DEVICON_ROOT}/${path}.svg`;
}

/** Devicon `path`, or Simple Icons `simpleIcon` slug, or full `iconSrc` URL. */
export function optionIconSrc(o) {
  if (o.iconSrc) return o.iconSrc;
  if (o.simpleIcon) return `${SIMPLE_ICONS_CDN}/${o.simpleIcon}.svg`;
  if (o.path) return deviconUrl(o.path);
  return "";
}

export function normalizeTechIds(raw, idSet, max = 5) {
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

export function normalizeProgrammingLanguageIds(raw) {
  return normalizeTechIds(raw, PROGRAMMING_LANG_IDS, 5);
}

export function getIconsForSelectedIds(selectedIds, optionsList) {
  if (!Array.isArray(selectedIds) || !optionsList) return [];
  const map = new Map(optionsList.map((o) => [o.id, o]));
  return selectedIds
    .map((id) => {
      const key = typeof id === 'string' ? id.trim() : String(id || '').trim();
      const o = map.get(key);
      if (!o) return null;
      const src = optionIconSrc(o);
      if (!src) return null;
      return { id: o.id, label: o.label, src };
    })
    .filter(Boolean);
}
