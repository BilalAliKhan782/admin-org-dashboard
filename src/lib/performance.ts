import { trackEvent } from "@/lib/analytics";

export function measurePageLoad() {
  if (typeof window === "undefined") return;

  window.addEventListener("load", () => {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (!navigation) return;

    const pageLoadTime = Math.round(navigation.loadEventEnd - navigation.startTime);
    const connectTime = Math.round(navigation.responseEnd - navigation.requestStart);
    const renderTime = Math.round(navigation.domComplete - navigation.domInteractive);

    trackEvent("page_load", {
      pageLoadTime,
      connectTime,
      renderTime,
    });
  });
}

export function measureComponentRender(componentName: string, renderTime: number) {
  trackEvent("component_render", {
    component: componentName,
    renderTime,
  });
}
