import React from "react";
export default function WorkerStatus() {
  const workers = [
    { id: "worker-1", role: "Background processor" },
    { id: "worker-2", role: "Background processor" },
    { id: "worker-3", role: "Background processor" },
    { id: "worker-4", role: "Background processor" },
  ];

  return (
    <section className="rounded-2xl border border-slate-800 bg-[#10131c] p-5">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Worker Pool</h2>
        <p className="mt-1 text-sm text-slate-400">
          Configured background workers
        </p>
      </div>

      <div className="mb-5 rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-4">
        <p className="text-sm text-slate-400">Configured Workers</p>
        <p className="mt-2 text-3xl font-bold text-emerald-400">
          4
          <span className="ml-2 text-sm font-normal text-slate-400">
            workers
          </span>
        </p>
      </div>

      <div className="space-y-3">
        {workers.map((worker) => (
          <div
            key={worker.id}
            className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#0b0e16] p-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-950/60 text-violet-300">
              <span className="text-lg">⚙</span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-200">{worker.id}</p>
              <p className="mt-1 text-xs text-slate-500">{worker.role}</p>
            </div>

            <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-400">
              Configured
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-slate-800 pt-4">
        <p className="text-sm text-slate-400">
          Queue transport
          <span className="float-right font-medium text-rose-400">Redis</span>
        </p>
        <p className="mt-3 text-sm text-slate-400">
          Job persistence
          <span className="float-right font-medium text-sky-400">
            PostgreSQL
          </span>
        </p>
      </div>
    </section>
  );
}
