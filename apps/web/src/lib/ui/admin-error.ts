export function handleAdminClientError(e: any) {
  const msg = String(e?.message || e || "").trim();

  if (msg.includes("ADMIN_PERMISSION_DENIED")) {
    window.location.href = "/admin/access-denied";
    return true;
  }

  if (msg.includes("ADMIN_AUTH_REQUIRED")) {
    window.location.href = "/admin/login";
    return true;
  }

  return false;
}
