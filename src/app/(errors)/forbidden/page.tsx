import { ShieldOff } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";

export default function ForbiddenPage() {
  return (
    <ErrorPage
      statusCode={403}
      title="Access denied"
      description="You don't have permission to view this page. If you think this is a mistake, please contact support."
      icon={<ShieldOff size={32} />}
      primaryAction={{ label: "Back to dashboard", href: "/dashboard" }}
      secondaryAction={{ label: "Contact support", href: "mailto:support@neurowealth.app" }}
    />
  );
}
