const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || "";

async function post(path, body) {
  if (!AUTH_API_URL) return null;
  try {
    const response = await fetch(`${AUTH_API_URL}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, message: data.message || "Request failed." };
  } catch {
    return { ok: false, message: "BDplay authentication is temporarily unavailable." };
  }
}

export async function loginWithPassword(credentials) {
  const result = await post("/auth/login", credentials);
  if (result) return result;
  const saved = JSON.parse(localStorage.getItem("bdplay-account") || "null");
  return saved?.username === credentials.username && saved?.password === credentials.password
    ? { ok: true, message: "Signed in to BDplay." }
    : { ok: false, message: "Account not found. Create one first." };
}

export async function requestSignupOtp(account) {
  const result = await post("/auth/signup/request-otp", account);
  if (result) return result;
  return { ok: true, message: "Demo mode: enter 123456 to verify this account." };
}

export async function verifySignupOtp(account) {
  const result = await post("/auth/signup/verify-otp", account);
  if (result) return result;
  return account.otp === "123456"
    ? { ok: true, message: "Account created. You can now log in to BDplay." }
    : { ok: false, message: "That verification code is not valid." };
}

export function googleLoginUrl() {
  return AUTH_API_URL ? `${AUTH_API_URL}/auth/google` : "";
}