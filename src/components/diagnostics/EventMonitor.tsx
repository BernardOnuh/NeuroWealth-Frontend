import React from "react";
import { AnalyticsEvent } from "@/lib/analytics";

interface EventMonitorProps {
  events: AnalyticsEvent[];
  onClear: () => void;
}

export function EventMonitor({ events, onClear }: EventMonitorProps) {
  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
      <div className="p-2 border-b border-slate-700 flex justify-between bg-slate-800">
        <span className="text-[10px] uppercase font-bold text-slate-500">Analytics Events</span>
        <button onClick={onClear} className="text-[10px] text-slate-400 hover:text-white">Clear</button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 font-mono text-[10px] space-y-2">
        {events.length === 0 ? (
          <div className="text-slate-600 italic">No events tracked...</div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
              <div className="flex justify-between mb-1">
                <span className="text-brand-400 font-bold">{event.name}</span>
                <span className="text-slate-500">{event.timestamp.split("T")[1].split(".")[0]}</span>
              </div>
              {event.params && (
                <pre className="text-slate-400 text-[9px] overflow-x-auto">
                  {JSON.stringify(event.params, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
