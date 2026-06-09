import posthog from "posthog-js";

let isAnalyticsReady = false;

export function initAnalytics() {
  if (!import.meta.env.VITE_POSTHOG_KEY) return;

  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: "https://app.posthog.com",
    loaded: (client) => {
      isAnalyticsReady = true;
      if (import.meta.env.DEV) client.debug();
    },
  });
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (isAnalyticsReady) {
    posthog.capture(event, properties);
  }
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (isAnalyticsReady) {
    posthog.identify(userId, traits);
  }
}
