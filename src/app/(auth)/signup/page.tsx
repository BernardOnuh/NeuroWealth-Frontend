"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { mockAudit } from "@/lib/mock-audit";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Check, X } from "lucide-react";

type SignUpState = "default" | "loading" | "success";

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  terms?: string;
}

function getPasswordStrength(password: string): {
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
} {
  if (!password) return { level: 0, label: "", color: "" };
  if (password.length < 8) return { level: 1, label: "Weak", color: "#ef4444" };
  if (password.length < 12 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { level: 2, label: "Fair", color: "#f59e0b" };
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return { level: 3, label: "Good", color: "#3b82f6" };
  }
  return { level: 4, label: "Strong", color: "#10b981" };
}

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [state, setState] = useState<SignUpState>("default");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showValidation, setShowValidation] = useState(false);
  const { signUp } = useAuth();

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!termsAccepted) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);

    if (!validateForm()) {
      return;
    }

    setState("loading");

    try {
      await signUp(email, name, password);
      setState("success");
      mockAudit.logEvent("signup", { email, name, timestamp: new Date().toISOString() });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create account";
      setErrors({ email: errorMsg });
      setState("default");
      mockAudit.logEvent("signup", { email, status: "failed", reason: errorMsg });
    }
  };

  const isLoading = state === "loading";
  const isSuccess = state === "success";
  const errorCount = Object.keys(errors).length;

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* Header */}
        <div className="signup-header">
          <h1 className="signup-title">Create Account</h1>
          <p className="signup-subtitle">Join NeuroWealth and start earning automatically</p>
        </div>

        {/* Validation Summary */}
        {showValidation && errorCount > 0 && (
          <div className="signup-validation-banner" role="alert">
            <AlertCircle size={16} />
            <div>
              <strong>Please fix {errorCount} error{errorCount > 1 ? "s" : ""}</strong>
              <ul>
                {Object.values(errors).map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="signup-form" noValidate>
          {/* Name Field */}
          <div className="signup-field">
            <label htmlFor="name" className="signup-label">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className={`signup-input ${errors.name ? "signup-input-error" : ""}`}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              disabled={isLoading || isSuccess}
              required
            />
            {errors.name && (
              <p id="name-error" className="signup-error-text">
                <AlertCircle size={14} />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="signup-field">
            <label htmlFor="email" className="signup-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={`signup-input ${errors.email ? "signup-input-error" : ""}`}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              disabled={isLoading || isSuccess}
              required
            />
            {errors.email && (
              <p id="email-error" className="signup-error-text">
                <AlertCircle size={14} />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="signup-field">
            <label htmlFor="password" className="signup-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`signup-input ${errors.password ? "signup-input-error" : ""}`}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : "password-strength"}
              disabled={isLoading || isSuccess}
              required
            />
            {errors.password && (
              <p id="password-error" className="signup-error-text">
                <AlertCircle size={14} />
                {errors.password}
              </p>
            )}

            {/* Password Strength Meter */}
            {password && (
              <div id="password-strength" className="signup-strength-meter">
                <div className="signup-strength-bar">
                  <div
                    className="signup-strength-fill"
                    style={{
                      width: `${(passwordStrength.level / 4) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </div>
                <span className="signup-strength-label" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}

            {/* Password Requirements */}
            <div className="signup-requirements">
              <div className={`signup-requirement ${password.length >= 8 ? "met" : ""}`}>
                {password.length >= 8 ? <Check size={14} /> : <X size={14} />}
                <span>At least 8 characters</span>
              </div>
              <div className={`signup-requirement ${/[A-Z]/.test(password) ? "met" : ""}`}>
                {/[A-Z]/.test(password) ? <Check size={14} /> : <X size={14} />}
                <span>One uppercase letter</span>
              </div>
              <div className={`signup-requirement ${/[0-9]/.test(password) ? "met" : ""}`}>
                {/[0-9]/.test(password) ? <Check size={14} /> : <X size={14} />}
                <span>One number</span>
              </div>
              <div className={`signup-requirement ${/[!@#$%^&*]/.test(password) ? "met" : ""}`}>
                {/[!@#$%^&*]/.test(password) ? <Check size={14} /> : <X size={14} />}
                <span>One special character</span>
              </div>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="signup-checkbox-field">
            <input
              id="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="signup-checkbox"
              aria-invalid={!!errors.terms}
              disabled={isLoading || isSuccess}
            />
            <label htmlFor="terms" className="signup-checkbox-label">
              I agree to the{" "}
              <a href="#" className="signup-link">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="signup-link">
                Privacy Policy
              </a>
            </label>
            {errors.terms && (
              <p className="signup-error-text">
                <AlertCircle size={14} />
                {errors.terms}
              </p>
            )}
          </div>

          {/* Success Banner */}
          {isSuccess && (
            <div className="signup-success-banner" role="status">
              <CheckCircle2 size={16} />
              <span>Account created successfully. Redirecting...</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="signup-submit"
            disabled={isLoading || isSuccess}
            aria-busy={isLoading}
          >
            {isLoading && <span className="signup-spinner" aria-hidden="true" />}
            {isLoading ? "Creating Account..." : isSuccess ? "Redirecting..." : "Sign Up"}
          </Button>
        </form>

        {/* Footer */}
        <div className="signup-footer">
          <p className="signup-footer-text">
            Already have an account?{" "}
            <Link href="/signin" className="signup-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .signup-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
        }

        .signup-container {
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

        .signup-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .signup-title {
          font-size: 28px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 8px;
          letter-spacing: -0.02em;
        }

        .signup-subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }

        .signup-validation-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: #fca5a5;
          font-size: 13px;
          margin-bottom: 16px;
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

        .signup-validation-banner svg {
          color: #ef4444;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .signup-validation-banner strong {
          display: block;
          color: #f87171;
          margin-bottom: 4px;
        }

        .signup-validation-banner ul {
          margin: 0;
          padding-left: 16px;
        }

        .signup-validation-banner li {
          margin: 2px 0;
        }

        .signup-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .signup-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .signup-label {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .signup-input {
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

        .signup-input::placeholder {
          color: #64748b;
        }

        .signup-input:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.12);
        }

        .signup-input-error {
          border-color: rgba(239, 68, 68, 0.6);
        }

        .signup-input-error:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
        }

        .signup-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .signup-error-text {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #f87171;
          margin: 0;
        }

        .signup-strength-meter {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }

        .signup-strength-bar {
          flex: 1;
          height: 4px;
          background: rgba(148, 163, 184, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }

        .signup-strength-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .signup-strength-label {
          font-size: 12px;
          font-weight: 600;
          min-width: 50px;
          text-align: right;
        }

        .signup-requirements {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 8px;
          padding: 8px 12px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 8px;
        }

        .signup-requirement {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #94a3b8;
          transition: color 0.2s;
        }

        .signup-requirement.met {
          color: #10b981;
        }

        .signup-requirement svg {
          flex-shrink: 0;
        }

        .signup-checkbox-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .signup-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #38bdf8;
        }

        .signup-checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #cbd5e1;
          cursor: pointer;
        }

        .signup-link {
          color: #38bdf8;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }

        .signup-link:hover {
          color: #0ea5e9;
        }

        .signup-link:focus {
          outline: 2px solid #38bdf8;
          outline-offset: 2px;
          border-radius: 2px;
        }

        .signup-success-banner {
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

        .signup-success-banner svg {
          color: #10b981;
          flex-shrink: 0;
        }

        .signup-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 44px;
          margin-top: 8px;
        }

        .signup-spinner {
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

        .signup-footer {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          text-align: center;
        }

        .signup-footer-text {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }

        @media (max-width: 520px) {
          .signup-container {
            padding: 24px 16px;
          }

          .signup-title {
            font-size: 24px;
          }

          .signup-form {
            gap: 14px;
          }

          .signup-requirements {
            gap: 4px;
            padding: 6px 10px;
          }

          .signup-requirement {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}
