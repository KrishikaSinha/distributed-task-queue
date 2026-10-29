import React, { useCallback, useEffect, useState } from "react";

const API_URL = "https://distributed-task-queue-048i.onrender.com/api/jobs";

const INITIAL_SERVICES = [
  {
    name: "Go Backend API",
    description: "Receives requests and manages jobs",
    status: "checking",
  },
  {
    name: "Redis Queue",
    description: "Stores queued jobs for workers",
    status: "checking",
  },
  {
    name: "PostgreSQL",
    description: "Persists job records and statuses",
    status: "checking",
  },
];

export default function SystemStatus() {
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [lastChecked, setLastChecked] = useState(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState("");

  const checkSystem = useCallback(async () => {
    setChecking(true);

    try {
      const response = await fetch(HEALTH_URL, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Backend health check failed (HTTP ${response.status}).`);
      }

      const data = await response.json();
      const redisStatus = data.services?.redis;
      const postgresStatus =
        data.services?.postgresql ?? data.services?.postgres;

      setServices([
        {
          ...INITIAL_SERVICES[0],
          status: "online",
        },
        {
          ...INITIAL_SERVICES[1],
          status:
            redisStatus === "online" || redisStatus === "connected"
              ? "online"
              : redisStatus === "offline" || redisStatus === "disconnected"
                ? "offline"
                : "unknown",
        },
        {
          ...INITIAL_SERVICES[2],
          status:
            postgresStatus === "online" || postgresStatus === "connected"
              ? "online"
              : postgresStatus === "offline" ||
                  postgresStatus === "disconnected"
                ? "offline"
                : "unknown",
        },
      ]);

      setCheckError("");
    } catch (error) {
      setServices([
        {
          ...INITIAL_SERVICES[0],
          status: "offline",
        },
        {
          ...INITIAL_SERVICES[1],
          status: "unknown",
        },
        {
          ...INITIAL_SERVICES[2],
          status: "unknown",
        },
      ]);

      setCheckError(
        error.message === "Failed to fetch"
          ? "Backend se connection nahi ho pa raha. Go server running hai ya nahi check karo."
          : error.message || "System health check failed."
      );
    } finally {
      setLastChecked(new Date().toLocaleTimeString());
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkSystem();

    const interval = setInterval(checkSystem, 10000);

    return () => clearInterval(interval);
  }, [checkSystem]);

  const onlineCount = services.filter(
    (service) => service.status === "online"
  ).length;

  const offlineCount = services.filter(
    (service) => service.status === "offline"
  ).length;

  const unknownCount = services.filter(
    (service) =>
      service.status === "unknown" || service.status === "checking"
  ).length;

  const overallStatus =
    checking && !lastChecked
      ? "Checking..."
      : offlineCount > 0
        ? "Degraded"
        : unknownCount > 0
          ? "Partially verified"
          : onlineCount === services.length
            ? "All systems operational"
            : "Checking...";

  const statusLabel = (status) => {
    switch (status) {
      case "online":
        return "Online";
      case "offline":
        return "Offline";
      case "checking":
        return "Checking...";
      default:
        return "Unable to verify";
    }
  };

  const statusStyle = (status) => {
    switch (status) {
      case "online":
        return "bg-green-500/10 text-green-400";
      case "offline":
        return "bg-red-500/10 text-red-400";
      case "checking":
        return "bg-yellow-500/10 text-yellow-400";
      default:
        return "bg-gray-500/10 text-gray-300";
    }
  };

  const dotStyle = (status) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      case "checking":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-2 text-sm font-bold tracking-widest text-red-400">
            INFRASTRUCTURE
          </p>

          <h1 className="text-3xl font-bold">System Status</h1>

          <p className="mt-2 text-sm text-slate-400">
            Monitor your task queue infrastructure and service health.
          </p>
        </div>

        <button
          onClick={checkSystem}
          disabled={checking}
          className="rounded-xl border border-white/10 bg-[#171b25] px-4 py-3 text-sm font-semibold transition hover:border-red-500/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {checking ? "Checking..." : "↻ Check Again"}
        </button>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Services Online"
          value={`${onlineCount}/${services.length}`}
          description="Services responding to health checks"
          color="text-green-400"
        />

        <SummaryCard
          label="Services Offline"
          value={offlineCount}
          description="Services reported unavailable"
          color="text-red-400"
        />

        <SummaryCard
          label="Overall Status"
          value={overallStatus}
          description="Based on the latest health check"
          color={
            offlineCount > 0 || unknownCount > 0
              ? "text-yellow-400"
              : "text-green-400"
          }
        />
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#192233] p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Service Overview</h2>

        <p className="mb-5 mt-1 text-sm text-slate-500">
          Services are checked automatically every 10 seconds.
        </p>

        {checkError && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {checkError}
          </div>
        )}

        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-[#151d2b] p-4"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${dotStyle(service.status)}`}
                />

                <div>
                  <h3 className="font-medium">{service.name}</h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {service.description}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(service.status)}`}
              >
                {statusLabel(service.status)}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-5 text-xs text-slate-500">
          Last checked: {lastChecked || "Checking..."}
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#192233] p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold">Architecture</h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ArchitectureCard label="API Layer" value="Go + HTTP" />
          <ArchitectureCard label="Queue" value="Redis" />
          <ArchitectureCard label="Persistence" value="PostgreSQL" />
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          Backend availability is checked through the health endpoint.
          Redis and PostgreSQL statuses depend on the services information
          returned by the backend. Worker activity is monitored separately.
        </p>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, description, color }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#192233] p-5">
      <p className="text-sm text-slate-400">{label}</p>

      <p className={`mt-3 break-words text-2xl font-bold ${color}`}>
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function ArchitectureCard({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm text-slate-400">{label}</p>

      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}