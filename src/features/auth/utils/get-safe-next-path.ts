const APP_ORIGIN = "https://cashbook.local";

export function getSafeNextPath(value: string) {
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(value)
  ) {
    return "/dashboard";
  }

  try {
    const url = new URL(value, APP_ORIGIN);

    if (url.origin !== APP_ORIGIN) {
      return "/dashboard";
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/dashboard";
  }
}
