import { useState } from "react";
import {
  loginWithPassword,
  requestSignupOtp,
  verifySignupOtp,
  googleLoginUrl,
} from "../services/authApi";

const initialForm = { email: "", username: "", password: "", otp: "" };

export default function Login({ open, onClose }) {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState("form");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setMessage("");
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setStep("form");
    setForm(initialForm);
    setMessage("");
  }

  async function submitLogin(event) {
    event.preventDefault();
    setBusy(true);
    const result = await loginWithPassword({ username: form.username, password: form.password });
    setBusy(false);
    setMessage(result.message);
    if (result.ok) onClose();
  }

  async function sendOtp(event) {
    event.preventDefault();
    setBusy(true);
    const result = await requestSignupOtp({ email: form.email, username: form.username, password: form.password });
    setBusy(false);
    setMessage(result.message);
    if (result.ok) setStep("verify");
  }

  async function verifyOtp(event) {
    event.preventDefault();
    setBusy(true);
    const result = await verifySignupOtp({ email: form.email, otp: form.otp });
    setBusy(false);
    setMessage(result.message);
    if (result.ok) {
      localStorage.setItem("bdplay-account", JSON.stringify({ username: form.username, password: form.password, email: form.email }));
      setMode("login");
      setStep("form");
      setForm({ ...initialForm, username: form.username });
    }
  }

  function continueWithGoogle() {
    const url = googleLoginUrl();
    if (url) window.location.href = url;
    else setMessage("Google sign-in needs the BDplay auth server to be configured.");
  }

  return (
    <div className="auth-overlay" role="presentation" onMouseDown={onClose}>
      <section className="auth-panel" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="auth-close" type="button" onClick={onClose} aria-label="Close sign in">&times;</button>
        <div className="auth-kicker">BDplay account</div>
        <h2 id="auth-title">{mode === "login" ? "Welcome back" : step === "verify" ? "Check your email" : "Create your account"}</h2>
        <p className="auth-intro">{mode === "login" ? "Sign in to keep your music close." : step === "verify" ? `Enter the OTP sent to ${form.email}.` : "Use your email to start listening with BDplay."}</p>

        {mode === "login" ? (
          <form className="auth-form" onSubmit={submitLogin}>
            <label>Username<input name="username" value={form.username} onChange={updateField} autoComplete="username" required /></label>
            <label>Password<input name="password" type="password" value={form.password} onChange={updateField} autoComplete="current-password" required /></label>
            <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Signing in..." : "Log in"}</button>
          </form>
        ) : step === "form" ? (
          <form className="auth-form" onSubmit={sendOtp}>
            <label>Email<input name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" required /></label>
            <label>Username<input name="username" value={form.username} onChange={updateField} autoComplete="username" required /></label>
            <label>Password<input name="password" type="password" value={form.password} onChange={updateField} autoComplete="new-password" minLength="8" required /></label>
            <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Sending code..." : "Send verification code"}</button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={verifyOtp}>
            <label>Verification code<input name="otp" inputMode="numeric" value={form.otp} onChange={updateField} autoComplete="one-time-code" pattern="[0-9]{6}" maxLength="6" required /></label>
            <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Verifying..." : "Verify and create account"}</button>
          </form>
        )}

        {message && <p className="auth-message" role="status">{message}</p>}
        {mode === "login" && <button className="google-login" type="button" onClick={continueWithGoogle}><span aria-hidden="true">G</span> Continue with Google</button>}
        <p className="auth-switch">{mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}<button type="button" onClick={() => switchMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Sign up" : "Log in"}</button></p>
      </section>
    </div>
  );
}