export function buildPublicUrl(path: string): string {
  let key = path;
  try {
    if (/^https?:\/\//.test(path)) {
      const u = new URL(path);
      const socialHost = (process.env.NEXT_PUBLIC_SOCIAL_HOST || "social.rabbittale.co").toLowerCase();
      if (u.hostname.toLowerCase() === socialHost) {
        // rebase to S3 if configured
        key = u.pathname.replace(/^\/+/, "");
      } else {
        return path; // foreign absolute URL – use as-is
      }
    }
  } catch {
    // fall through and treat as key
  }

  key = String(key || "").replace(/^\/+/, "");

  const endpointRaw = (process.env.NEXT_PUBLIC_S3_ENDPOINT || process.env.SOCIAL_S3_ENDPOINT || "").replace(/\/$/, "");
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET || process.env.SOCIAL_S3_BUCKET || "";
  if (endpointRaw && bucket && key) {
    const base = /^https?:\/\//.test(endpointRaw) ? endpointRaw : `https://${endpointRaw}`;
    return `${base}/${bucket}/${key}`;
  }
  return key || path;
}
