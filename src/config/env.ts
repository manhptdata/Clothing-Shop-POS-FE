// ─── Typed Environment Variables ──────────────────────────────────────────────
// Tập trung toàn bộ env vars vào 1 chỗ, có type-safe

export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string || 'http://localhost:8080',
} as const;
