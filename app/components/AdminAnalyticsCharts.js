"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const chartPanel =
  "rounded-2xl border border-slate-200/40 bg-[#ececec] p-4 shadow-[8px_8px_20px_rgba(0,0,0,0.06),-6px_-6px_16px_rgba(255,255,255,0.85)] sm:p-5";

function dayTick(iso) {
  if (!iso || typeof iso !== "string" || iso.length < 10) return iso;
  return iso.slice(5);
}

/**
 * @param {object} props
 * @param {Array<{ name: string, value: number, fill: string }>} [props.genderDonut]
 * @param {Array<{ date: string, signups: number, logins: number }>} [props.dailyActivity]
 * @param {Array<{ name: string, count: number }>} [props.topProgrammingLanguages]
 * @param {number} [props.totalProfiles]
 */
export default function AdminAnalyticsCharts({
  genderDonut = [],
  dailyActivity = [],
  topProgrammingLanguages = [],
  totalProfiles = 0,
}) {
  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={chartPanel}>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Gender (profiles)</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Distribution of saved gender in portfolio profiles{totalProfiles ? ` (n=${totalProfiles})` : ""}.
          </p>
          {genderDonut.length > 0 ? (
            <div className="mt-4 h-[300px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderDonut}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="42%"
                    outerRadius="70%"
                    paddingAngle={2}
                    label={false}
                  >
                    {genderDonut.map((e, i) => (
                      <Cell key={e.name + i} fill={e.fill} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                    formatter={(value, name) => [value, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">No profile data to chart yet.</p>
          )}
        </div>

        <div className={chartPanel}>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Programming languages</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            How often each language is listed across all profiles (stack overlap allowed).
          </p>
          {topProgrammingLanguages.length > 0 ? (
            <div className="mt-4 h-[300px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topProgrammingLanguages}
                  margin={{ top: 4, right: 8, left: 4, bottom: 4 }}
                >
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={92}
                    tick={{ fontSize: 11, fill: "#334155" }}
                  />
                  <Bar dataKey="count" name="Mentions" fill="#29243b" radius={[0, 8, 8, 0]} maxBarSize={22} />
                  <Tooltip
                    contentStyle={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                    formatter={(v) => [v, "Mentions"]}
                    cursor={{ fill: "rgba(41, 36, 59, 0.06)" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">No language lists saved yet.</p>
          )}
        </div>
      </div>

      <div className={chartPanel}>
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Activity by day (UTC)</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          New user accounts and successful sign-ins (up to the last 120 days with any activity). Sign-ins are
          recorded from this build onward.
        </p>
        {dailyActivity.length > 0 ? (
          <div className="mt-4 h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyActivity} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickFormatter={dayTick}
                  interval="preserveStartEnd"
                />
                <YAxis
                  allowDecimals={false}
                  width={28}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <Tooltip
                  labelFormatter={(label) => (typeof label === "string" ? label : String(label))}
                  contentStyle={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="signups"
                  name="New accounts"
                  stroke="#29243b"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="logins"
                  name="Sign-ins"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-6 text-sm text-slate-500">No account dates or sign-in events yet.</p>
        )}
      </div>
    </div>
  );
}
