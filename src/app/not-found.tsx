import { FileQuestion } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";

export default function NotFound() {
  return (
    <ErrorPage
      statusCode={404}
      title="Page not found"
      description="The page you're looking for doesn't exist or may have been moved. Check the URL or head back to the dashboard."
      icon={<FileQuestion size={32} />}
      primaryAction={{ label: "Back to home", href: "/" }}
      secondaryAction={{ label: "Go to dashboard", href: "/dashboard" }}
    />
  );
}
