export function svgDataUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const POWER_ICON_INNER = {
  "sp-lightning": `<path d="M54 16L32 50h16l-8 32 30-40H50l-4-12z" fill="#fff" fill-opacity="0.95"/>`,
  "sp-fire": `<path d="M48 22c-4 8-12 12-8 24 2 6 8 10 8 16 0-6 6-10 8-16 4-12-4-16-8-24z" fill="#fff" fill-opacity="0.9"/><path d="M48 64c-4 4-2 8 0 8s4-4 0-8z" fill="#fff" fill-opacity="0.75"/>`,
  "sp-ice": `<path d="M48 20v12M32 32l8 5M64 32l-8 5M32 50l8-5M64 50l-8-5M48 44v12M32 64l8-5M64 64l-8-5" stroke="#fff" stroke-width="2.2" fill="none"/><circle cx="48" cy="50" r="3" fill="#fff"/>`,
  "sp-mind": `<circle cx="40" cy="40" r="5" fill="#fff"/><circle cx="56" cy="40" r="5" fill="#fff"/><path d="M40 50c4 8 20 8 24 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M48 32c0-4 4-8 8-8s6 3 6 6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/>`,
  "sp-strength": `<path d="M38 32h-6l-4 6v8l4 4h4l-2 8h8l-2-8h4l4-4v-8l-4-6h-6v-4h-4v4z" fill="#fff"/><path d="M58 30l12-2v6l-8 2v4l8 8v6l-10-2-2-4" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/>`,
  "sp-flight": `<path d="M28 52c8-2 20-2 32 4-8 6-20 6-32 4-4-1-4-5 0-8z" fill="#fff" fill-opacity="0.92"/><path d="M36 40c4-6 10-6 16 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`,
  "sp-invisibility": `<circle cx="48" cy="50" r="16" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 4"/><path d="M36 64l24-24" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`,
  "sp-speed": `<path d="M24 50h8l-4-8 12 8h8l-4-8 12 8" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  "sp-healing": `<path d="M48 32v32M32 48h32" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="48" cy="48" r="16" fill="none" stroke="#fff" stroke-width="2.2"/>`,
  "sp-shield": `<path d="M48 24l20 8v20c0 10-8 20-20 24-12-4-20-14-20-24V32l20-8z" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/><path d="M48 40v12M42 46h12" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`,
  "sp-laser": `<path d="M30 30l10 6M66 30l-10 6M38 50h20" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="48" cy="50" r="3" fill="#fff"/>`,
  "sp-time": `<circle cx="48" cy="50" r="16" fill="none" stroke="#fff" stroke-width="2.2"/><path d="M48 38v12l8 4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
};

function superPowerTileSvg(accent, inner) {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <defs>
      <filter id="pws" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.4" flood-opacity="0.18"/>
      </filter>
    </defs>
    <rect x="6" y="6" width="84" height="84" rx="22" fill="${accent}" filter="url(#pws)"/>
    ${inner}
  </svg>`;
}

export function getSuperPowers() {
  const list = [
    { id: "sp-lightning", label: "Lightning", accent: "#ca8a04" },
    { id: "sp-fire", label: "Flame", accent: "#ea580c" },
    { id: "sp-ice", label: "Frost", accent: "#0ea5e9" },
    { id: "sp-mind", label: "Mind", accent: "#7c3aed" },
    { id: "sp-strength", label: "Strength", accent: "#dc2626" },
    { id: "sp-flight", label: "Flight", accent: "#2563eb" },
    { id: "sp-invisibility", label: "Stealth", accent: "#64748b" },
    { id: "sp-speed", label: "Speed", accent: "#eab308" },
    { id: "sp-healing", label: "Healing", accent: "#16a34a" },
    { id: "sp-shield", label: "Force field", accent: "#4f46e5" },
    { id: "sp-laser", label: "Laser", accent: "#e11d48" },
    { id: "sp-time", label: "Time", accent: "#9333ea" },
  ];
  return list.map((p) => ({
    ...p,
    dataUrl: svgDataUrl(
      superPowerTileSvg(p.accent, POWER_ICON_INNER[p.id] || ""),
    ),
  }));
}

export function mapLegacyAvatarId(id) {
  const s = String(id || "").trim();
  const powers = getSuperPowers();
  if (!powers.length) return "";
  if (powers.some((p) => p.id === s)) return s;
  if (/^(female|male)-\d+$/i.test(s)) {
    const n = Math.max(0, parseInt(s.split("-")[1], 10) - 1);
    return powers[n % powers.length].id;
  }
  return powers[0].id;
}
