import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Coins, Bookmark, Activity, Zap, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import StatCard    from "../components/StatCard";
import ActivityFeed from "../components/ActivityFeed";
import PostCard    from "../components/PostCard";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [profile,    setProfile]    = useState(null);
  const [activity,   setActivity]   = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [history,    setHistory]    = useState([]);
  const [loading,    setLoading]    = useState(true);

  
  const [editing, setEditing]       = useState(false);
  const [editForm, setEditForm]     = useState({ name: "", bio: "", avatar: "" });
  const [saving,   setSaving]       = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, activityRes, savedRes, historyRes] = await Promise.all([
          api.get("/users/profile"),
          api.get("/users/activity"),
          api.get("/posts/saved?limit=3"),
          api.get("/credits/history?limit=5"),
        ]);
        setProfile(profileRes.data.user);
        setActivity(activityRes.data.logs);
        setSavedPosts(savedRes.data.posts);
        setHistory(historyRes.data.history);
        setEditForm({
          name:   profileRes.data.user.name   || "",
          bio:    profileRes.data.user.bio    || "",
          avatar: profileRes.data.user.avatar || "",
        });
      } catch (err) {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/users/profile", editForm);
      setProfile(data.user);
      setEditing(false);
      if (data.profileBonus?.awarded) {
        toast.success("+20 credits! Profile completed");
      } else {
        toast.success("Profile updated");
      }
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Coins}
          label="Total Credits"
          value={profile?.credits ?? 0}
          color="text-yellow-400"
          sub="Earn by interacting with posts"
        />
        <StatCard
          icon={Bookmark}
          label="Saved Posts"
          value={savedPosts.length}
          color="text-brand-400"
        />
        <StatCard
          icon={Activity}
          label="Actions Taken"
          value={activity.length}
          color="text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Profile</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="text-xs text-brand-400 hover:text-brand-300 font-medium"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          {}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-brand-600 flex items-center justify-center text-xl font-bold text-white shrink-0">
              {profile?.name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-white">{profile?.name || profile?.username}</p>
              <p className="text-sm text-gray-400">{profile?.email}</p>
              <span className={`badge mt-1 ${profile?.role === "admin" ? "bg-red-500/15 text-red-400" : "bg-brand-100/10 text-brand-400"}`}>
                {profile?.role}
              </span>
            </div>
          </div>

          {editing ? (
            <div className="space-y-3">
              <input
                value={editForm.name}
                onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                className="input text-sm"
                placeholder="Full name"
              />
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm(p => ({ ...p, bio: e.target.value }))}
                className="input text-sm resize-none"
                rows={3}
                placeholder="Short bio…"
              />
              <input
                value={editForm.avatar}
                onChange={(e) => setEditForm(p => ({ ...p, avatar: e.target.value }))}
                className="input text-sm"
                placeholder="Avatar URL"
              />
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Save profile
              </button>
              {!profile?.isProfileComplete && (
                <p className="text-xs text-yellow-500 text-center">
                  Fill name, bio & avatar to earn +20 credits!
                </p>
              )}
            </div>
          ) : (
            profile?.bio && (
              <p className="text-sm text-gray-400">{profile.bio}</p>
            )
          )}
        </div>

        {}
        <div className="card space-y-4">
          <h2 className="font-semibold text-white">Credit History</h2>
          {history.length === 0 ? (
            <p className="text-sm text-gray-600">No credits yet</p>
          ) : (
            <ul className="space-y-2">
              {history.map((h) => (
                <li key={h.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 truncate">{h.reason}</span>
                  <span className={`font-semibold shrink-0 ml-2 ${h.type === "earn" ? "text-green-400" : "text-red-400"}`}>
                    {h.type === "earn" ? "+" : ""}{h.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent Activity</h2>
          </div>
          <ActivityFeed logs={activity.slice(0, 8)} />
        </div>
      </div>

      {}
      {savedPosts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Recently Saved</h2>
            <Link
              to="/saved"
              className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savedPosts.map((p) => (
              <PostCard
                key={p.id}
                post={{
                  id: p.postId, title: p.title, content: p.content,
                  source: p.source, url: p.url, author: p.author,
                  thumbnail: p.thumbnail, upvotes: p.upvotes,
                  publishedAt: p.createdAt,
                }}
                savedPostIds={new Set(savedPosts.map(s => s.postId))}
              />
            ))}
          </div>
        </div>
      )}

      {}
      <div className="card bg-gradient-to-br from-brand-600/20 to-purple-600/10 border-brand-600/30">
        <div className="flex items-start gap-3">
          <Zap size={20} className="text-brand-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-white mb-2">How to earn credits</h3>
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {[
                ["+10", "Daily login"],
                ["+20", "Complete profile"],
                ["+2", "Save a post"],
                ["+2", "Share a post"],
              ].map(([amt, label]) => (
                <li key={label} className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <span className="text-lg font-bold text-yellow-400">{amt}</span>
                  <p className="text-gray-400 text-xs mt-0.5">{label}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
