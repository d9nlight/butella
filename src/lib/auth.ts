import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "butella_admin_session";

/**
 * Returns whether the current request comes from an authenticated store owner.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) return false;

  const expectedToken = getExpectedSessionToken();
  return sessionCookie.value === expectedToken;
}

/**
 * Verifies the password submitted by the store owner.
 */
export function verifyAdminPassword(password: string): boolean {
  const configuredPassword = process.env.ADMIN_PASSWORD || "admin_ddd999";
  return password === configuredPassword;
}

/**
 * Generates the expected session token based on the admin password.
 */
export function getExpectedSessionToken(): string {
  const secret = process.env.ADMIN_PASSWORD || "admin_ddd999";
  // Simple deterministic token representation
  return Buffer.from(`butella_authenticated_owner:${secret}`).toString("base64");
}

export { ADMIN_COOKIE_NAME };
