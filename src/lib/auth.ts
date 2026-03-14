import { createHmac } from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "veomaking_session";

function getSecret(): string {
  return process.env.ACCESS_PASSWORD || "veomaking_fallback_secret";
}

export function createSessionToken(): string {
  return createHmac("sha256", getSecret())
    .update("veomaking_session_v1")
    .digest("hex");
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return token === createSessionToken();
}

export function getSessionCookieConfig() {
  return {
    name: SESSION_COOKIE,
    value: createSessionToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24, // 24시간
  };
}
