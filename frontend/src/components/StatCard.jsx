import React from "react";

export default function StatCard({ icon: Icon, label, value, color = "text-brand-500", sub }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-gray-800 ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
        {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
