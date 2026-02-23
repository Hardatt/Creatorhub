import React, { useEffect, useState, useCallback } from "react";
import { Bookmark, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import PostCard from "../components/PostCard";

export default function SavedPosts() {
  const [posts,      setPosts]      = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [savedIds,   setSavedIds]   = useState(new Set());

  const fetchSaved = useCallback(async () => {
    try {
      const { data } = await api.get("/posts/saved?limit=100");
      setPosts(data.posts);
      setFiltered(data.posts);
      setSavedIds(new Set(data.posts.map((p) => p.postId)));
    } catch {
      toast.error("Failed to load saved posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  // Client-side search filter
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.source.toLowerCase().includes(q)
      )
    );
  }, [search, posts]);

  const handleSaveToggle = (postId, nowSaved) => {
    if (!nowSaved) {
      // Remove from local list immediately after unsave
      setPosts((prev) => prev.filter((p) => p.postId !== postId));
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
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
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bookmark size={18} className="text-brand-400" />
          <h2 className="font-semibold text-white">
            Saved Posts
            <span className="ml-2 text-sm text-gray-500 font-normal">
              ({posts.length})
            </span>
          </h2>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-sm py-2 w-56"
            placeholder="Search saved posts…"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <Bookmark size={32} className="mx-auto mb-3 opacity-30" />
          <p>{search ? "No posts match your search" : "No saved posts yet"}</p>
          {!search && (
            <p className="text-sm mt-1">
              Browse the <a href="/feed" className="text-brand-400 hover:underline">feed</a> and bookmark posts you like.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PostCard
              key={p.id}
              post={{
                id:          p.postId,
                title:       p.title,
                content:     p.content,
                source:      p.source,
                url:         p.url,
                author:      p.author,
                thumbnail:   p.thumbnail,
                upvotes:     p.upvotes,
                publishedAt: p.createdAt,
              }}
              savedPostIds={savedIds}
              onSaveToggle={handleSaveToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
