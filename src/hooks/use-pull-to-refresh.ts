import { useEffect, useState } from "react";

export function usePullToRefresh(onRefresh: () => Promise<unknown>) {
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    function handleTouchStart(event: TouchEvent) {
      if (window.scrollY === 0) {
        setStartY(event.touches[0].clientY);
      }
    }

    function handleTouchMove(event: TouchEvent) {
      if (startY === 0 || window.scrollY > 0) return;

      const distance = event.touches[0].clientY - startY;
      if (distance > 0) {
        setPullDistance(Math.min(distance, 100));
      }
    }

    async function handleTouchEnd() {
      if (pullDistance > 80 && !isRefreshing) {
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
      }

      setStartY(0);
      setPullDistance(0);
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isRefreshing, onRefresh, pullDistance, startY]);

  return { isRefreshing, pullDistance };
}
