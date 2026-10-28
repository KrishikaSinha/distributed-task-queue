
import React, { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:8080/api/jobs";

const WORKER_IDS = [
  "worker-1",
  "worker-2",
  "worker-3",
  "worker-4",
];

export default function Workers() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch(API_URL, { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      setJobs(Array.isArray(data) ? data : data.jobs || []);
      setError("");
    } catch {
      setError(
        "Worker activity load nahi hui. Check karo backend running hai."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();

    const interval = setInterval(fetchJobs, 3000);

    return () => clearInterval(interval);
  }, [fetchJobs]);

  const getValue = (job, ...keys) => {
    for (const key of keys) {
      if (job?.[key] !== undefined && job?.[key] !== null) {
        return job[key];
      }
    }

    return "";
  };

  const getWorkerName = (job) =>
    getValue(job, "workerId", "worker_id", "WorkerID");

  const getStatus = (job) =>
    String(getValue(job, "status", "Status") || "pending").toLowerCase();

  const getStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return "border-green-500/20 bg-green-500/10 text-green-400";
      case "failed":
        return "border-red-500/20 bg-red-500/10 text-red-400";
      case "running":
      case "processing":
        return "border-blue-500/20 bg-blue-500/10 text-blue-400";
      default:
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
    }
  };

  const workerStats = useMemo(() => {
    return WORKER_IDS.map((workerId) => {
      const workerJobs = jobs.filter(
        (job) => getWorkerName(job) === workerId
      );

      const completed = workerJobs.filter(
        (job) => getStatus(job) === "completed"
      ).length;

      const failed = workerJobs.filter(
        (job) => getStatus(job) === "failed"
      ).length;

      const running = workerJobs.filter((job) =>
        ["running", "processing"].includes(getStatus(job))
      ).length;

      const retries = workerJobs.reduce(
        (total, job) =>
          total +
          Number(getValue(job, "retryCount", "RetryCount") || 0),
        0
      );

      const latestJob = [...workerJobs].sort((a, b) => {
        const dateA = new Date(
          getValue(a, "updatedAt", "UpdatedAt") || 0
        ).getTime();

        const dateB = new Date(
          getValue(b, "updatedAt", "UpdatedAt") || 0
        ).getTime();

        return dateB - dateA;
      })[0];

      return {
        id: workerId,
        total: workerJobs.length,
        completed,
        failed,
        running,
        retries,
        latestJob,
      };
    });
  }, [jobs]);

  const assignedJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs
      .filter((job) => Boolean(getWorkerName(job)))
      .filter((job) => {
        const worker = String(getWorkerName(job));
        const type = String(getValue(job, "type", "Type"));
        const id = String(getValue(job, "id", "ID"));
        const status = getStatus(job);
        const jobError = String(getValue(job, "error", "Error"));

        const matchesSearch =
          !query ||
          worker.toLowerCase().includes(query) ||
          type.toLowerCase().includes(query) ||
          id.toLowerCase().includes(query) ||
          jobError.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "all" ||
          status === statusFilter ||
          (statusFilter === "running" && status === "processing");

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(
          getValue(a, "updatedAt", "UpdatedAt") || 0
        ).getTime();

        const dateB = new Date(
          getValue(b, "updatedAt", "UpdatedAt") || 0
        ).getTime();

        return dateB - dateA;
      });
  }, [jobs, search, statusFilter]);

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleString();
  };

  const getShortId = (job) => {
    const id = getValue(job, "id", "ID");
    return id ? String(id).slice(0, 8) : "—";
  };

  const totalCompleted = jobs.filter(
    (job) => getStatus(job) === "completed"
  ).length;

  const totalFailed = jobs.filter(
    (job) => getStatus(job) === "failed"
  ).length;

  const totalRunning = jobs.filter((job) =>
    ["running", "processing"].includes(getStatus(job))
  ).length;

  const totalRetries = jobs.reduce(
    (total, job) =>
      total + Number(getValue(job, "retryCount", "RetryCount") || 0),
    0
  );

  return (
    <div className="space-y-6 text-gray-200">
      
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-2 text-sm font-medium tracking-widest text-red-400">
            PROCESS MANAGEMENT
          </p>
          <h1 className="text-3xl font-bold text-white">Workers</h1>
          <p className="mt-2 text-sm text-gray-400">
            Monitor worker assignments, processing results and retries.
          </p>
        </div>

        <button
          onClick={fetchJobs}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          {
            label: "Configured Workers",
            value: WORKER_IDS.length,
            color: "text-white",
          },
          {
            label: "Completed Jobs",
            value: totalCompleted,
            color: "text-green-400",
          },
          {
            label: "Failed Jobs",
            value: totalFailed,
            color: "text-red-400",
          },
          {
            label: "Total Retries",
            value: totalRetries,
            color: "text-orange-300",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/10 bg-[#111114] p-5"
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className={`mt-3 text-3xl font-bold ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Worker Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Statistics calculated from jobs returned by the API.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {workerStats.map((worker) => (
            <div
              key={worker.id}
              className="rounded-2xl border border-white/10 bg-[#111114] p-5 transition hover:border-red-500/30"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-sm font-bold text-red-400">
                    {worker.id.split("-")[1]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {worker.id}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Configured worker
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full border px-2 py-1 text-xs ${
                    worker.running > 0
                      ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                      : "border-white/10 bg-white/5 text-gray-400"
                  }`}
                >
                  {worker.running > 0 ? "Processing job" : "No active job recorded"}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-gray-500">Assigned</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {worker.total}
                  </p>
                </div>

                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="mt-2 text-xl font-semibold text-green-400">
                    {worker.completed}
                  </p>
                </div>

                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-gray-500">Running</p>
                  <p className="mt-2 text-xl font-semibold text-blue-400">
                    {worker.running}
                  </p>
                </div>

                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-gray-500">Failed</p>
                  <p className="mt-2 text-xl font-semibold text-red-400">
                    {worker.failed}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4 text-sm">
                <span className="text-gray-500">Retry attempts</span>
                <span className="font-mono text-orange-300">
                  {worker.retries}
                </span>
              </div>

              <div className="mt-3">
                <p className="text-xs text-gray-500">Latest assigned job</p>
                {worker.latestJob ? (
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-gray-400">
                      {getShortId(worker.latestJob)}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-1 text-xs ${getStatusStyle(
                        getStatus(worker.latestJob)
                      )}`}
                    >
                      {getStatus(worker.latestJob)}
                    </span>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-gray-600">
                    No assigned jobs found
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111114] p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Worker Activity
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Job assignments and their latest recorded statuses.
            </p>
          </div>

          <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-gray-300">
            {assignedJobs.length} jobs
          </span>
        </div>

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search worker, job type, ID or error..."
          className="mb-4 w-full rounded-lg border border-white/10 bg-[#19191e] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-500/50"
        />

        <div className="mb-5 flex flex-wrap gap-2">
          {[
            ["all", "All"],
            ["running", "Running"],
            ["completed", "Completed"],
            ["failed", "Failed"],
            ["pending", "Pending"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                statusFilter === value
                  ? "border-red-500/40 bg-red-500/10 text-red-300"
                  : "border-white/10 text-gray-400 hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="py-8 text-center text-gray-400">
            Loading worker activity...
          </p>
        ) : assignedJobs.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-300">No matching worker assignments.</p>
            <p className="mt-2 text-sm text-gray-500">
              Try another filter or create a new job.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-500">
                  <th className="py-3 pr-4 font-medium">Worker</th>
                  <th className="py-3 pr-4 font-medium">Job</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Retries</th>
                  <th className="py-3 pr-4 font-medium">Updated</th>
                  <th className="py-3 font-medium">Error</th>
                </tr>
              </thead>

              <tbody>
                {assignedJobs.map((job, index) => {
                  const retryCount = Number(
                    getValue(job, "retryCount", "RetryCount") || 0
                  );
                  const maxRetries = Number(
                    getValue(job, "maxRetries", "MaxRetries") || 0
                  );
                  const jobError = getValue(job, "error", "Error");

                  return (
                    <tr
                      key={getValue(job, "id", "ID") || index}
                      className="border-b border-white/5 align-top last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="py-4 pr-4 font-medium text-white">
                        {getWorkerName(job)}
                      </td>

                      <td className="py-4 pr-4">
                        <p className="text-gray-200">
                          {getValue(job, "type", "Type") || "—"}
                        </p>
                        <p className="mt-1 font-mono text-xs text-gray-500">
                          {getShortId(job)}
                        </p>
                      </td>

                      <td className="py-4 pr-4">
                        <span
                          className={`inline-block rounded-full border px-3 py-1 text-xs ${getStatusStyle(
                            getStatus(job)
                          )}`}
                        >
                          {getStatus(job)}
                        </span>
                      </td>

                      <td className="py-4 pr-4 font-mono text-gray-400">
                        {retryCount}/{maxRetries}
                      </td>

                      <td className="py-4 pr-4 text-xs text-gray-500">
                        {formatDate(
                          getValue(job, "updatedAt", "UpdatedAt")
                        )}
                      </td>

                      <td className="max-w-xs py-4 text-xs leading-5">
                        {jobError ? (
                          <span className="break-words text-red-400">
                            {jobError}
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        <span>Job data refreshes every 3 seconds.</span>
        <span>
          {totalRunning} running jobs across recorded assignments
        </span>
      </div>
    </div>
  );
}
