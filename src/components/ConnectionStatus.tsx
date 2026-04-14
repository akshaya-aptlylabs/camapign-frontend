import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Tooltip, CircularProgress } from "@mui/material";
import { CheckCircle, ErrorOutline } from "@mui/icons-material";
import { healthApi } from "../services/api";

type ConnectionState = "checking" | "connected" | "disconnected";

export default function ConnectionStatus() {
  const [status, setStatus] = useState<ConnectionState>("checking");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const checkHealth = useCallback(async (): Promise<void> => {
    try {
      const res = await healthApi.check();
      if (res.success) {
        setStatus("connected");
        setErrorMsg("");
      } else {
        setStatus("disconnected");
        setErrorMsg("API returned unexpected response");
      }
    } catch (err) {
      setStatus("disconnected");
      setErrorMsg(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setLastChecked(new Date());
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30_000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const config: Record<
    ConnectionState,
    { icon: React.ReactNode; color: string; label: string }
  > = {
    checking: {
      icon: <CircularProgress size={14} sx={{ color: "#F39C12" }} />,
      color: "#F39C12",
      label: "Checking API...",
    },
    connected: {
      icon: <CheckCircle sx={{ fontSize: 16 }} />,
      color: "#2ECC71",
      label: "API connected",
    },
    disconnected: {
      icon: <ErrorOutline sx={{ fontSize: 16 }} />,
      color: "#E74C3C",
      label: errorMsg || "API disconnected",
    },
  };

  const { icon, color, label } = config[status];

  const tooltipText = [
    label,
    lastChecked ? `Last checked: ${lastChecked.toLocaleTimeString()}` : "",
    status === "disconnected"
      ? "Make sure the backend is running: npm run dev:backend"
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <Tooltip
      title={<span style={{ whiteSpace: "pre-line" }}>{tooltipText}</span>}
      arrow
      placement="bottom-end"
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          cursor: "default",
          color,
        }}
      >
        {icon}
        <Typography
          variant="caption"
          fontWeight={600}
          sx={{ color, display: { xs: "none", sm: "block" } }}
        >
          {status === "connected"
            ? "API"
            : status === "checking"
              ? "..."
              : "Offline"}
        </Typography>
      </Box>
    </Tooltip>
  );
}
