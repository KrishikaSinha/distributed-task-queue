
import React from "react";

const navigation = [
  {
    name: "Dashboard",
    icon: "▦",
    page: "dashboard",
    description: "Overview",
  },
  {
    name: "Jobs",
    icon: "☷",
    page: "jobs",
    description: "Manage tasks",
  },
  {
    name: "Workers",
    icon: "⚙",
    page: "workers",
    description: "Worker pool",
  },
  {
    name: "System Status",
    icon: "◉",
    page: "system",
    description: "Infrastructure",
  },
];

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-white/[0.08] bg-[#111722] p-4 md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r md:p-5">
      {/* Brand */}
      <div className="mb-6 flex items-center gap-3 px-2 py-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-xl font-bold text-white shadow-lg shadow-red-950/40">
          T
        </div>

        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-white">
            Task<span className="text-red-500">Flow</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Distributed Task Queue
          </p>
        </div>
      </div>

      {/* Workspace */}
      <div className="mb-6 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-lg">
            ◈
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-200">
              Task Queue
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Local workspace
            </p>
          </div>

          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
        </div>
      </div>

      {/* Navigation */}
      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
        Main Menu
      </p>

      <nav className="flex flex-row flex-wrap gap-2 md:flex-col">
        {navigation.map((item) => {
          const active = activePage === item.page;

          return (
            <button
              key={item.page}
              type="button"
              onClick={() => setActivePage(item.page)}
              aria-current={active ? "page" : undefined}
              className={`group flex min-w-0 flex-1 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition duration-200 md:flex-none ${
                active
                  ? "border-red-500/20 bg-red-600 text-white shadow-lg shadow-red-950/20"
                  : "border-transparent text-slate-400 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg ${
                  active
                    ? "bg-white/15 text-white"
                    : "bg-white/[0.04] text-slate-400 group-hover:text-white"
                }`}
              >
                {item.icon}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  {item.name}
                </span>

                <span
                  className={`mt-0.5 hidden text-[11px] md:block ${
                    active ? "text-red-100/80" : "text-slate-500"
                  }`}
                >
                  {item.description}
                </span>
              </span>

              {active && (
                <span className="ml-auto hidden text-sm md:block">
                  ›
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Compact Bottom Information */}
      <div className="mt-4 hidden md:mt-auto md:block">
        <div className="rounded-xl border border-white/[0.08] bg-[#171e2b] p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />

            <p className="text-xs font-semibold text-slate-200">
              Queue Dashboard
            </p>
          </div>

          <p className="mt-2 text-xs leading-4 text-slate-400">
            Monitor jobs, workers and system activity.
          </p>
        </div>
      </div>
    </aside>
  );
}
