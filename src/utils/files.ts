export function getFileUrl(r2Key: string): string {
  return `/api/files/${encodeURIComponent(r2Key)}`
}
