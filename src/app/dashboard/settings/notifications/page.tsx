"use client";

import { useState, useEffect } from "react";
import { Bell, Mail, AlertCircle, CheckCircle2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { mockAudit } from "@/lib/mock-audit";
import { SettingsSectionSkeleton } from "@/components/ui/Skeleton";

interface NotificationPreferences {
  emailNotifications: boolean;
  transactionAlerts: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

const STORAGE_KEY = "nw_notifications";
const DEFAULT: NotificationPreferences = {
  emailNotifications: true,
  transactionAlerts: true,
  weeklyDigest: true,
  marketingEmails: false,
  securityAlerts: true,
};

export default function NotificationsPage() {
  const [saved, setSaved] = useState<NotificationPreferences>(DEFAULT);
  const [draft, setDraft] = useState<NotificationPreferences>(DEFAULT);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setSaved(data);
          setDraft(data);
        }
      } catch {}
      setPageLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (pageLoading) {
    return <SettingsSectionSkeleton rows={5} />;
  }

  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const handleSave = async () => {
    setSaving(true);
    setStatus("idle");
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setSaved(draft);
      setStatus("success");
      setEditing(false);
      mockAudit.logEvent("settings_change", { section: "notifications", changes: draft });
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(saved);
    setEditing(false);
    setStatus("idle");
  };

  const toggleNotification = (key: keyof NotificationPreferences) => {
    setDraft({ ...draft, [key]: !draft[key] });
  };

  return (
    <div className="notifications-page">
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Notifications</h1>
          <p className="settings-subtitle">Manage how and when you receive notifications</p>
        </div>
      </div>

      {status === "success" && (
        <div className="settings-banner settings-banner-success" role="status">
          <CheckCircle2 size={16} />
          <span>Notification preferences saved successfully</span>
        </div>
      )}

      {status === "error" && (
        <div className="settings-banner settings-banner-error" role="alert">
          <AlertCircle size={16} />
          <span>Failed to save preferences. Please try again.</span>
        </div>
      )}

      {/* Email Notifications */}
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon">
            <Mail size={18} />
          </div>
          <div>
            <h2 className="settings-card-title">Email Notifications</h2>
            <p className="settings-card-desc">Control email notification settings</p>
          </div>
        </div>

        <div className="settings-card-body">
          <div className="settings-field">
            <label htmlFor="email-notif" className="settings-toggle-label">
              <input
                id="email-notif"
                type="checkbox"
                checked={draft.emailNotifications}
                onChange={() => toggleNotification("emailNotifications")}
                className="settings-toggle"
                disabled={!editing}
              />
              <span>Enable email notifications</span>
            </label>
            <p className="settings-hint">
              {draft.emailNotifications
                ? "You'll receive email notifications for important account events."
                : "Email notifications are disabled."}
            </p>
          </div>

          {draft.emailNotifications && (
            <>
              <div className="settings-field">
                <label htmlFor="transaction-alerts" className="settings-toggle-label">
                  <input
                    id="transaction-alerts"
                    type="checkbox"
                    checked={draft.transactionAlerts}
                    onChange={() => toggleNotification("transactionAlerts")}
                    className="settings-toggle"
                    disabled={!editing}
                  />
                  <span>Transaction alerts</span>
                </label>
                <p className="settings-hint">Get notified when transactions are completed</p>
              </div>

              <div className="settings-field">
                <label htmlFor="weekly-digest" className="settings-toggle-label">
                  <input
                    id="weekly-digest"
                    type="checkbox"
                    checked={draft.weeklyDigest}
                    onChange={() => toggleNotification("weeklyDigest")}
                    className="settings-toggle"
                    disabled={!editing}
                  />
                  <span>Weekly digest</span>
                </label>
                <p className="settings-hint">Receive a weekly summary of your account activity</p>
              </div>

              <div className="settings-field">
                <label htmlFor="marketing" className="settings-toggle-label">
                  <input
                    id="marketing"
                    type="checkbox"
                    checked={draft.marketingEmails}
                    onChange={() => toggleNotification("marketingEmails")}
                    className="settings-toggle"
                    disabled={!editing}
                  />
                  <span>Marketing emails</span>
                </label>
                <p className="settings-hint">
                  Receive updates about new features and special offers
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Security Alerts */}
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon">
            <AlertCircle size={18} />
          </div>
          <div>
            <h2 className="settings-card-title">Security Alerts</h2>
            <p className="settings-card-desc">Critical security notifications</p>
          </div>
        </div>

        <div className="settings-card-body">
          <div className="settings-field">
            <label htmlFor="security-alerts" className="settings-toggle-label">
              <input
                id="security-alerts"
                type="checkbox"
                checked={draft.securityAlerts}
                onChange={() => toggleNotification("securityAlerts")}
                className="settings-toggle"
                disabled={!editing}
              />
              <span>Security alerts</span>
            </label>
            <p className="settings-hint">
              {draft.securityAlerts
                ? "You'll be notified of suspicious activity and security events."
                : "Security alerts are disabled. We recommend enabling them."}
            </p>
          </div>
        </div>
      </div>

      {/* Notification Summary */}
      <div className="settings-card settings-card-info">
        <div className="settings-card-header">
          <div className="settings-card-icon">
            <Bell size={18} />
          </div>
          <div>
            <h2 className="settings-card-title">Notification Summary</h2>
            <p className="settings-card-desc">Your current notification settings</p>
          </div>
        </div>

        <div className="settings-card-body">
          <div className="notification-summary">
            <div className="summary-item">
              <span className="summary-label">Email Notifications</span>
              <span className={`summary-status ${draft.emailNotifications ? "enabled" : "disabled"}`}>
                {draft.emailNotifications ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Security Alerts</span>
              <span className={`summary-status ${draft.securityAlerts ? "enabled" : "disabled"}`}>
                {draft.securityAlerts ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Active Preferences</span>
              <span className="summary-count">
                {Object.values(draft).filter(Boolean).length} of {Object.keys(draft).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {!editing && (
        <Button onClick={() => setEditing(true)} variant="secondary" size="md">
          Edit Preferences
        </Button>
      )}

      {editing && (
        <div className="settings-action-bar" role="group" aria-label="Save or cancel changes">
          {isDirty && <span className="settings-dirty-indicator">Unsaved changes</span>}
          <div className="settings-actions">
            <Button onClick={handleCancel} variant="ghost" size="md" disabled={saving}>
              <X size={16} />
              Cancel
            </Button>
            <Button onClick={handleSave} size="md" disabled={saving} aria-busy={saving}>
              {saving ? (
                <>
                  <span className="settings-spinner" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <style>{`
        .notifications-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .settings-title {
          font-size: 24px;
          font-weight: 700;
          color: #e2e8f0;
          margin: 0 0 4px;
        }

        .settings-subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }

        .settings-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          border: 1px solid;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .settings-banner-success {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.3);
          color: #6ee7b7;
        }

        .settings-banner-success svg {
          color: #10b981;
          flex-shrink: 0;
        }

        .settings-banner-error {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        .settings-banner-error svg {
          color: #ef4444;
          flex-shrink: 0;
        }

        .settings-card {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 14px;
          overflow: hidden;
        }

        .settings-card-info {
          border-color: rgba(56, 189, 248, 0.2);
          background: rgba(56, 189, 248, 0.05);
        }

        .settings-card-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 20px 24px 16px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .settings-card-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #38bdf8;
          flex-shrink: 0;
        }

        .settings-card-title {
          font-size: 14px;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0 0 2px;
        }

        .settings-card-desc {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }

        .settings-card-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .settings-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .settings-toggle-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #e2e8f0;
          cursor: pointer;
        }

        .settings-toggle {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #38bdf8;
        }

        .settings-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .settings-hint {
          font-size: 12px;
          color: #94a3b8;
          margin: 4px 0 0;
        }

        .notification-summary {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .summary-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 8px;
          font-size: 13px;
        }

        .summary-label {
          color: #cbd5e1;
          font-weight: 500;
        }

        .summary-status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .summary-status.enabled {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .summary-status.disabled {
          background: rgba(148, 163, 184, 0.15);
          color: #94a3b8;
        }

        .summary-count {
          color: #38bdf8;
          font-weight: 600;
        }

        .settings-action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 20px;
          background: rgba(2, 6, 23, 0.88);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 12px;
          position: sticky;
          bottom: 24px;
          z-index: 40;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }

        .settings-dirty-indicator {
          font-size: 12px;
          color: #f59e0b;
        }

        .settings-actions {
          display: flex;
          gap: 10px;
          margin-left: auto;
        }

        .settings-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 520px) {
          .settings-card-header {
            padding: 16px;
          }

          .settings-card-body {
            padding: 16px;
          }

          .settings-action-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .settings-actions {
            flex-direction: column;
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}
