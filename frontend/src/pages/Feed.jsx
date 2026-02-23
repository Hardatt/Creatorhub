import React, { useEffect, useState, useCallback } from "react";
import { RefreshCw, Loader2, Filter } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import PostCard from "../components/PostCard";

const SOURCES = ["all", "reddit", "twitter", "linkedin"];

export default function Feed() {
  const [posts,      setPosts]      = useState([]);
  const [savedIds,   setSavedIds]   = useState(new Set());
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [source,     setSource]     = useState("all");
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFeed = useCallback(async (pageNum = 1, src = "all") => {
    try {
      const params = { page: pageNum, limit: 12 };
      if (src !== "all") params.source = src;
      const { data } = await api.get("/feed", { params });
      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, []);

  
  const fetchSavedIds = useCallback(async () => {
    try {
      const { data } = await api.get("/posts/saved?limit=200");
      setSavedIds(new Set(data.posts.map((p) => p.postId)));
    } catch {  }
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchFeed(1, source);
  }, [source, fetchFeed]);

  useEffect(() => {
    fetchSavedIds();
  }, [fetchSavedIds]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.post("/feed/refresh");
      setPage(1);
      await fetchFeed(1, source);
      toast.success("Feed refreshed");
    } catch {
      toast.error("Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchFeed(next, source);
  };

  const handleSaveToggle = (postId, nowSaved) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      nowSaved ? next.add(postId) : next.delete(postId);
      return next;
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={15} className="text-gray-500" />
          {SOURCES.map((s) => (
            <button
              key={s}
              onClick={() => setSource(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                source === s
                  ? "bg-brand-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-ghost flex items-center gap-2 text-sm"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-brand-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p>No posts found for this filter</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                savedPostIds={savedIds}
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>

          {}
          {page < totalPages && (
            <div className="flex justify-center pt-2">
              <button onClick={handleLoadMore} className="btn-ghost text-sm">
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
