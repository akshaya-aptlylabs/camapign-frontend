import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Paper,
} from "@mui/material";
import {
  Add,
  SearchOutlined,
  NotificationsOutlined,
} from "@mui/icons-material";
import { ConnectionStatus, StatsBar } from "../components";
import { CampaignCard } from "../pages";

import { campaignApi, userApi } from "../services/api";
import {
  Campaign,
  CampaignStats,
  CampaignStatus,
  User,
  TabConfig,
} from "../types";
import { useSnackbar } from "../hooks";
import { useUserFilter } from "../context";

const TABS: TabConfig[] = [
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Draft", value: "draft" },
];

export default function DashboardPage() {
  const { activeUserId } = useUserFilter();
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState<number>(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [triggeredBy, setTriggeredBy] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [tabCounts, setTabCounts] = useState<TabCounts>({
    active: 0,
    completed: 0,
    draft: 0,
    paused: 0,
  });

  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const currentStatus = TABS[tabValue].value;

  useEffect(() => {
    userApi
      .getAll()
      .then((res) => setUsers(res.data || []))
      .catch(console.error);
  }, []);

  const fetchCampaigns = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {
        status: currentStatus,
        sortBy,
        sortOrder: "DESC",
      };
      if (search) params.search = search;
      if (triggeredBy !== "all") params.triggeredBy = triggeredBy;
      if (activeUserId) params.userId = activeUserId;

      const res = await campaignApi.getAll(params);
      setCampaigns(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, [currentStatus, search, triggeredBy, sortBy, activeUserId]);

  const fetchStats = useCallback(async (): Promise<void> => {
    setStatsLoading(true);
    try {
      const res = await campaignApi.getStats();
      setStats(res.data);
      setTabCounts({
        active: res.data?.counts?.active ?? 0,
        completed: res.data?.counts?.completed ?? 0,
        draft: res.data?.counts?.draft ?? 0,
        paused: 0,
      });
    } catch (err) {
      console.error("Stats fetch error:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await campaignApi.delete(id);
      showSnackbar("Campaign deleted");
      fetchCampaigns();
      fetchStats();
    } catch (err) {
      showSnackbar(
        err instanceof Error ? err.message : "Delete failed",
        "error",
      );
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: CampaignStatus,
  ): Promise<void> => {
    try {
      await campaignApi.update(id, { status: newStatus });
      showSnackbar(`Campaign marked as ${newStatus}`);
      fetchCampaigns();
      fetchStats();
    } catch (err) {
      showSnackbar(
        err instanceof Error ? err.message : "Update failed",
        "error",
      );
    }
  };

  const activeUser = users.find((u: User) => u.id === activeUserId);

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 1.5,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <TextField
          placeholder="Filter by name or description..."
          size="small"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined
                  sx={{ color: "text.secondary", fontSize: 20 }}
                />
              </InputAdornment>
            ),
          }}
        />
        <ConnectionStatus />
        <NotificationsOutlined
          sx={{ color: "text.secondary", cursor: "pointer" }}
        />
      </Box>

      <Box sx={{ p: 3, flex: 1 }}>
        <Paper
          sx={{
            mb: 3,
            p: 2.5,
            borderRadius: 3,
            background:
              "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "white",
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Unlock the Power of Our New Campaign Management Dashboard!
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
              Introducing our latest innovation — a revolutionary dashboard
              designed to elevate your campaign management.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: "white",
              color: "primary.main",
              flexShrink: 0,
              ml: 2,
              fontWeight: 700,
              "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
            }}
          >
            Try the New Features Now!
          </Button>
        </Paper>

        <StatsBar stats={stats} loading={statsLoading} />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Campaigns
            </Typography>
            {activeUser && (
              <Typography
                variant="body2"
                color="primary"
                fontWeight={600}
                sx={{ mt: 0.25 }}
              >
                Showing campaigns by {activeUser.name}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/campaigns/new")}
          >
            Create Campaign
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 2.5, flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Triggered by</InputLabel>
            <Select
              value={triggeredBy}
              onChange={(e) => setTriggeredBy(e.target.value)}
              label="Triggered by"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="manual">Manual</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="event">Event</MenuItem>
              <MenuItem value="api">API</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort by"
            >
              <MenuItem value="createdAt">Created Date</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={tabValue} onChange={(_e, v: number) => setTabValue(v)}>
            {TABS.map((tab: TabConfig, idx: number) => (
              <Tab
                key={tab.value}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {tab.label}
                    <Chip
                      label={tabCounts[tab.value] ?? 0}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        bgcolor: tabValue === idx ? "primary.main" : "grey.200",
                        color: tabValue === idx ? "white" : "text.secondary",
                      }}
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={600}
          sx={{ mb: 2 }}
        >
          {campaigns.length} Campaign{campaigns.length !== 1 ? "s" : ""}
          {activeUser ? ` by ${activeUser.name}` : ""}
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        ) : campaigns.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography color="text.secondary" variant="h6">
              No campaigns found
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
              {search
                ? "Try adjusting your search"
                : `No ${currentStatus} campaigns yet`}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/campaigns/new")}
              sx={{ mt: 3 }}
            >
              Create Campaign
            </Button>
          </Box>
        ) : (
          campaigns.map((campaign: Campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
