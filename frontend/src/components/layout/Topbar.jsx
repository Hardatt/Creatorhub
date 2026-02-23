import React from "react";
import { Menu, Coins, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/feed":      "Feed",
  "/saved":     "Saved Posts",
  "/admin":     "Admin Panel",
};

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const title = PAGE_TITLES[pathname] || "Creator Dashboard";

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 md:px-6 shrink-0">
      {}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-400 hover:text-white p-1 rounded"
        >
          <Menu size={22} />
        </button>
        <h1 className="text-base font-semibold text-white">{title}</h1>
      </div>

      {}
      <div className="flex items-center gap-3">
        {}
        <div className="hidden sm:flex items-center gap-1.5 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
          <Coins size={14} className="text-yellow-400" />
          <span className="text-sm font-semibold text-yellow-300">
            {user?.credits ?? 0}
          </span>
          <span className="text-xs text-gray-500">credits</span>
        </div>

        {}
        <button className="relative text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
          <Bell size={18} />
        </button>

        {}
        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center font-bold text-white text-xs">
          {user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}
