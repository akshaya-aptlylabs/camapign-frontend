import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import { ArrowBack, AccessTimeOutlined } from "@mui/icons-material";

import EventTypeBadge from "../components/EventTypeBadge";
import { eventApi } from "../services/api";
import { EVENT_ROUTES } from "../router";
import { EventType, CampaignEvent } from "../types";

const ALL_EVENT_TYPES: EventType[] = [
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

const CATEGORY_GROUPS: { label: string; types: EventType[] }[] = [
  {
    label: "Campaign Lifecycle",
    types: ["campaign_started", "campaign_paused", "campaign_completed"],
  },
  {
    label: "Email Activity",
    types: ["email_sent", "email_opened", "email_clicked", "email_bounced"],
  },
  {
    label: "User Actions",
    types: ["user_converted", "user_unsubscribed", "custom"],
  },
];

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventTypePage() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<CampaignEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<EventType | "all">("all");

  useEffect(() => {
    eventApi
      .getAll({ limit: 50 })
      .then((res) => setEvents(res.data || []))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents =
    activeFilter === "all"
      ? events
      : events.filter((e) => e.type === activeFilter);

  return (
    <Box sx={{ flex: 1, bgcolor: "background.default", p: 3 }}>
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Event Type Badges
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All variants with live data
            </Typography>
          </Box>
        </Box>

        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          {CATEGORY_GROUPS.map((group) => (
            <Box key={group.label} sx={{ mb: 3 }}>
              <Typography variant="caption" fontWeight={700}>
                {group.label}
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  gap: 1.5,
                  mt: 1,
                }}
              >
                {group.types.map((type) => (
                  <Box key={type} sx={{ display: "contents" }}>
                    <Typography fontSize="0.8rem">{type}</Typography>

                    {/* <EventTypeBadge type={type} size="small" />
                    <EventTypeBadge type={type} size="medium" /> */}
                  </Box>
                ))}
              </Box>

              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label="All"
              onClick={() => setActiveFilter("all")}
              color={activeFilter === "all" ? "primary" : "default"}
            />

            {ALL_EVENT_TYPES.map((type) => (
              <Box
                key={type}
                onClick={() =>
                  setActiveFilter((prev) => (prev === type ? "all" : type))
                }
                sx={{ cursor: "pointer" }}
              >
                {/* <EventTypeBadge type={type} size="small" /> */}
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : filteredEvents.length === 0 ? (
            <Typography>No events found</Typography>
          ) : (
            filteredEvents.map((event) => (
              <Box
                key={event.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  py: 1,
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                }}
                onClick={() => navigate(EVENT_ROUTES.detail(event.id))}
              >
                {/* <EventTypeBadge type={event.type} size="small" /> */}

                <Box sx={{ flex: 1 }}>
                  <Typography>{event.name}</Typography>
                  <Typography fontSize="0.75rem" color="gray">
                    {event.campaign?.name}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AccessTimeOutlined fontSize="small" />
                  <Typography fontSize="0.75rem">
                    {fmtDate(event.occurredAt)}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Paper>
      </Box>
    </Box>
  );
}
