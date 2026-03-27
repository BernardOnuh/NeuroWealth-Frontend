import { AuditTrail } from "@/components/audit/AuditTrail";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navbar } from "@/components/Navbar";

export default function AuditPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <AuditTrail />
    </ProtectedRoute>
  );
}
