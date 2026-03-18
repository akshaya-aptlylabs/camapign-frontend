import { useState, useCallback } from "react";
import { SnackbarState } from "../types";

export function useSnackbar() {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState["severity"] = "success") => {
      setSnackbar({ open: true, message, severity });
    },
    [],
  );

  const hideSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return { snackbar, showSnackbar, hideSnackbar };
}

export function useAsync<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
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
