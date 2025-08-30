export function buildPublicUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const endpointRaw = (process.env.NEXT_PUBLIC_S3_ENDPOINT || process.env.SOCIAL_S3_ENDPOINT || "").replace(/\/$/, "");
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET || process.env.SOCIAL_S3_BUCKET || "";
  if (endpointRaw && bucket) {
    const base = /^https?:\/\//.test(endpointRaw) ? endpointRaw : `https://${endpointRaw}`;
    return `${base}/${bucket}/${path}`;
  }
  return path;
}
