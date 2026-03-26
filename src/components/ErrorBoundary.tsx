"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("React Component Error", { error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-dark-900 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Something went wrong.</h2>
          <p className="text-slate-400 mb-6">We&apos;ve logged the error and our team is looking into it.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-6 py-2 bg-brand-400 text-dark-900 font-bold rounded-lg hover:bg-brand-300 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
