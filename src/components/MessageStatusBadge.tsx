import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
} from "@mui/material";
import {
  ArrowBack,
  EmailOutlined,
  AccessTimeOutlined,
  DoneAllOutlined,
  EventOutlined,
  CampaignOutlined,
} from "@mui/icons-material";

import { messageApi } from "../services/api";
import { MessageStatus, MessageChannel, Message } from "../types";

const ALL_STATUSES: MessageStatus[] = [
  "pending",
  "sent",
  "delivered",
  "failed",
  "bounced",
];

type Props = {
  status: MessageStatus;
};

export function MessageStatusBadge({ status }: Props) {
  return <span>{status}</span>;
}
const ALL_CHANNELS: MessageChannel[] = ["email", "sms", "push", "in-app"];

const STATUS_DESCRIPTIONS: Record<MessageStatus, string> = {
  pending: "Created but not yet dispatched to the sending service",
  sent: "Handed off to the sending service",
  delivered: "Confirmed received by recipient",
  failed: "Could not be sent",
  bounced: "Rejected by recipient server",
};

const CHANNEL_COLORS: Record<MessageChannel, string> = {
  email: "#6C63FF",
  sms: "#2ECC71",
  push: "#F39C12",
  "in-app": "#3498DB",
};

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageStatusBadgePage() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<MessageStatus | "all">(
    "all",
  );

  useEffect(() => {
    messageApi
      .getAll({ limit: 50 })
      .then((res) => setMessages(res.data.data || []))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, []);

  const filteredMessages =
    activeStatus === "all"
      ? messages
      : messages.filter((m) => m.status === activeStatus);

  return (
    <Box sx={{ flex: 1, bgcolor: "background.default", p: 3 }}>
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ bgcolor: "background.paper" }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Message Status Badges
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Live message statuses from API
            </Typography>
          </Box>
        </Box>

        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          {ALL_STATUSES.map((status) => (
            <Box key={status} sx={{ py: 1.5 }}>
              <MessageStatusBadge status={status} />
              <Typography variant="caption" color="text.secondary">
                {STATUS_DESCRIPTIONS[status]}
              </Typography>
            </Box>
          ))}
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : filteredMessages.length === 0 ? (
            <Typography>No messages found</Typography>
          ) : (
            filteredMessages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  gap: 2,
                  py: 2,
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: CHANNEL_COLORS[msg.channel],
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EmailOutlined sx={{ color: "white" }} />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <MessageStatusBadge status={msg.status} />

                  <Typography variant="body2" fontWeight={600}>
                    {msg.subject || "No Subject"}
                  </Typography>

                  <Typography variant="caption">{msg.body}</Typography>

                  <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                    <Typography variant="caption">
                      {fmtDate(msg.sentAt || msg.createdAt)}
                    </Typography>

                    {msg.event && (
                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/events/${msg.eventId}`);
                        }}
                      >
                        <EventOutlined fontSize="small" />
                        <Typography variant="caption">
                          {msg.event.name}
                        </Typography>
                      </Box>
                    )}

                    {msg.campaign && (
                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/campaigns/${msg.campaignId}`);
                        }}
                      >
                        <CampaignOutlined fontSize="small" />
                        <Typography variant="caption">
                          {msg.campaign.name}
                        </Typography>
                      </Box>
                    )}

                    {msg.openedAt && (
                      <DoneAllOutlined color="success" fontSize="small" />
                    )}
                  </Box>
                </Box>
              </Box>
            ))
          )}
        </Paper>
      </Box>
    </Box>
  );
}
