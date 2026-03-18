import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  EmailOutlined,
  MoreHoriz,
  PlayArrowOutlined,
  PauseOutlined,
  CheckCircleOutlined,
  EditNoteOutlined,
  DeleteOutlined,
  VisibilityOutlined,
  AccessTimeOutlined,
} from "@mui/icons-material";
import UserBadge from "../components/UserBadge";
import {
  CampaignCardProps,
  CampaignStatus,
  CampaignType,
  StatusConfig,
} from "../types";

const typeColors: Record<CampaignType, string> = {
  email: "#6C63FF",
  sms: "#FF6584",
  push: "#F39C12",
  "in-app": "#2ECC71",
};

const statusConfig: Record<CampaignStatus, StatusConfig> = {
  active: { label: "Running", color: "#2ECC71", bgcolor: "#E8FBF0" },
  completed: { label: "Completed", color: "#6C63FF", bgcolor: "#EFEDFF" },
  draft: { label: "Draft", color: "#6B7280", bgcolor: "#F3F4F6" },
  paused: { label: "Paused", color: "#F39C12", bgcolor: "#FEF3C7" },
};

// ── Small sub-component — typed inline ───────────────────────────────────────
interface MetricCellProps {
  value: string | number;
  label: string;
}

function MetricCell({ value, label }: MetricCellProps) {
  return (
    <Box sx={{ textAlign: "center", flex: 1, px: 1 }}>
      <Typography variant="h6" fontWeight={700} fontSize="1rem">
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary" fontWeight={500}>
        {label}
      </Typography>
    </Box>
  );
}

function formatNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(2)}K`;
  return String(n);
}

type CardAction =
  | "view"
  | "edit"
  | "delete"
  | "pause"
  | "activate"
  | "complete";

export default function CampaignCard({
  campaign,
  onDelete,
  onStatusChange,
}: CampaignCardProps) {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const status = statusConfig[campaign.status];
  const metrics = campaign.metrics;
  const typeColor = typeColors[campaign.type];

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleAction = (action: CardAction) => {
    handleMenuClose();
    if (action === "view") navigate(`/campaigns/${campaign.id}`);
    if (action === "edit") navigate(`/campaigns/${campaign.id}/edit`);
    if (action === "delete") onDelete?.(campaign.id);
    if (action === "pause") onStatusChange?.(campaign.id, "paused");
    if (action === "activate") onStatusChange?.(campaign.id, "active");
    if (action === "complete") onStatusChange?.(campaign.id, "completed");
  };

  return (
    <Card
      sx={{
        mb: 2,
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 20px rgba(108,99,255,0.12)",
          transform: "translateY(-1px)",
        },
      }}
      onClick={() => navigate(`/campaigns/${campaign.id}`)}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 0 } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              mr: 2,
              flexShrink: 0,
              bgcolor: typeColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 20,
            }}
          >
            <EmailOutlined />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {campaign.name}
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25 }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ flex: 1 }}
              >
                {campaign.description}
              </Typography>
              {campaign.user && <UserBadge user={campaign.user} />}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              ml: 2,
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <EmailOutlined sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                2
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AccessTimeOutlined
                sx={{ fontSize: 16, color: "text.secondary" }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                4
              </Typography>
            </Box>

            <Chip
              label={status.label}
              size="small"
              icon={
                campaign.status === "active" ? (
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: status.color,
                      ml: "6px !important",
                    }}
                  />
                ) : undefined
              }
              sx={{
                bgcolor: status.bgcolor,
                color: status.color,
                fontWeight: 700,
                fontSize: "0.72rem",
              }}
            />

            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreHoriz fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <MetricCell value={formatNum(campaign.delivered)} label="Delivered" />
          <Divider orientation="vertical" flexItem />
          <MetricCell value={`${metrics?.openRate ?? 0}%`} label="Opened" />
          <Divider orientation="vertical" flexItem />
          <MetricCell value={`${metrics?.clickRate ?? 0}%`} label="Clicked" />
          <Divider orientation="vertical" flexItem />
          <MetricCell
            value={`${metrics?.conversionRate ?? 0}%`}
            label="Converted"
          />
        </Box>
        <Box sx={{ height: 16 }} />
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <MenuItem onClick={() => handleAction("view")}>
          <VisibilityOutlined sx={{ mr: 1, fontSize: 18 }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => handleAction("edit")}>
          <EditNoteOutlined sx={{ mr: 1, fontSize: 18 }} /> Edit
        </MenuItem>
        {campaign.status === "active" && (
          <MenuItem onClick={() => handleAction("pause")}>
            <PauseOutlined sx={{ mr: 1, fontSize: 18 }} /> Pause
          </MenuItem>
        )}
        {campaign.status === "paused" && (
          <MenuItem onClick={() => handleAction("activate")}>
            <PlayArrowOutlined sx={{ mr: 1, fontSize: 18 }} /> Activate
          </MenuItem>
        )}
        {campaign.status !== "completed" && (
          <MenuItem onClick={() => handleAction("complete")}>
            <CheckCircleOutlined sx={{ mr: 1, fontSize: 18 }} /> Mark Complete
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={() => handleAction("delete")}
          sx={{ color: "error.main" }}
        >
          <DeleteOutlined sx={{ mr: 1, fontSize: 18 }} /> Delete
        </MenuItem>
      </Menu>
    </Card>
  );
}
