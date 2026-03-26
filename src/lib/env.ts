/**
 * Typed environment variable access.
 * Add all NEXT_PUBLIC_ vars here so they're validated at startup.
 */
export const env = {
  webhookUrl: process.env.NEXT_PUBLIC_WEBHOOK_URL ?? "",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
} as const;
