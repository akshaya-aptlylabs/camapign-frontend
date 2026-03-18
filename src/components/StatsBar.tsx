import { Box, Card, CardContent, Typography, Skeleton } from "@mui/material";
import { ReactElement } from "react";
import {
  CampaignOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  DraftsOutlined,
} from "@mui/icons-material";
import { StatsBarProps } from "../types";

interface StatCardConfig {
  key: "total" | "active" | "completed" | "draft";
  label: string;
  icon: ReactElement;
  color: string;
  bg: string;
}

const statCards: StatCardConfig[] = [
  {
    key: "total",
    label: "Total Campaigns",
    icon: <CampaignOutlined />,
    color: "#6C63FF",
    bg: "#EFEDFF",
  },
  {
    key: "active",
    label: "Active",
    icon: <PlayCircleOutlined />,
    color: "#2ECC71",
    bg: "#E8FBF0",
  },
  {
    key: "completed",
    label: "Completed",
    icon: <CheckCircleOutlined />,
    color: "#F39C12",
    bg: "#FEF3C7",
  },
  {
    key: "draft",
    label: "Drafts",
    icon: <DraftsOutlined />,
    color: "#6B7280",
    bg: "#F3F4F6",
  },
];

export default function StatsBar({ stats, loading }: StatsBarProps) {
  return (
    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
      {statCards.map(({ key, label, icon, color, bg }) => (
        <Card key={key} sx={{ flex: 1 }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: bg,
                  color,
                  display: "flex",
                }}
              >
                {icon}
              </Box>
              <Box>
                {loading ? (
                  <Skeleton width={40} height={28} />
                ) : (
                  <Typography variant="h5" fontWeight={700}>
                    {stats?.counts?.[key] ?? 0}
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={500}
                >
                  {label}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
