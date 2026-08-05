const ANALYTICS_SCRIPT_ID = "promptpro-analytics-script";

export function initAnalytics() {
  if (typeof window === "undefined") {
    return;
  }

  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT?.trim();
  const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID?.trim();

  if (!endpoint || !websiteId) {
    return;
  }

  if (document.getElementById(ANALYTICS_SCRIPT_ID)) {
    return;
  }

  const script = document.createElement("script");
  script.id = ANALYTICS_SCRIPT_ID;
  script.defer = true;
  script.src = `${endpoint.replace(/\/$/, "")}/umami`;
  script.dataset.websiteId = websiteId;

  document.head.appendChild(script);
}
