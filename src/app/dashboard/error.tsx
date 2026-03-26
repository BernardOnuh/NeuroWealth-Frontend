"use client";

import { AlertTriangle } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      statusCode={500}
      title="Dashboard error"
      description="Something went wrong loading the dashboard. Your funds are safe. Try refreshing or come back in a moment."
      icon={<AlertTriangle size={32} />}
      primaryAction={{ label: "Try again", href: "#" }}
      secondaryAction={{ label: "Back to home", href: "/", onClick: reset }}
    />
  );
}
