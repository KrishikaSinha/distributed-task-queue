
import React, { useEffect, useState, useCallback } from "react";
import WorkerStatus from "../components/WorkerStatus";

const API_URL = "https://distributed-task-queue-048i.onrender.com/api/jobs";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchJobs = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);

    try {
      const response = await fetch(API_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      setJobs(Array.isArray(data) ? data : []);
      setError("");
      setLastUpdated(new Date());
    } catch {
      setError("Backend unavailable. Please check the Go server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  const statusOf = (job) =>
    String(job.status || "").toLowerCase();

  const completed = jobs.filter(
    (job) => statusOf(job) === "completed"
  ).length;

  const pending = jobs.filter(
    (job) => statusOf(job) === "pending"
  ).length;

  const running = jobs.filter((job) =>
    ["running", "processing"].includes(statusOf(job))
  ).length;

  const failed = jobs.filter(
    (job) => statusOf(job) === "failed"
  ).length;

  const processed = completed + failed;
  const otherJobs = jobs.length - completed;
  const successRate = jobs.length
    ? Math.round((completed / jobs.length) * 100)
    : 0;

  const stats = [
    { label: "Total Jobs", value: jobs.length, icon: "▦", color: "#a78bfa" },
    { label: "Running", value: running, icon: "↗", color: "#60a5fa" },
    { label: "Pending", value: pending, icon: "◷", color: "#fbbf24" },
    { label: "Completed", value: completed, icon: "✓", color: "#86c77a" },
    { label: "Failed", value: failed, icon: "!", color: "#f87171" },
  ];

  const queueSegments = [
    { label: "Pending", value: pending, color: "#fbbf24" },
    { label: "Running", value: running, color: "#60a5fa" },
    { label: "Completed", value: completed, color: "#86c77a" },
    { label: "Failed", value: failed, color: "#f87171" },
  ];

  const ringGradient = (segments) => {
    const total = segments.reduce((sum, item) => sum + item.value, 0);

    if (!total) return "#303849 0% 100%";

    let position = 0;
    return `conic-gradient(${segments
      .filter((item) => item.value > 0)
      .map((item) => {
        const start = position;
        position += (item.value / total) * 100;
        return `${item.color} ${start}% ${position}%`;
      })
      .join(", ")})`;
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-rose-400">
            TaskFlow / Monitoring
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Real-time overview of your distributed task queue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs text-slate-500">Last updated</p>
            <p className="mt-1 text-sm text-slate-300">
              {lastUpdated
                ? lastUpdated.toLocaleTimeString()
                : "Connecting..."}
            </p>
          </div>
          <button
            onClick={() => fetchJobs(true)}
            disabled={refreshing}
            className="rounded-xl border border-white/10 bg-[#171b25] px-4 py-3 text-sm font-semibold hover:border-rose-500/40 disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-4 text-sm text-rose-300">
          {error}
          <button
            onClick={() => fetchJobs(true)}
            className="ml-3 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Statistics */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map((item) => (
          <article
            key={item.label}
            className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#192233] p-4 sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-400 sm:text-sm">
                {item.label}
              </p>
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-lg"
                style={{ color: item.color }}
              >
                {item.icon}
              </span>
            </div>
            <p
              className="mt-4 text-3xl font-bold"
              style={{ color: item.color }}
            >
              {loading ? "—" : item.value.toLocaleString()}
            </p>
            <div className="mt-4 h-1 rounded-full bg-white/[0.06]">
              <div
                className="h-1 rounded-full"
                style={{
                  backgroundColor: item.color,
                  width: `${jobs.length ? Math.max(5, (item.value / jobs.length) * 100) : 0}%`,
                }}
              />
            </div>
          </article>
        ))}
      </section>

      {/* Queue and processed job charts */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="CURRENT QUEUE" subtitle="Distribution of all job statuses">
          <div className="flex flex-wrap items-center justify-center gap-6 py-3">
            <div
              className="flex h-40 w-40 shrink-0 items-center justify-center rounded-full sm:h-48 sm:w-48"
              style={{ background: ringGradient(queueSegments) }}
            >
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#192233] sm:h-36 sm:w-36">
                <span className="text-3xl font-bold">
                  {loading ? "—" : jobs.length}
                </span>
                <span className="mt-1 text-xs text-slate-400">Total jobs</span>
              </div>
            </div>

            <div className="min-w-[125px] space-y-3">
              {queueSegments.map((item) => (
                <Legend
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  color={item.color}
                />
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="PROCESSED JOBS" subtitle="Completed versus failed jobs">
          <div className="flex flex-wrap items-center justify-center gap-6 py-3">
            <div
              className="flex h-40 w-40 shrink-0 items-center justify-center rounded-full sm:h-48 sm:w-48"
              style={{
                background: ringGradient([
                  { label: "Completed", value: completed, color: "#79ad68" },
                  { label: "Failed", value: failed, color: "#e45c52" },
                ]),
              }}
            >
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#192233] sm:h-36 sm:w-36">
                <span className="text-3xl font-bold">
                  {loading ? "—" : processed}
                </span>
                <span className="mt-1 text-xs text-slate-400">Processed</span>
              </div>
            </div>

            <div className="min-w-[125px] space-y-3">
              <Legend label="Completed" value={completed} color="#79ad68" />
              <Legend label="Failed" value={failed} color="#e45c52" />
              <p className="pt-2 text-xs text-slate-500">
                Completion rate: {loading ? "—" : `${successRate}%`}
              </p>
            </div>
          </div>
        </ChartCard>
      </section>

      {/* Throughput placeholder uses actual job counts, not fabricated history */}
      <ChartCard
        title="JOB ACTIVITY"
        subtitle="Current job distribution by status — historical throughput requires backend metrics"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {queueSegments.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-white/[0.06] bg-[#151d2b] p-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-400">{item.label}</span>
              </div>
              <p
                className="mt-3 text-2xl font-bold"
                style={{ color: item.color }}
              >
                {loading ? "—" : item.value}
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: item.color,
                    width: `${jobs.length ? (item.value / jobs.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Worker monitoring and infrastructure */}
      <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <ChartCard
          title="WORKER MONITORING"
          subtitle="Worker assignments based on recorded job data"
        >
          <WorkerStatus />
        </ChartCard>

        <ChartCard
          title="SYSTEM INFORMATION"
          subtitle="Backend configuration"
        >
          <div className="space-y-4">
            <SystemRow
              label="Go Backend API"
              value={error ? "Unavailable" : "Reachable"}
              color={error ? "#f87171" : "#86c77a"}
            />
            <SystemRow label="API Endpoint" value="/api/jobs" />
            <SystemRow label="Port" value="8080" />
            <SystemRow label="Queue Technology" value="Redis" />
            <SystemRow label="Persistence" value="PostgreSQL" />

            <p className="border-t border-white/[0.08] pt-4 text-xs leading-5 text-slate-500">
              Redis and PostgreSQL connection health is not exposed by the jobs API.
              Their live status requires backend health-check support.
            </p>
          </div>
        </ChartCard>
      </section>

      <footer className="border-t border-white/[0.08] pt-4 text-center text-xs text-slate-500">
        TaskFlow · Distributed Task Queue · Go · Redis · PostgreSQL
      </footer>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="min-w-0 rounded-xl border border-white/[0.08] bg-[#192233] p-5 sm:p-6">
      <h2 className="text-xs font-bold tracking-[0.12em] text-slate-300">
        {title}
      </h2>
      <p className="mt-2 text-xs leading-5 text-slate-500">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Legend({ label, value, color }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-slate-400">{label}</span>
      <span className="ml-auto font-semibold text-slate-200">{value}</span>
    </div>
  );
}

function SystemRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span
        className="text-right text-sm font-medium"
        style={{ color: color || "#e2e8f0" }}
      >
        {value}
      </span>
    </div>
  );
}
