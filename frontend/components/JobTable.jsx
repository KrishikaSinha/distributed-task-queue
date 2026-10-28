import React from "react";
export default function JobTable({ jobs = [] }) {
  function getStatusStyle(status) {
    switch (status) {
      case "completed":
        return "border-emerald-800 bg-emerald-950/60 text-emerald-400";
      case "running":
        return "border-sky-800 bg-sky-950/60 text-sky-400";
      case "pending":
        return "border-amber-800 bg-amber-950/60 text-amber-400";
      case "failed":
        return "border-rose-800 bg-rose-950/60 text-rose-400";
      default:
        return "border-slate-700 bg-slate-800 text-slate-300";
    }
  }

  function formatDate(date) {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleString();
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 px-4 py-10 text-center">
        <p className="font-medium text-slate-300">No jobs found</p>
        <p className="mt-2 text-sm text-slate-500">
          Create your first job using the form above.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400">
            <th className="px-3 py-3 font-medium">Job ID</th>
            <th className="px-3 py-3 font-medium">Type</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium">Worker</th>
            <th className="px-3 py-3 font-medium">Created At</th>
          </tr>
        </thead>

        <tbody>
          {jobs.map((job) => (
            <tr
              key={job.id}
              className="border-b border-slate-800/70 transition hover:bg-slate-800/30"
            >
              <td
                title={job.id}
                className="max-w-32 truncate px-3 py-4 font-mono text-xs text-slate-300"
              >
                {job.id}
              </td>

              <td className="px-3 py-4 text-slate-200">
                {job.type}
              </td>

              <td className="px-3 py-4">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(job.status)}`}
                >
                  {job.status}
                </span>
              </td>

              <td className="px-3 py-4 text-slate-400">
                {job.workerId || "—"}
              </td>

              <td className="whitespace-nowrap px-3 py-4 text-xs text-slate-400">
                {formatDate(job.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-4 text-xs text-slate-500">
        Showing {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
      </p>
    </div>
  );
}
