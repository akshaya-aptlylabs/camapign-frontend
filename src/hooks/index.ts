// src/hooks/index.ts
// ─────────────────────────────────────────────────────────────
// TYPESCRIPT LESSON: Custom hooks with generics
//
// Custom hooks extract reusable stateful logic from components.
// With TypeScript, we can make them generic so they work with
// any data type while staying fully type-safe.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { SnackbarState } from "../types";

// ── useSnackbar ───────────────────────────────────────────────────────────────
// Typed hook that manages snackbar (toast notification) state.
// Return type is inferred, but we could write it explicitly:
//   : { snackbar: SnackbarState; showSnackbar: (...) => void; hideSnackbar: () => void }

export function useSnackbar() {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    // useState<SnackbarState> — tells TS the state will always match SnackbarState
    open: false,
    message: "",
    severity: "success",
  });

  // showSnackbar accepts a message and optional severity
  // severity has a default value — 'success' if not provided
  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState["severity"] = "success") => {
      // SnackbarState['severity'] — index type: "the type of the 'severity' field"
      // This is equivalent to: 'success' | 'error' | 'warning' | 'info'
      // But it stays in sync if we change SnackbarState — DRY principle
      setSnackbar({ open: true, message, severity });
    },
    [],
  );

  const hideSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
    // prev is inferred as SnackbarState — TS knows the state type
  }, []);

  return { snackbar, showSnackbar, hideSnackbar };
}

// ── useAsync ──────────────────────────────────────────────────────────────────
// Generic hook for any async operation — tracks loading/error state.
// T is a type parameter — caller decides what type the data will be.
//
// Usage:  const { data, loading, error, execute } = useAsync<Campaign[]>();

export function useAsync<T>() {
  const [data, setData] = useState<T | null>(null);
  // T | null — state is either the data OR null (before fetch / on error)
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    // asyncFn: () => Promise<T>  — a function that returns a Promise of type T
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, execute, setData };
}
