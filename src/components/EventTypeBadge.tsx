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
  Grid,
  IconButton,
} from "@mui/material";
import { ArrowBack, AccessTimeOutlined } from "@mui/icons-material";

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

type Props = {
  type: EventType;
  size?: "small" | "medium";
};

export default function EventTypeBadge({ type, size = "medium" }: Props) {
  return (
    <span>
      {type} ({size})
    </span>
  );

  const navigate = useNavigate();

  const [events, setEvents] = useState<CampaignEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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
              Event Type Badges
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All variants of the EventTypeBadge component, with live events
              from the API
            </Typography>
          </Box>
        </Box>

        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
            All Variants
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Every <code>EventType</code> value, both sizes
          </Typography>

          {CATEGORY_GROUPS.map((group) => (
            <Box key={group.label} sx={{ mb: 3 }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  mb: 1.5,
                  display: "block",
                }}
              >
                {group.label}
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                {group.types.map((type) => (
                  <>
                    <Typography
                      key={`${type}-name`}
                      variant="body2"
                      color="text.secondary"
                      fontFamily="monospace"
                      fontSize="0.78rem"
                    >
                      {type}
                    </Typography>

                    <Box
                      key={`${type}-small`}
                      sx={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <EventTypeBadge type={type} size="small" />
                    </Box>

                    <Box
                      key={`${type}-medium`}
                      sx={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <EventTypeBadge type={type} size="medium" />
                    </Box>
                  </>
                ))}
              </Box>

              {group === CATEGORY_GROUPS[0] && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    gap: 1.5,
                    mt: 0.5,
                  }}
                >
                  <span />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textAlign: "right" }}
                  >
                    small
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textAlign: "right" }}
                  >
                    medium
                  </Typography>
                </Box>
              )}

              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
        </Paper>

        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
            Filter Live Events
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click a badge to filter the events list below
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label="All"
              size="small"
              onClick={() => setActiveFilter("all")}
              sx={{
                fontWeight: 700,
                fontSize: "0.72rem",
                bgcolor: activeFilter === "all" ? "primary.main" : "grey.100",
                color: activeFilter === "all" ? "white" : "text.secondary",
                cursor: "pointer",
              }}
            />

            {ALL_EVENT_TYPES.map((type) => (
              <Box
                key={type}
                onClick={() =>
                  setActiveFilter((prev) => (prev === type ? "all" : type))
                }
                sx={{
                  borderRadius: 10,
                  cursor: "pointer",
                  outline:
                    activeFilter === type
                      ? "2px solid"
                      : "2px solid transparent",
                  outlineColor:
                    activeFilter === type ? "primary.main" : "transparent",
                  outlineOffset: 2,
                  transition: "outline-color 0.15s ease",
                }}
              >
                <EventTypeBadge type={type} size="small" />
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Live Events
              {activeFilter !== "all" && (
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  — filtered by <strong>{activeFilter}</strong>
                </Typography>
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredEvents.length} event
              {filteredEvents.length !== 1 ? "s" : ""}
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          ) : filteredEvents.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">
                {activeFilter === "all"
                  ? "No events found — run npm run seed to generate data"
                  : `No events of type "${activeFilter}"`}
              </Typography>
            </Box>
          ) : (
            <Box>
              {filteredEvents.map((event) => (
                <Box
                  key={event.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: 1.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-child": { borderBottom: "none" },
                    cursor: "pointer",
                    borderRadius: 1,
                    "&:hover": { bgcolor: "action.hover" },
                    px: 1,
                  }}
                  onClick={() => navigate(EVENT_ROUTES.root(event.id))}
                >
                  <EventTypeBadge type={event.type} size="small" />

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {event.name}
                    </Typography>
                    {event.campaign && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        {event.campaign.name}
                      </Typography>
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      flexShrink: 0,
                    }}
                  >
                    <AccessTimeOutlined
                      sx={{ fontSize: 13, color: "text.secondary" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {fmtDate(event.occurredAt)}
                    </Typography>
                  </Box>

                  {(event.messageCount ?? 0) > 0 && (
                    <Chip
                      label={`${event.messageCount} msg`}
                      size="small"
                      sx={{ fontSize: "0.68rem", height: 20 }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
