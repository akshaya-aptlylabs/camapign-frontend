import { useState, useEffect, ReactElement } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  LinearProgress,
  Tab,
  Tabs,
} from "@mui/material";
import {
  ArrowBack,
  EditOutlined,
  DeleteOutlined,
  EmailOutlined,
  OpenInNewOutlined,
  TouchAppOutlined,
  ShoppingCartOutlined,
  PeopleOutlined,
  TimelineOutlined,
  MessageOutlined,
} from "@mui/icons-material";
import { campaignApi } from "../services/api";
import UserBadge from "../components/UserBadge";
import { EventsPage, MessagesPage } from "../pages";
import { Campaign, CampaignStatus, StatusConfig } from "../types";

const statusConfig: Record<CampaignStatus, StatusConfig> = {
  active: { label: "Running", color: "#2ECC71", bgcolor: "#E8FBF0" },
  completed: { label: "Completed", color: "#6C63FF", bgcolor: "#EFEDFF" },
  draft: { label: "Draft", color: "#6B7280", bgcolor: "#F3F4F6" },
  paused: { label: "Paused", color: "#F39C12", bgcolor: "#FEF3C7" },
};

interface MetricCardProps {
  icon: ReactElement;
  label: string;
  value: number;
  rate?: number;
  rateLabel?: string;
  color?: string;
}

function MetricCard({
  icon,
  label,
  value,
  rate,
  rateLabel,
  color = "#6C63FF",
}: MetricCardProps) {
  return (
    <Paper sx={{ p: 3, borderRadius: 3, flex: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: `${color}18`,
            color,
            display: "flex",
          }}
        >
          {icon}
        </Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      </Box>
      <Typography variant="h4" fontWeight={700}>
        {value?.toLocaleString()}
      </Typography>
      {rate !== undefined && (
        <Box sx={{ mt: 1.5 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography variant="caption" color="text.secondary">
              {rateLabel}
            </Typography>
            <Typography variant="caption" fontWeight={700} color={color}>
              {rate}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(rate, 100)}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: `${color}18`,
              "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 3 },
            }}
          />
        </Box>
      )}
    </Paper>
  );
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    campaignApi
      .getById(id)
      .then((res) => setCampaign(res.data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id || !window.confirm("Delete this campaign?")) return;
    try {
      await campaignApi.delete(id);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          bgcolor: "background.default",
        }}
      >
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box sx={{ p: 3, flex: 1, bgcolor: "background.default" }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  if (!campaign) return null;

  const status = statusConfig[campaign.status];
  const metrics = campaign.metrics;

  return (
    <Box sx={{ flex: 1, bgcolor: "background.default", p: 3 }}>
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3 }}>
          <IconButton
            onClick={() => navigate("/")}
            sx={{ bgcolor: "background.paper", mt: 0.5 }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="h5" fontWeight={700}>
                {campaign.name}
              </Typography>
              <Chip
                label={status.label}
                size="small"
                sx={{
                  bgcolor: status.bgcolor,
                  color: status.color,
                  fontWeight: 700,
                }}
              />
              <Chip label={campaign.type} size="small" variant="outlined" />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {campaign.description}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<EditOutlined />}
              onClick={() => navigate(`/campaigns/${id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Box>
        </Box>

        {campaign.user && (
          <Paper
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <UserBadge user={campaign.user} size="large" showRole />
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
              >
                Campaign Owner
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {campaign.user.email}
              </Typography>
            </Box>
          </Paper>
        )}

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tab} onChange={(_, v: number) => setTab(v)}>
            <Tab label="Overview" />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <TimelineOutlined sx={{ fontSize: 16 }} />
                  Events
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <MessageOutlined sx={{ fontSize: 16 }} />
                  Messages
                </Box>
              }
            />
          </Tabs>
        </Box>

        {tab === 0 && (
          <Box>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Campaign Details
              </Typography>
              <Grid container spacing={2}>
                {(
                  [
                    ["Triggered By", campaign.triggeredBy],
                    ["Sender", campaign.senderName ?? "—"],
                    ["Sender Email", campaign.senderEmail ?? "—"],
                    ["Subject", campaign.subject ?? "—"],
                    [
                      "Total Recipients",
                      campaign.totalRecipients?.toLocaleString() ?? "0",
                    ],
                    [
                      "Started",
                      campaign.startedAt
                        ? new Date(campaign.startedAt).toLocaleDateString()
                        : "—",
                    ],
                    [
                      "Completed",
                      campaign.completedAt
                        ? new Date(campaign.completedAt).toLocaleDateString()
                        : "—",
                    ],
                    [
                      "Created",
                      new Date(campaign.createdAt).toLocaleDateString(),
                    ],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={label}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={500}
                    >
                      {label}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ mt: 0.25 }}
                    >
                      {value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
              {campaign.tags?.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={500}
                      sx={{ mr: 1 }}
                    >
                      Tags:
                    </Typography>
                    {campaign.tags.map((tag: string) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </>
              )}
            </Paper>

            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Performance Metrics
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
              <MetricCard
                icon={<EmailOutlined />}
                label="Delivered"
                value={campaign.delivered}
                rate={metrics?.deliveredRate}
                rateLabel="of total"
                color="#6C63FF"
              />
              <MetricCard
                icon={<OpenInNewOutlined />}
                label="Opened"
                value={campaign.opened}
                rate={metrics?.openRate}
                rateLabel="of delivered"
                color="#2ECC71"
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
              <MetricCard
                icon={<TouchAppOutlined />}
                label="Clicked"
                value={campaign.clicked}
                rate={metrics?.clickRate}
                rateLabel="of opened"
                color="#F39C12"
              />
              <MetricCard
                icon={<ShoppingCartOutlined />}
                label="Converted"
                value={campaign.converted}
                rate={metrics?.conversionRate}
                rateLabel="of delivered"
                color="#FF6584"
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <MetricCard
                icon={<PeopleOutlined />}
                label="Bounced"
                value={campaign.bounced}
                rate={metrics?.bounceRate}
                rateLabel="bounce rate"
                color="#E74C3C"
              />
              <MetricCard
                icon={<PeopleOutlined />}
                label="Unsubscribed"
                value={campaign.unsubscribed}
                color="#6B7280"
              />
            </Box>
          </Box>
        )}

        {tab === 1 && id && <EventsPage campaignId={id} />}

        {tab === 2 && id && <MessagesPage campaignId={id} />}
      </Box>
    </Box>
  );
}
