import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

import { useWorkspaceStore } from "@/lib/workspace-store";
import { WorkrailMark } from "@/components/workspace/WorkrailTopbar";

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  const { darkMode } = useWorkspaceStore();

  return (
    <div className={`workspace-shell auth-v2-shell ${darkMode ? "dark" : "light-mode"}`}>
      <main className="auth-v2-main">
        <section className="auth-v2-card">{children}</section>
      </main>
    </div>
  );
}

export function AuthHeader({
  heading,
  description,
  headingId,
}: {
  heading: string;
  description: string;
  headingId: string;
}) {
  return (
    <>
      <Link to="/" className="auth-v2-brand" aria-label="workrail home">
        <span className="auth-v2-logo" aria-hidden="true">
          <WorkrailMark size={15} />
        </span>
        <span>workrail</span>
      </Link>
      <div className="auth-v2-heading-group">
        <h1 id={headingId}>{heading}</h1>
        <p>{description}</p>
      </div>
    </>
  );
}

export function SegmentedAuthNav({ active }: { active: "login" | "register" }) {
  return (
    <nav className="auth-v2-segmented" aria-label="Authentication pages">
      <Link to="/login" className={active === "login" ? "is-active" : ""} aria-current={active === "login" ? "page" : undefined}>
        Sign in
      </Link>
      <Link to="/register" className={active === "register" ? "is-active" : ""} aria-current={active === "register" ? "page" : undefined}>
        Register
      </Link>
    </nav>
  );
}

export function PasswordInput({
  id,
  label,
  value,
  placeholder,
  autoComplete,
  error,
  rightAction,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  autoComplete: string;
  error?: string;
  rightAction?: ReactNode;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const errorId = `${id}-error`;

  return (
    <div className="auth-v2-field">
      <div className="auth-v2-label-row">
        <label htmlFor={id}>{label}</label>
        {rightAction}
      </div>
      <div className="auth-v2-password-wrap">
        <input
          id={id}
          className={`auth-v2-input ${error ? "has-error" : ""}`}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="auth-v2-eye"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && (
        <p id={errorId} className="auth-v2-error" role="alert">
          <AlertCircle size={13} /> {error}
        </p>
      )}
    </div>
  );
}

export function GoogleAuthButton({
  label,
  loading,
  disabled,
  onClick,
}: {
  label: string;
  loading: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <>
      <div className="auth-v2-divider" role="separator">
        <span>OR CONTINUE WITH</span>
      </div>
      <button type="button" className="auth-v2-google-btn" disabled={disabled || loading} onClick={onClick}>
        {loading ? <Loader2 size={16} className="auth-v2-spin" /> : <GoogleIcon />}
        <span>{loading ? "Connecting to Google..." : label}</span>
      </button>
    </>
  );
}
