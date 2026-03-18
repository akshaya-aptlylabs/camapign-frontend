import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Paper,
} from "@mui/material";
import {
  DashboardOutlined,
  BarChartOutlined,
  CampaignOutlined,
  EmailOutlined,
  SwapHorizOutlined,
  LocalShippingOutlined,
  PeopleOutlined,
  CategoryOutlined,
  SegmentOutlined,
  TimelineOutlined,
  StorageOutlined,
  ContentPasteOutlined,
  SettingsOutlined,
  KeyboardArrowDownOutlined,
} from "@mui/icons-material";
import UsersPanel from "./UserPanel";
import { SidebarProps, NavSection } from "../types";

const navSections: NavSection[] = [
  {
    items: [
      { label: "Dashboard", icon: <DashboardOutlined />, path: "/" },
      { label: "Analysis", icon: <BarChartOutlined />, path: "/analysis" },
    ],
  },
  {
    items: [
      { label: "Campaigns", icon: <CampaignOutlined />, path: "/campaigns" },
      { label: "Broadcasts", icon: <EmailOutlined />, path: "/broadcasts" },
      {
        label: "Transactional",
        icon: <SwapHorizOutlined />,
        path: "/transactional",
      },
      {
        label: "Deliveries & Drafts",
        icon: <LocalShippingOutlined />,
        path: "/deliveries",
      },
    ],
  },
  {
    items: [
      { label: "People", icon: <PeopleOutlined />, path: "/people" },
      {
        label: "Custom Objects",
        icon: <CategoryOutlined />,
        path: "/custom-objects",
      },
      { label: "Segments", icon: <SegmentOutlined />, path: "/segments" },
      { label: "Activity Logs", icon: <TimelineOutlined />, path: "/activity" },
      {
        label: "Data & Integrations",
        icon: <StorageOutlined />,
        path: "/integrations",
        hasArrow: true,
      },
    ],
  },
  {
    items: [
      {
        label: "Content",
        icon: <ContentPasteOutlined />,
        path: "/content",
        hasArrow: true,
      },
    ],
  },
];

export default function Sidebar({ onUserFilter, activeUserId }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string): boolean => {
    if (path === "/") return location.pathname === "/";
    if (path === "/campaigns")
      return location.pathname.startsWith("/campaigns");
    return location.pathname === path;
  };

  return (
    <Box
      sx={{
        width: 230,
        minHeight: "100vh",
        bgcolor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        py: 2,
        flexShrink: 0,
        overflow: "auto",
      }}
    >
      <Box
        sx={{ px: 2.5, mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}
      >
        <Avatar
          sx={{
            width: 34,
            height: 34,
            borderRadius: "10px",
            bgcolor: "green",
            fontSize: "0.85rem",
            fontWeight: 700,
          }}
        >
          up
        </Avatar>
        <Typography variant="h6" fontWeight={700} fontSize="1rem">
          Level Up
        </Typography>
        <KeyboardArrowDownOutlined
          sx={{ ml: "auto", fontSize: 18, color: "text.secondary" }}
        />
      </Box>

      <Box sx={{ flex: 1 }}>
        {navSections.map((section: NavSection, si: number) => (
          <Box key={si}>
            {si > 0 && <Divider sx={{ my: 1, mx: 2 }} />}
            <List dense disablePadding>
              {section.items.map((item) => (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    selected={isActive(item.path)}
                    sx={{
                      mx: 1.5,
                      borderRadius: 2,
                      mb: 0.25,
                      "&.Mui-selected": {
                        bgcolor: "primary.main",
                        color: "white",
                        "& .MuiListItemIcon-root": { color: "white" },
                        "&:hover": { bgcolor: "primary.dark" },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 34,
                        color: isActive(item.path) ? "white" : "text.secondary",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: "0.85rem",
                        fontWeight: isActive(item.path) ? 600 : 500,
                      }}
                    />
                    {item.hasArrow && (
                      <KeyboardArrowDownOutlined
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}

        <Divider sx={{ my: 1.5, mx: 2 }} />
        <Paper
          elevation={0}
          sx={{
            mx: 1.5,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <UsersPanel onUserFilter={onUserFilter} activeUserId={activeUserId} />
        </Paper>
      </Box>

      <Divider sx={{ mx: 2, mb: 1, mt: 2 }} />
      <List dense disablePadding>
        <ListItem disablePadding>
          <ListItemButton sx={{ mx: 1.5, borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 34, color: "text.secondary" }}>
              <SettingsOutlined />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}
