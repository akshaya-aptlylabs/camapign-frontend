import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  AccessTimeOutlined,
  EmailOutlined,
  CampaignOutlined,
  EventOutlined,
  DeleteOutlined,
  DoneAllOutlined,
} from "@mui/icons-material";
import { messageApi } from "../services/api";
import { Message, MessageStatus, MessageChannel } from "../types";
import { useSnackbar } from "../hooks";

const STATUSES: MessageStatus[] = [
  "pending",
  "sent",
  "delivered",
  "failed",
  "bounced",
];
const CHANNELS: MessageChannel[] = ["email", "sms", "push", "in-app"];

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  campaignId?: string;
  eventId?: string;
  status?: string;
}

export function MessageStatusBadge({ status }: Props) {
  return <span>{status}</span>;
}

export default function MessagesPage({
  campaignId: propCampaignId,
  eventId: propEventId,
}: Props) {
  const navigate = useNavigate();
  const params = useParams<{ campaignId?: string; eventId?: string }>();
  const campaignId = propCampaignId || params.campaignId;
  const eventId = propEventId || params.eventId;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const { showSnackbar } = useSnackbar();

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qp: Record<string, string> = {};
      if (statusFilter !== "all") qp.status = statusFilter;
      if (channelFilter !== "all") qp.channel = channelFilter;

      let res;
      if (eventId) res = await messageApi.getByEvent(eventId, qp);
      else if (campaignId) res = await messageApi.getByCampaign(campaignId, qp);
      else res = await messageApi.getAll(qp);

      setMessages(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [campaignId, eventId, statusFilter, channelFilter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this message?")) return;
    try {
      await messageApi.delete(id);
      showSnackbar("Message deleted");
      fetchMessages();
    } catch (err) {
      showSnackbar(
        err instanceof Error ? err.message : "Delete failed",
        "error",
      );
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Statuses</MenuItem>
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Channel</InputLabel>
          <Select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            label="Channel"
          >
            <MenuItem value="all">All Channels</MenuItem>
            {CHANNELS.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
          {messages.length} message{messages.length !== 1 ? "s" : ""}
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      ) : messages.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="text.secondary">No messages found</Typography>
        </Box>
      ) : (
        <Box>
          {messages.map((msg: Message) => (
            <Paper
              key={msg.id}
              sx={{
                p: 2,
                mb: 1.5,
                borderRadius: 2,
                transition: "all 0.15s ease",
                "&:hover": {
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    flexShrink: 0,
                    bgcolor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <EmailOutlined sx={{ fontSize: 18 }} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.75,
                      flexWrap: "wrap",
                    }}
                  >
                    <MessageStatusBadge status={msg.status} />
                    <Chip
                      label={msg.channel}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "0.68rem", height: 20 }}
                    />
                    <Chip
                      label={
                        msg.direction === "inbound" ? "← Inbound" : "→ Outbound"
                      }
                      size="small"
                      sx={{
                        fontSize: "0.68rem",
                        height: 20,
                        bgcolor:
                          msg.direction === "inbound" ? "#E8F4FD" : "#F0FDF4",
                        color:
                          msg.direction === "inbound" ? "#2980B9" : "#27AE60",
                      }}
                    />
                  </Box>

                  {msg.subject && (
                    <Typography variant="body2" fontWeight={700} noWrap>
                      {msg.subject}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {msg.body}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mt: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    {msg.recipientEmail && (
                      <Typography variant="caption" color="text.secondary">
                        → {msg.recipientName || msg.recipientEmail}
                      </Typography>
                    )}
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.4 }}
                    >
                      <AccessTimeOutlined
                        sx={{ fontSize: 12, color: "text.secondary" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {fmtDate(msg.sentAt || msg.createdAt)}
                      </Typography>
                    </Box>
                    {msg.openedAt && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.4 }}
                      >
                        <DoneAllOutlined
                          sx={{ fontSize: 12, color: "success.main" }}
                        />
                        <Typography variant="caption" color="success.main">
                          Opened
                        </Typography>
                      </Box>
                    )}

                    {msg.event && !eventId && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.4,
                          cursor: "pointer",
                          "&:hover": { color: "primary.main" },
                        }}
                        onClick={() => navigate(`/events/${msg.eventId}`)}
                      >
                        <EventOutlined
                          sx={{ fontSize: 12, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {msg.event.name}
                        </Typography>
                      </Box>
                    )}
                    {msg.campaign && !campaignId && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.4,
                          cursor: "pointer",
                          "&:hover": { color: "primary.main" },
                        }}
                        onClick={() => navigate(`/campaigns/${msg.campaignId}`)}
                      >
                        <CampaignOutlined
                          sx={{ fontSize: 12, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {msg.campaign.name}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={(e) => handleDelete(msg.id, e)}
                    sx={{
                      color: "text.secondary",
                      "&:hover": { color: "error.main" },
                    }}
                  >
                    <DeleteOutlined sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}
