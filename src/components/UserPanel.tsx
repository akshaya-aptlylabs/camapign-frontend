import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Skeleton,
  Divider,
} from "@mui/material";
import { userApi } from "../services/api";
import { User, UserRole, RoleConfig, UsersPanelProps } from "../types";

const roleConfig: Record<UserRole, RoleConfig> = {
  admin: { color: "#6C63FF", bg: "#EFEDFF", label: "Admin" },
  manager: { color: "#2ECC71", bg: "#E8FBF0", label: "Manager" },
  viewer: { color: "#F39C12", bg: "#FEF3C7", label: "Viewer" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function UsersPanel({
  onUserFilter,
  activeUserId,
}: UsersPanelProps) {
  // useState<User[]> — array of User objects, starts empty
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    userApi
      .getAll()
      .then((res) => setUsers(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Box sx={{ p: 2 }}>
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}
          >
            <Skeleton variant="circular" width={36} height={36} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="60%" height={16} />
              <Skeleton width="40%" height={14} />
            </Box>
          </Box>
        ))}
      </Box>
    );

  return (
    <Box>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          Team Members
        </Typography>
        {activeUserId && (
          <Typography
            variant="caption"
            color="primary"
            fontWeight={600}
            sx={{ cursor: "pointer" }}
            onClick={() => onUserFilter(null)}
          >
            Clear filter
          </Typography>
        )}
      </Box>

      {users.map((user: User, i: number) => {
        const role = roleConfig[user.role];
        const isActive = activeUserId === user.id;

        return (
          <Box key={user.id}>
            <Box
              onClick={() => onUserFilter(isActive ? null : user.id)}
              sx={{
                px: 2,
                py: 1.25,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",
                bgcolor: isActive ? "rgba(108,99,255,0.06)" : "transparent",
                borderLeft: isActive
                  ? "3px solid #6C63FF"
                  : "3px solid transparent",
                transition: "all 0.15s ease",
                "&:hover": { bgcolor: "rgba(108,99,255,0.04)" },
              }}
            >
              <Avatar
                src={user.avatarUrl}
                sx={{
                  width: 34,
                  height: 34,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                {getInitials(user.name)}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {user.name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Chip
                    label={role.label}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      bgcolor: role.bg,
                      color: role.color,
                      px: 0.25,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {user.campaignCount ?? 0} campaign
                    {(user.campaignCount ?? 0) !== 1 ? "s" : ""}
                  </Typography>
                </Box>
              </Box>
            </Box>
            {i < users.length - 1 && <Divider sx={{ mx: 2 }} />}
          </Box>
        );
      })}
    </Box>
  );
}
