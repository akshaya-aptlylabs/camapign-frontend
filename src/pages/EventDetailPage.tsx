import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Grid,
} from "@mui/material";
import {
  ArrowBack,
  AccessTimeOutlined,
  CampaignOutlined,
} from "@mui/icons-material";
import { eventApi } from "../services/api";
import { CampaignEvent, Message } from "../types";
import EventTypeBadge from "../components/EventTypeBadge";
import MessageStatusBadge from "../components/MessageStatusBadge";

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessageRow({ msg }: { msg: Message }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, mb: 1 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <MessageStatusBadge status={msg.status} />
            <Chip
              label={msg.channel}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.68rem", height: 20 }}
            />
            {msg.recipientName && (
              <Typography variant="caption" color="text.secondary">
                → {msg.recipientName}{" "}
                {msg.recipientEmail ? `<${msg.recipientEmail}>` : ""}
              </Typography>
            )}
          </Box>
          {msg.subject && (
            <Typography variant="body2" fontWeight={600} noWrap>
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
        </Box>
        <Box sx={{ flexShrink: 0, textAlign: "right" }}>
          <Typography variant="caption" color="text.secondary" display="block">
            {fmtDate(msg.sentAt || msg.createdAt)}
          </Typography>
          {msg.openedAt && (
            <Typography variant="caption" color="success.main" display="block">
              Opened {fmtDate(msg.openedAt)}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<CampaignEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    eventApi
      .getById(id)
      .then((res) => setEvent(res.data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load event"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          p: 6,
        }}
      >
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  if (!event) return null;

  const messages: Message[] = (event.messages as Message[]) || [];

  return (
    <Box sx={{ flex: 1, bgcolor: "background.default", p: 3 }}>
      <Box sx={{ maxWidth: 860, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 4 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ bgcolor: "background.paper", mt: 0.5 }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 0.5,
                flexWrap: "wrap",
              }}
            >
              <EventTypeBadge type={event.type} size="medium" />
              <Typography variant="h5" fontWeight={700}>
                {event.name}
              </Typography>
            </Box>
            {event.description && (
              <Typography variant="body2" color="text.secondary">
                {event.description}
              </Typography>
            )}
          </Box>
        </Box>

        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
              >
                Occurred At
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {fmtDate(event.occurredAt)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
              >
                Campaign
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                color="primary"
                sx={{ cursor: "pointer" }}
                onClick={() => navigate(`/campaigns/${event.campaignId}`)}
              >
                {event.campaign?.name ?? event.campaignId}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
              >
                Messages
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {messages.length}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
              >
                Recorded
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {fmtDate(event.createdAt)}
              </Typography>
            </Grid>
          </Grid>

          {/* Metadata */}
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                sx={{ mb: 1, display: "block" }}
              >
                METADATA
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {Object.entries(event.metadata).map(([k, v]) => (
                  <Chip
                    key={k}
                    label={`${k}: ${String(v)}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.72rem" }}
                  />
                ))}
              </Box>
            </>
          )}
        </Paper>

        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
          Messages under this Event ({messages.length})
        </Typography>

        {messages.length === 0 ? (
          <Paper sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
            <Typography color="text.secondary">
              No messages recorded for this event.
            </Typography>
          </Paper>
        ) : (
          messages.map((msg: Message) => <MessageRow key={msg.id} msg={msg} />)
        )}
      </Box>
    </Box>
  );
}
