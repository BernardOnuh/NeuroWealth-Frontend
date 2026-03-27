"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { mockAudit } from "@/lib/mock-audit";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type SignInState = "default" | "invalid" | "loading" | "success";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<SignInState>("default");
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setState("loading");

    try {
      await signIn(email, password);
      setState("success");
      mockAudit.logEvent("login", { email, timestamp: new Date().toISOString() });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Invalid email or password";
      setError(errorMsg);
      setState("invalid");
      mockAudit.logEvent("login", { email, status: "failed", reason: errorMsg });
    }
  };

  const isInvalid = state === "invalid";
  const isLoading = state === "loading";
  const isSuccess = state === "success";

  return (
    <div className="signin-page">
      <div className="signin-container">
        {/* Header */}
        <div className="signin-header">
          <h1 className="signin-title">Welcome Back</h1>
          <p className="signin-subtitle">Sign in to manage your AI-powered yield</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="signin-form" noValidate>
          {/* Email Field */}
          <div className="signin-field">
            <label htmlFor="email" className="signin-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={`signin-input ${isInvalid ? "signin-input-error" : ""}`}
              aria-invalid={isInvalid}
              aria-describedby={isInvalid ? "email-error" : undefined}
              disabled={isLoading || isSuccess}
              required
            />
            {isInvalid && (
              <p id="email-error" className="signin-error-text" role="alert">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="signin-field">
            <label htmlFor="password" className="signin-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`signin-input ${isInvalid ? "signin-input-error" : ""}`}
              aria-invalid={isInvalid}
              disabled={isLoading || isSuccess}
              required
            />
            <p className="signin-hint">Hint: Use &quot;password123&quot; for mock login</p>
          </div>

          {/* Error Banner */}
          {isInvalid && (
            <div className="signin-error-banner" role="alert">
              <AlertCircle size={16} />
              <div>
                <strong>Invalid Credentials</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {isSuccess && (
            <div className="signin-success-banner" role="status">
              <CheckCircle2 size={16} />
              <span>Sign in successful. Redirecting...</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="signin-submit"
            disabled={isLoading || isSuccess}
            aria-busy={isLoading}
          >
            {isLoading && <span className="signin-spinner" aria-hidden="true" />}
            {isLoading ? "Signing in..." : isSuccess ? "Redirecting..." : "Sign In"}
          </Button>
        </form>

        {/* Footer */}
        <div className="signin-footer">
          <p className="signin-footer-text">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="signin-link">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .signin-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
        }

        .signin-container {
          width: 100%;
          max-width: 420px;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 16px;
          padding: 32px 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(16px);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .signin-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .signin-title {
          font-size: 28px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 8px;
          letter-spacing: -0.02em;
        }

        .signin-subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }

        .signin-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .signin-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .signin-label {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .signin-input {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 10px;
          padding: 11px 14px;
          min-height: 44px;
          color: #e2e8f0;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }

        .signin-input::placeholder {
          color: #64748b;
        }

        .signin-input:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.12);
        }

        .signin-input-error {
          border-color: rgba(239, 68, 68, 0.6);
        }

        .signin-input-error:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
        }

        .signin-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .signin-hint {
          font-size: 12px;
          color: #64748b;
          margin: 0;
          font-style: italic;
        }

        .signin-error-text {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #f87171;
          margin: 0;
        }

        .signin-error-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: #fca5a5;
          font-size: 13px;
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

        .signin-error-banner svg {
          color: #ef4444;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .signin-error-banner strong {
          display: block;
          color: #f87171;
          margin-bottom: 2px;
        }

        .signin-error-banner p {
          margin: 0;
        }

        .signin-success-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 10px;
          color: #6ee7b7;
          font-size: 13px;
          animation: slideDown 0.2s ease-out;
        }

        .signin-success-banner svg {
          color: #10b981;
          flex-shrink: 0;
        }

        .signin-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 44px;
          margin-top: 8px;
        }

        .signin-spinner {
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

        .signin-footer {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          text-align: center;
        }

        .signin-footer-text {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }

        .signin-link {
          color: #38bdf8;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }

        .signin-link:hover {
          color: #0ea5e9;
        }

        .signin-link:focus {
          outline: 2px solid #38bdf8;
          outline-offset: 2px;
          border-radius: 2px;
        }

        @media (max-width: 520px) {
          .signin-container {
            padding: 24px 16px;
          }

          .signin-title {
            font-size: 24px;
          }

          .signin-form {
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}
