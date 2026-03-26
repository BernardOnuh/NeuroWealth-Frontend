import { useEffect } from "react";
import { logger } from "@/lib/logger";

export function useErrorTracking() {
  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      logger.error(`Unhandled Window Error: ${event.message}`, event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error(`Unhandled Promise Rejection: ${event.reason}`, event.reason);
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);
}
