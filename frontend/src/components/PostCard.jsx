import React, { useState } from "react";
import {
  Bookmark, Share2, Flag, ExternalLink, ThumbsUp,
  BookmarkCheck, Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// Source colour/label config
const SOURCE_META = {
  reddit:   { label: "Reddit",   bg: "bg-orange-500/15", text: "text-orange-400" },
  twitter:  { label: "Twitter",  bg: "bg-sky-500/15",    text: "text-sky-400"    },
  linkedin: { label: "LinkedIn", bg: "bg-blue-500/15",   text: "text-blue-400"   },
};

export default function PostCard({ post, savedPostIds = new Set(), onSaveToggle }) {
  const { refreshUser } = useAuth();
  const [saving,    setSaving]    = useState(false);
  const [reporting, setReporting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const isSaved = savedPostIds.has(post.id);
  const meta = SOURCE_META[post.source] || { label: post.source, bg: "bg-gray-700", text: "text-gray-400" };

  // ── Save / unsave ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      if (isSaved) {
        await api.delete(`/posts/save/${post.id}`);
        toast.success("Removed from saved");
      } else {
        await api.post("/posts/save", {
          postId:    post.id,
          title:     post.title,
          content:   post.content,
          source:    post.source,
          url:       post.url,
          author:    post.author,
          thumbnail: post.thumbnail,
          upvotes:   post.upvotes,
        });
        toast.success("+2 credits! Post saved");
        refreshUser();
      }
      onSaveToggle?.(post.id, !isSaved);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ── Share ──────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(post.url);
      await api.post("/posts/share", { postId: post.id, title: post.title, source: post.source, url: post.url });
      toast.success("+2 credits! Link copied");
      refreshUser();
    } catch {
      toast.error("Could not copy link");
    }
  };

  // ── Report ─────────────────────────────────────────────────────────────────
  const handleReport = async () => {
    if (!reportReason.trim() || reportReason.trim().length < 5) {
      toast.error("Please provide a reason (min 5 chars)");
      return;
    }
    setReporting(true);
    try {
      await api.post("/reports", {
        postId: post.id, title: post.title,
        source: post.source, url: post.url, reason: reportReason,
      });
      toast.success("+2 credits! Report submitted");
      setShowReport(false);
      setReportReason("");
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.error || "Report failed");
    } finally {
      setReporting(false);
    }
  };

  return (
    <article className="card flex flex-col gap-3 hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`badge ${meta.bg} ${meta.text}`}>{meta.label}</span>
          {post.author && (
            <span className="text-xs text-gray-500">by {post.author}</span>
          )}
        </div>
        <span className="text-xs text-gray-600 shrink-0">
          {new Date(post.publishedAt).toLocaleDateString()}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-100 leading-snug line-clamp-2">
        {post.title}
      </h3>

      {/* Content snippet */}
      {post.content && (
        <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
          {post.content}
        </p>
      )}

      {/* Thumbnail */}
      {post.thumbnail && (
        <img
          src={post.thumbnail}
          alt=""
          className="w-full h-36 object-cover rounded-lg"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-800">
        {/* Upvotes */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <ThumbsUp size={13} />
          <span>{post.upvotes?.toLocaleString() ?? 0}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleSave}
            disabled={saving}
            title={isSaved ? "Unsave" : "Save"}
            className={`p-2 rounded-lg transition-colors ${
              isSaved
                ? "text-brand-500 bg-brand-500/10 hover:bg-brand-500/20"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {saving
              ? <Loader2 size={16} className="animate-spin" />
              : isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />
            }
          </button>

          <button
            onClick={handleShare}
            title="Share (copy link)"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Share2 size={16} />
          </button>

          <button
            onClick={() => setShowReport(!showReport)}
            title="Report"
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <Flag size={16} />
          </button>

          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open original"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Inline report form */}
      {showReport && (
        <div className="pt-2 border-t border-gray-800 flex gap-2">
          <input
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Reason for reporting…"
            className="input text-sm py-1.5 flex-1"
          />
          <button
            onClick={handleReport}
            disabled={reporting}
            className="btn-primary text-sm py-1.5 px-3 shrink-0"
          >
            {reporting ? <Loader2 size={14} className="animate-spin" /> : "Submit"}
          </button>
        </div>
      )}
    </article>
  );
}
