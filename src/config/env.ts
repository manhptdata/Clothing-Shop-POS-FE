// ─── Typed Environment Variables ──────────────────────────────────────────────
// Tập trung toàn bộ env vars vào 1 chỗ, có type-safe

export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string || 'http://localhost:8080',
  CLOUDINARY_CLOUD_NAME: (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string || '').trim(),
  CLOUDINARY_UPLOAD_PRESET: (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string || '').trim(),
} as const;
