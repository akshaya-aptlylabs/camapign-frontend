import { Box, Avatar, Typography, Tooltip } from "@mui/material";
import { UserBadgeProps, UserRole, RoleConfig } from "../types";

const roleColors: Record<UserRole, RoleConfig> = {
  admin: { bg: "#EFEDFF", color: "#6C63FF", label: "Admin" },
  manager: { bg: "#E8FBF0", color: "#2ECC71", label: "Manager" },
  viewer: { bg: "#FEF3C7", color: "#F39C12", label: "Viewer" },
};

export default function UserBadge({
  user,
  showRole = false,
  size = "small",
}: UserBadgeProps) {
  const isSmall = size === "small";
  const avatarSz = isSmall ? 22 : 32;

  const role = roleColors[user.role];

  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Tooltip title={`${user.name} (${user.role})`} arrow>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          cursor: "default",
        }}
      >
        <Avatar
          src={user.avatarUrl}
          alt={user.name}
          sx={{
            width: avatarSz,
            height: avatarSz,
            fontSize: isSmall ? "0.65rem" : "0.8rem",
            fontWeight: 700,
          }}
        >
          {initials}
        </Avatar>

        {!isSmall && (
          <Box>
            <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
              {user.name}
            </Typography>
            {showRole && (
              <Typography
                variant="caption"
                sx={{
                  px: 0.75,
                  py: 0.1,
                  borderRadius: 1,
                  bgcolor: role.bg,
                  color: role.color,
                  fontWeight: 700,
                }}
              >
                {user.role}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Tooltip>
  );
}
