import React from "react";
import {
  LogIn, Bookmark, Share2, Flag, User, Zap,
} from "lucide-react";

const ACTION_META = {
  login:          { icon: LogIn,    color: "text-green-400",  label: "Logged in" },
  save_post:      { icon: Bookmark, color: "text-brand-400",  label: "Saved a post" },
  share_post:     { icon: Share2,   color: "text-sky-400",    label: "Shared a post" },
  report_post:    { icon: Flag,     color: "text-red-400",    label: "Reported a post" },
  profile_update: { icon: User,     color: "text-purple-400", label: "Updated profile" },
};

export default function ActivityFeed({ logs = [] }) {
  if (!logs.length) {
    return (
      <div className="text-center py-10 text-gray-600">
        <Zap size={28} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {logs.map((log) => {
        const meta = ACTION_META[log.action] || {
          icon: Zap, color: "text-gray-400", label: log.action,
        };
        const Icon = meta.icon;

        return (
          <li key={log.id} className="flex items-start gap-3">
            <div className={`mt-0.5 shrink-0 ${meta.color}`}>
              <Icon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-300">{meta.label}</p>
              {log.metadata?.title && (
                <p className="text-xs text-gray-500 truncate">{log.metadata.title}</p>
              )}
            </div>
            <span className="text-xs text-gray-600 shrink-0">
              {new Date(log.createdAt).toLocaleDateString()}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
