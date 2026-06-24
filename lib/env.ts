import { z } from "zod";

/**
 * Public (browser-exposed) environment variables.
 * Only NEXT_PUBLIC_* vars are referenced statically so Next.js can inline them.
 *
 * `NEXT_PUBLIC_API_URL` is the axios baseURL. By default it points at the
 * same-origin proxy (`/api/cargoland`, rewritten to the backend in
 * `next.config.ts`) so browser requests avoid CORS. It may also be an absolute
 * URL if you want to hit the backend directly.
 */
const publicEnvSchema = z.object({
  // Accept either a relative path (starts with "/") or an absolute URL.
  NEXT_PUBLIC_API_URL: z
    .string()
    .refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), {
      message: "Must be a path starting with '/' or an absolute http(s) URL",
    })
    .default("/api/cargoland"),
});

const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
export type PublicEnv = typeof env;
