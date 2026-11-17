import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Check, Loader2 } from "lucide-react";

import { AuthHeader, AuthShell } from "@/components/auth/AuthShared";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "workrail — Forgot password" },
      { name: "description", content: "Reset your workrail account password." },
    ],
  }),
  component: ForgotPasswordPage,
});

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (submitting || sent) return;

    if (!email.trim()) {
      setEmailError("Email address is required.");
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setEmailError("");
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setSent(true);
    }, 550);
  };

  return (
    <AuthShell>
      <AuthHeader
        heading="Forgot your password?"
        description="Enter your email address and we'll send you a password reset link."
        headingId="forgot-heading"
      />

      <form className="auth-v2-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-v2-field">
          <label htmlFor="forgot-email">Email address</label>
          <input
            id="forgot-email"
            className={`auth-v2-input ${emailError ? "has-error" : ""}`}
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            disabled={submitting}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "forgot-email-error" : undefined}
            onChange={(event) => {
              setEmail(event.target.value);
              if (emailError) setEmailError("");
              if (sent) setSent(false);
            }}
          />
          {emailError && (
            <p id="forgot-email-error" className="auth-v2-error" role="alert">
              <AlertCircle size={13} /> {emailError}
            </p>
          )}
        </div>

        {sent && (
          <div className="auth-v2-banner-success" role="status">
            <Check size={15} />
            <span>If an account exists with this email, you'll receive instructions to reset your password.</span>
          </div>
        )}

        <button type="submit" className="auth-v2-primary-btn" disabled={submitting || sent}>
          {submitting && <Loader2 size={16} className="auth-v2-spin" />}
          <span>{submitting ? "Sending reset link..." : sent ? "Reset link sent" : "Send reset link"}</span>
        </button>
      </form>

      <p className="auth-v2-footer-link">
        <Link to="/login" className="auth-v2-back-signin">
          <ArrowLeft size={14} /> Back to Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
