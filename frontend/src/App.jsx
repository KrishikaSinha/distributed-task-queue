
import React, { useState } from "react";

import Sidebar from "../components/Sidebar";
import Dashboard from "../pages/Dashboard";
import Jobs from "../pages/Jobs";
import Workers from "../pages/Workers";
import SystemStatus from "../pages/SystemStatus";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "jobs":
        return <Jobs />;
      case "workers":
        return <Workers />;
      case "system":
        return <SystemStatus />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white md:flex">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        {renderPage()}
      </main>
    </div>
  );
}
