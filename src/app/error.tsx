"use client";

import { AlertTriangle } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      statusCode={500}
      title="Something went wrong"
      description="An unexpected error occurred. Our team has been notified. You can try again or head back to the dashboard."
      icon={<AlertTriangle size={32} />}
      primaryAction={{ label: "Try again", href: "#" }}
      secondaryAction={{ label: "Back to home", href: "/", onClick: reset }}
    />
  );
}
