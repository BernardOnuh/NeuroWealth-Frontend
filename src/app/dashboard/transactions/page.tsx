import { Suspense } from "react";
import { TransactionFlow } from "@/components/transactions/TransactionFlow";

export default function TransactionsPage() {
  return (
    <Suspense fallback={null}>
      <TransactionFlow />
    </Suspense>
  );
}
