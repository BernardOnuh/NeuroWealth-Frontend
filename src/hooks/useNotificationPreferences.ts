import { useState, useEffect } from "react";
import { NotificationPreferences, DEFAULT_PREFERENCES } from "@/lib/mock-preferences";

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("nw-notification-preferences");
    if (stored) {
      setPreferences(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const updatePreference = (
    section: "categories" | "channels",
    key: string,
    value: boolean
  ) => {
    const updated = {
      ...preferences,
      [section]: {
        ...preferences[section],
        [key]: value,
      },
    };
    setPreferences(updated);
    localStorage.setItem("nw-notification-preferences", JSON.stringify(updated));
  };

  return {
    preferences,
    loading,
    updatePreference,
  };
}
