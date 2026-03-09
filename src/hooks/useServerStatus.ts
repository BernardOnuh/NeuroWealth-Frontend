"use client";

import { useState, useEffect, useCallback } from "react";
import { ServerStatus } from "../types";

const WEBHOOK_SERVER =
    process.env.NEXT_PUBLIC_WEBHOOK_URL || "http://localhost:2000";

export function useServerStatus() {
    const [status, setStatus] = useState<ServerStatus>({
        state: "checking",
        url: WEBHOOK_SERVER,
    });

    const check = useCallback(async () => {
        try {
            const res = await fetch(`${WEBHOOK_SERVER}/health`, {
                signal: AbortSignal.timeout(3000),
            });
            setStatus({
                state: res.ok ? "online" : "offline",
                url: WEBHOOK_SERVER,
            });
        } catch {
            setStatus({ state: "offline", url: WEBHOOK_SERVER });
        }
    }, []);

    useEffect(() => {
        // Defer the initial check to avoid synchronous state updates in effect
        setTimeout(() => { void check(); }, 0);
        const interval = setInterval(check, 10_000);
        return () => clearInterval(interval);
    }, [check]);

    return status;
}
