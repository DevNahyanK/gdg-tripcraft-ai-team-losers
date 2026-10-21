"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onReset?: () => void;
  title?: string;
  description?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[TripCraft Error Boundary caught error]:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return (
        <div className="w-full max-w-2xl mx-auto my-12 p-6 sm:p-8 rounded-3xl glass border border-rose-500/20 bg-rose-500/5 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle size={28} />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
            {this.props.title || "Something went wrong displaying this view"}
          </h2>

          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            {this.props.description ||
              "An unexpected error occurred while rendering the itinerary details. You can reset or try generating a fresh itinerary."}
          </p>

          {process.env.NODE_ENV === "development" && this.state.error?.message && (
            <div className="mb-6 p-3 rounded-xl bg-black/40 border border-white/5 text-left text-xs font-mono text-rose-300 overflow-x-auto max-h-32">
              {this.state.error.message}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
            >
              <RefreshCw size={14} />
              <span>Try Again</span>
            </button>

            {this.props.onReset && (
              <button
                onClick={this.props.onReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all"
              >
                <ArrowLeft size={14} />
                <span>Craft New Itinerary</span>
              </button>
            )}

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs sm:text-sm font-medium transition-colors"
            >
              <Home size={14} />
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
