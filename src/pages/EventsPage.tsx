import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import {
  AccessTimeOutlined,
  MessageOutlined,
  CampaignOutlined,
  DeleteOutlined,
} from "@mui/icons-material";
import { eventApi } from "../services/api";
import { CampaignEvent, EventType } from "../types";
import EventTypeBadge from "../components/EventTypeBadge";
import { useSnackbar } from "../hooks";

const EVENT_TYPES: EventType[] = [
  "campaign_started",
  "campaign_paused",
  "campaign_completed",
  "email_sent",
  "email_opened",
  "email_clicked",
  "email_bounced",
  "user_converted",
  "user_unsubscribed",
  "custom",
];

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  campaignId?: string;
}

export default function EventsPage({ campaignId: propCampaignId }: Props) {
  const navigate = useNavigate();
  const { campaignId: paramCampaignId } = useParams<{ campaignId: string }>();
  const campaignId = propCampaignId || paramCampaignId;

  const [events, setEvents] = useState<CampaignEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { snackbar, showSnackbar } = useSnackbar();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (typeFilter !== "all") params.type = typeFilter;

      const res = campaignId
        ? await eventApi.getByCampaign(campaignId, params)
        : await eventApi.getAll(params);

      setEvents(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [campaignId, typeFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Delete this event? Messages under it will lose their event link.",
      )
    )
      return;
    try {
      await eventApi.delete(id);
      showSnackbar("Event deleted");
      fetchEvents();
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
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Event Type</InputLabel>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            label="Event Type"
          >
            <MenuItem value="all">All Types</MenuItem>
            {EVENT_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t.replace(/_/g, " ")}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
          {events.length} event{events.length !== 1 ? "s" : ""}
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
      ) : events.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="text.secondary">No events found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Events are recorded automatically when actions happen in a campaign.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ position: "relative", pl: 3 }}>
          <Box
            sx={{
              position: "absolute",
              left: 11,
              top: 8,
              bottom: 8,
              width: 2,
              bgcolor: "divider",
              borderRadius: 1,
            }}
          />

          {events.map((event, idx) => (
            <Box
              key={event.id}
              sx={{ display: "flex", gap: 2, mb: 2, position: "relative" }}
            >
              {/* Timeline dot */}
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  flexShrink: 0,
                  mt: 1.5,
                  zIndex: 1,
                  border: "2px solid white",
                  boxShadow: "0 0 0 2px #6C63FF44",
                }}
              />

              <Paper
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    boxShadow: "0 4px 16px rgba(108,99,255,0.1)",
                    transform: "translateX(2px)",
                  },
                }}
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <Box
                  sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}
                >
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
                      <EventTypeBadge type={event.type} />
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        sx={{ flex: 1 }}
                      >
                        {event.name}
                      </Typography>
                      <Tooltip title="Delete event">
                        <IconButton
                          size="small"
                          onClick={(e) => handleDelete(event.id, e)}
                          sx={{
                            color: "text.secondary",
                            "&:hover": { color: "error.main" },
                          }}
                        >
                          <DeleteOutlined sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {event.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {event.description}
                      </Typography>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <AccessTimeOutlined
                          sx={{ fontSize: 13, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {fmtTime(event.occurredAt)}
                        </Typography>
                      </Box>

                      {event.campaign && !campaignId && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            cursor: "pointer",
                            "&:hover": { color: "primary.main" },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/campaigns/${event.campaignId}`);
                          }}
                        >
                          <CampaignOutlined
                            sx={{ fontSize: 13, color: "text.secondary" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {event.campaign.name}
                          </Typography>
                        </Box>
                      )}

                      {(event.messageCount ?? 0) > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <MessageOutlined
                            sx={{ fontSize: 13, color: "text.secondary" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {event.messageCount} message
                            {(event.messageCount ?? 0) !== 1 ? "s" : ""}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {event.metadata &&
                      Object.keys(event.metadata).length > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            mt: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          {Object.entries(event.metadata)
                            .slice(0, 3)
                            .map(([k, v]) => (
                              <Chip
                                key={k}
                                label={`${k}: ${String(v)}`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "0.68rem", height: 20 }}
                              />
                            ))}
                        </Box>
                      )}
                  </Box>
                </Box>
              </Paper>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
