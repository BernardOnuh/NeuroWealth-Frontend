"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
    const getInitial = () =>
        typeof window !== "undefined" ? window.matchMedia(query).matches : false;
    const [matches, setMatches] = useState(getInitial);

    useEffect(() => {
        const mq = window.matchMedia(query);
        const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [query]);

    return matches;
}
