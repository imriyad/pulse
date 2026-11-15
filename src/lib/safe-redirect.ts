/**
 * Only allow same-site relative paths as post-login redirects. Prevents open
 * redirects like /signin?callbackUrl=https://evil.example.
 */
export function safeCallbackUrl(value: string | undefined | null, fallback = "/dashboard"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
