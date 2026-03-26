"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotificationsPage() {
  const [showEmpty, setShowEmpty] = useState(true);

  if (showEmpty) {
    return (
      <div className="min-h-[60vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-slate-100">Notifications</h1>
          <button
            onClick={() => setShowEmpty(false)}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Mock: show data
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={<Bell size={32} />}
            heading="All caught up"
            body="You have no notifications right now. We'll let you know when there's something important — like yield updates or completed transactions."
            ctaLabel="Go to dashboard"
            ctaHref="/dashboard"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-8">
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-2xl font-bold text-slate-100">Notifications</h1>
        <button
          onClick={() => setShowEmpty(true)}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Mock: show empty
        </button>
      </div>
      <p className="text-slate-400">Notifications content goes here.</p>
    </div>
  );
}
