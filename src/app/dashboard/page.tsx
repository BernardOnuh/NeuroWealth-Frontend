import { PortfolioDashboard } from "@/components/dashboard/PortfolioDashboard";
import { Suspense } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={null}>
        <PortfolioDashboard />
      </Suspense>
    </ProtectedRoute>
  );
}
