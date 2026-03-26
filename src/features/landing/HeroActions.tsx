"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function HeroActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  async function connectWallet() {
    setLoading(true);
    setError(null);
    try {
      const freighter = await import("@stellar/freighter-api");
      const isConnected = await freighter.isConnected();
      if (!isConnected) {
        setError("Freighter wallet not found. Please install it.");
        return;
      }
      await freighter.getAddress();
      setConnected(true);
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-3">
        {connected ? (
          <Link href="/dashboard">
            <Button size="lg">Open Dashboard &rarr;</Button>
          </Link>
        ) : (
          <Button size="lg" onClick={connectWallet} disabled={loading}>
            {loading ? "Connecting..." : "Connect Wallet"}
          </Button>
        )}

        {!connected && (
          <Link href="/dashboard">
            <Button variant="secondary" size="lg">
              Open Dashboard
            </Button>
          </Link>
        )}

        <Link href="#features">
          <Button variant="ghost" size="lg">
            Learn More ↓
          </Button>
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
