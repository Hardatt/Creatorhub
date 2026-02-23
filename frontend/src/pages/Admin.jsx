import React, { useEffect, useState, useCallback } from "react";
import {
  Users, Flag, Activity, BarChart2, Coins, Loader2,
  CheckCircle, XCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import StatCard from "../components/StatCard";


const TABS = [
  { id: "users",     label: "Users",     icon: Users },
  { id: "reports",   label: "Reports",   icon: Flag },
  { id: "logs",      label: "Logs",      icon: Activity },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
];

export default function Admin() {
  const [tab, setTab] = useState("users");

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              tab === id
                ? "bg-brand-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {tab === "users"     && <UsersTab />}
      {tab === "reports"   && <ReportsTab />}
      {tab === "logs"      && <LogsTab />}
      {tab === "analytics" && <AnalyticsTab />}
    </div>
  );
}


function UsersTab() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [adj,     setAdj]     = useState({}); 

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.users);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdjust = async (userId) => {
    const { amount, reason } = adj[userId] || {};
    if (!amount || !reason) return toast.error("Amount and reason required");
    try {
      const { data } = await api.patch(`/admin/users/${userId}/credits`, {
        amount: parseInt(amount), reason,
      });
      toast.success(`Credits adjusted → ${data.newBalance}`);
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, credits: data.newBalance } : u)
      );
      setAdj((p) => ({ ...p, [userId]: { amount: "", reason: "" } }));
    } catch (err) {
      toast.error(err.response?.data?.error || "Adjustment failed");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="card overflow-hidden p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400 text-left">
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Credits</th>
            <th className="px-4 py-3 font-medium">Adjust</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
              <td className="px-4 py-3">
                <p className="text-white font-medium">{u.name || u.username}</p>
                <p className="text-gray-500 text-xs">{u.email}</p>
              </td>
              <td className="px-4 py-3">
                <span className={`badge ${u.role === "admin" ? "bg-red-500/15 text-red-400" : "bg-brand-500/15 text-brand-400"}`}>
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="font-semibold text-yellow-400">{u.credits}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="number"
                    value={adj[u.id]?.amount || ""}
                    onChange={(e) => setAdj((p) => ({ ...p, [u.id]: { ...p[u.id], amount: e.target.value } }))}
                    placeholder="±amount"
                    className="input text-xs py-1 w-20"
                  />
                  <input
                    value={adj[u.id]?.reason || ""}
                    onChange={(e) => setAdj((p) => ({ ...p, [u.id]: { ...p[u.id], reason: e.target.value } }))}
                    placeholder="Reason"
                    className="input text-xs py-1 w-32"
                  />
                  <button
                    onClick={() => handleAdjust(u.id)}
                    className="btn-primary text-xs py-1 px-3"
                  >
                    Apply
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("pending");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/reports", { params: { status: filter } });
      setReports(data.reports);
    } catch { toast.error("Failed to load reports"); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (reportId, status) => {
    try {
      await api.patch(`/admin/reports/${reportId}`, { status });
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      toast.success(`Report marked as ${status}`);
    } catch { toast.error("Update failed"); }
  };

  return (
    <div className="space-y-3">
      {}
      <div className="flex gap-2">
        {["pending", "reviewed", "dismissed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              filter === s ? "bg-brand-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : reports.length === 0 ? (
        <div className="card text-center text-gray-600 py-10">No {filter} reports</div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="card space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white text-sm">{r.title || r.postId}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Reported by {r.user?.username} · {r.source} ·{" "}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`badge shrink-0 ${
                  r.status === "pending" ? "bg-yellow-500/15 text-yellow-400"
                  : r.status === "reviewed" ? "bg-green-500/15 text-green-400"
                  : "bg-gray-500/15 text-gray-400"
                }`}>
                  {r.status}
                </span>
              </div>
              <p className="text-sm text-gray-400 bg-gray-800 rounded-lg px-3 py-2">
                {r.reason}
              </p>
              {r.status === "pending" && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => updateStatus(r.id, "reviewed")}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors"
                  >
                    <CheckCircle size={13} /> Reviewed
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, "dismissed")}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-700 text-gray-400 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <XCircle size={13} /> Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function LogsTab() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/logs?limit=50")
      .then(({ data }) => setLogs(data.logs))
      .catch(() => toast.error("Failed to load logs"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="card overflow-hidden p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400 text-left">
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Action</th>
            <th className="px-4 py-3 font-medium">Detail</th>
            <th className="px-4 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
              <td className="px-4 py-3 text-white">{l.user?.username}</td>
              <td className="px-4 py-3">
                <span className="badge bg-gray-700 text-gray-300">{l.action}</span>
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                {l.metadata?.title || l.metadata?.reason || "—"}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(l.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


function AnalyticsTab() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/analytics")
      .then(({ data }) => setData(data))
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const { topUsers = [], mostSaved = [], stats = {} } = data || {};

  return (
    <div className="space-y-5">
      {}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}  label="Total Users"    value={stats.totalUsers    || 0} color="text-brand-400" />
        <StatCard icon={Flag}   label="Total Reports"  value={stats.totalReports  || 0} color="text-red-400" />
        <StatCard icon={Flag}   label="Pending Reports" value={stats.pendingReports || 0} color="text-yellow-400" />
        <StatCard icon={Coins}  label="Posts Saved"    value={stats.totalSaved    || 0} color="text-green-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {}
        <div className="card space-y-3">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Users size={16} className="text-brand-400" /> Top Users by Credits
          </h3>
          <ol className="space-y-2">
            {topUsers.map((u, i) => (
              <li key={u.id} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-5 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{u.name || u.username}</p>
                </div>
                <span className="text-sm font-semibold text-yellow-400">{u.credits}</span>
              </li>
            ))}
          </ol>
        </div>

        {}
        <div className="card space-y-3">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <BarChart2 size={16} className="text-brand-400" /> Most Saved Posts
          </h3>
          {mostSaved.length === 0 ? (
            <p className="text-sm text-gray-600">No data yet</p>
          ) : (
            <ol className="space-y-2">
              {mostSaved.map((p, i) => (
                <li key={p.postId} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-5 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{p.title}</p>
                    <p className="text-xs text-gray-500">{p.source}</p>
                  </div>
                  <span className="text-sm font-semibold text-brand-400">
                    {p.saveCount}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-40">
      <Loader2 size={28} className="animate-spin text-brand-500" />
    </div>
  );
}
