"use client";

import React, { useState, useRef } from "react";
import { NotificationCenter } from "./NotificationCenter";
import { useNotifications } from "@/hooks/useNotifications";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { analytics } from "@/lib/analytics";

export function NotificationToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const containerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(containerRef, () => setIsOpen(false));

  const toggle = () => {
    const newOpen = !isOpen;
    setIsOpen(newOpen);
    analytics.track("notification_panel_toggle", { isOpen: newOpen });
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggle}
        className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        aria-label="Toggle notifications"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-400 text-[10px] font-bold text-dark-900 ring-2 ring-dark-900">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 z-[100] animate-in fade-in zoom-in duration-200 origin-top-right">
          <NotificationCenter />
        </div>
      )}
    </div>
  );
}
