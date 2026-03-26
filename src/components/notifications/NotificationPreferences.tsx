import React from "react";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { Switch } from "@/components/ui/Switch";
import { analytics } from "@/lib/analytics";

export function NotificationPreferencesUI() {
  const { preferences, updatePreference } = useNotificationPreferences();

  const handleUpdate = (section: "categories" | "channels", key: string, value: boolean) => {
    updatePreference(section, key, value);
    analytics.track("preference_update", { section, key, value });
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      <section>
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
          Categories
        </h4>
        <div className="flex flex-col gap-1">
          <Switch
            label="Transactions"
            checked={preferences.categories.transactions}
            onChange={(val) => handleUpdate("categories", "transactions", val)}
          />
          <Switch
            label="System Events"
            checked={preferences.categories.system}
            onChange={(val) => handleUpdate("categories", "system", val)}
          />
          <Switch
            label="Promotions"
            checked={preferences.categories.promotions}
            onChange={(val) => handleUpdate("categories", "promotions", val)}
          />
        </div>
      </section>

      <section className="border-t border-white/5 pt-4">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
          Channels
        </h4>
        <div className="flex flex-col gap-1">
          <Switch
            label="In-App Notifications"
            checked={preferences.channels.inApp}
            onChange={(val) => handleUpdate("channels", "inApp", val)}
          />
          <Switch
            label="Email Digest"
            checked={preferences.channels.email}
            onChange={(val) => handleUpdate("channels", "email", val)}
          />
          <Switch
            label="Push Notifications"
            checked={preferences.channels.push}
            onChange={(val) => handleUpdate("channels", "push", val)}
          />
        </div>
      </section>
    </div>
  );
}
