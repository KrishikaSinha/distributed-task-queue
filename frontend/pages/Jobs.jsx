
import React, { useCallback, useEffect, useMemo, useState } from "react";
import JobForm from "../components/JobForm";

const API_URL = "https://distributed-task-queue-048i.onrender.com/api/jobs";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch(API_URL, { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Unable to fetch jobs.");
      }

      const data = await response.json();
      setJobs(Array.isArray(data) ? data : data.jobs || []);
      setError("");
    } catch {
      setError("Jobs load nahi ho pa rahi hain. Check karo backend running hai.");
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

  const getStatus = (job) =>
    String(getValue(job, "status", "Status") || "pending").toLowerCase();

  const getStatusStyle = (status) => {
    switch (String(status).toLowerCase()) {
      case "completed":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "failed":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "running":
      case "processing":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }
  };

  const statusCounts = useMemo(() => {
    const counts = {
      all: jobs.length,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
    };

    jobs.forEach((job) => {
      const status = getStatus(job);

      if (status === "processing") {
        counts.running += 1;
      } else if (Object.prototype.hasOwnProperty.call(counts, status)) {
        counts[status] += 1;
      }
    });

    return counts;
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const id = String(getValue(job, "id", "ID"));
      const type = String(getValue(job, "type", "Type"));
      const worker = String(
        getValue(job, "workerId", "worker_id", "WorkerID")
      );
      const jobError = String(getValue(job, "error", "Error"));
      const status = getStatus(job);

      const matchesSearch =
        !query ||
        id.toLowerCase().includes(query) ||
        type.toLowerCase().includes(query) ||
        worker.toLowerCase().includes(query) ||
        jobError.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter ||
        (statusFilter === "running" && status === "processing");

      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleString();
  };

  const truncateId = (id) => {
    const value = String(id || "");
    return value ? `${value.slice(0, 8)}...` : "—";
  };

  return (
    <div className="space-y-6 text-gray-200">
      
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-2 text-sm font-medium tracking-widest text-red-400">
            TASK MANAGEMENT
          </p>
          <h1 className="text-3xl font-bold text-white">Jobs</h1>
          <p className="mt-2 text-sm text-gray-400">
            Create, search and monitor background jobs, retries and failures.
          </p>
        </div>

        <button
          onClick={fetchJobs}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {[
          { label: "Total Jobs", value: statusCounts.all, color: "text-white" },
          { label: "Pending", value: statusCounts.pending, color: "text-yellow-400" },
          { label: "Running", value: statusCounts.running, color: "text-blue-400" },
          { label: "Completed", value: statusCounts.completed, color: "text-green-400" },
          { label: "Failed", value: statusCounts.failed, color: "text-red-400" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/10 bg-[#111114] p-4"
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className={`mt-2 text-2xl font-bold ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#111114] p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Create a New Job
        </h2>
        <JobForm />
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111114] p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">All Jobs</h2>
            <p className="mt-1 text-sm text-gray-500">
              Automatically refreshes every 3 seconds.
            </p>
          </div>

          <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-gray-300">
            {filteredJobs.length} of {jobs.length} jobs
          </span>
        </div>

        
        <div className="mb-4">
          <label
            htmlFor="job-search"
            className="mb-2 block text-sm text-gray-400"
          >
            Search jobs
          </label>
          <input
            id="job-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by job ID, type, worker or error..."
            className="w-full rounded-lg border border-white/10 bg-[#19191e] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-500/50"
          />
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {[
            ["all", "All"],
            ["pending", "Pending"],
            ["running", "Running"],
            ["completed", "Completed"],
            ["failed", "Failed"],
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

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <p className="py-8 text-center text-gray-400">Loading jobs...</p>
        ) : filteredJobs.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-300">No matching jobs found.</p>
            <p className="mt-2 text-sm text-gray-500">
              Try another search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-500">
                  <th className="py-3 pr-4 font-medium">Job</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Retries</th>
                  <th className="py-3 pr-4 font-medium">Worker</th>
                  <th className="py-3 pr-4 font-medium">Updated</th>
                  <th className="py-3 font-medium">Details</th>
                </tr>
              </thead>

              <tbody>
                {filteredJobs.map((job, index) => {
                  const id = getValue(job, "id", "ID");
                  const type = getValue(job, "type", "Type") || "—";
                  const status = getStatus(job);
                  const retryCount = Number(
                    getValue(job, "retryCount", "RetryCount") || 0
                  );
                  const maxRetries = Number(
                    getValue(job, "maxRetries", "MaxRetries") || 0
                  );
                  const worker = getValue(
                    job,
                    "workerId",
                    "worker_id",
                    "WorkerID"
                  );
                  const jobError = getValue(job, "error", "Error");
                  const updatedAt = getValue(
                    job,
                    "updatedAt",
                    "UpdatedAt"
                  );

                  return (
                    <tr
                      key={id || index}
                      className="border-b border-white/5 align-top last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="py-4 pr-4">
                        <p className="font-medium text-white">{type}</p>
                        <p
                          title={String(id || "")}
                          className="mt-1 font-mono text-xs text-gray-500"
                        >
                          {truncateId(id)}
                        </p>
                        {status === "failed" && jobError && (
                          <p className="mt-2 max-w-xs text-xs leading-5 text-red-400">
                            {jobError}
                          </p>
                        )}
                      </td>

                      <td className="py-4 pr-4">
                        <span
                          className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(status)}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="py-4 pr-4">
                        <span
                          className={`font-mono ${
                            retryCount > 0
                              ? "text-orange-300"
                              : "text-gray-400"
                          }`}
                        >
                          {retryCount}/{maxRetries}
                        </span>
                      </td>

                      <td className="py-4 pr-4 text-gray-400">
                        {worker || "—"}
                      </td>

                      <td className="py-4 pr-4 text-xs text-gray-500">
                        {formatDate(updatedAt)}
                      </td>

                      <td className="py-4">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:border-red-500/40 hover:text-red-300"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4"
          onClick={() => setSelectedJob(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-details-title"
            className="my-auto max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#151519] p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs tracking-widest text-red-400">
                  JOB INFORMATION
                </p>
                <h2
                  id="job-details-title"
                  className="mt-2 text-xl font-bold text-white"
                >
                  {getValue(selectedJob, "type", "Type") || "Job Details"}
                </h2>
              </div>

              <button
                onClick={() => setSelectedJob(null)}
                aria-label="Close job details"
                className="rounded-lg border border-white/10 px-3 py-1 text-gray-400 hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <div className="mb-5">
              <span
                className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(getStatus(selectedJob))}`}
              >
                {getStatus(selectedJob)}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Job ID", getValue(selectedJob, "id", "ID") || "—"],
                [
                  "Worker ID",
                  getValue(selectedJob, "workerId", "worker_id", "WorkerID") || "—",
                ],
                [
                  "Retry Count",
                  `${Number(getValue(selectedJob, "retryCount", "RetryCount") || 0)} / ${Number(getValue(selectedJob, "maxRetries", "MaxRetries") || 0)}`,
                ],
                [
                  "Created At",
                  formatDate(getValue(selectedJob, "createdAt", "CreatedAt")),
                ],
                [
                  "Updated At",
                  formatDate(getValue(selectedJob, "updatedAt", "UpdatedAt")),
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="min-w-0 rounded-lg border border-white/5 bg-white/[0.02] p-3"
                >
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="mt-2 break-all text-sm text-gray-200">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <p className="mb-2 text-xs text-gray-500">Payload</p>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm text-gray-300">
                {(() => {
                  const payload = getValue(selectedJob, "payload", "Payload");
                  if (payload === "") return "—";
                  if (typeof payload === "string") return payload;

                  try {
                    return JSON.stringify(payload, null, 2);
                  } catch {
                    return String(payload);
                  }
                })()}
              </pre>
            </div>

            <div className="mt-4 rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <p className="mb-2 text-xs text-gray-500">Error Details</p>
              <p
                className={`break-words text-sm ${
                  getValue(selectedJob, "error", "Error")
                    ? "text-red-400"
                    : "text-gray-500"
                }`}
              >
                {getValue(selectedJob, "error", "Error") || "No errors recorded."}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedJob(null)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
