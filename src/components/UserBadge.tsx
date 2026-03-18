// src/components/UserBadge.tsx
// ─────────────────────────────────────────────────────────────
// TYPESCRIPT LESSON: FC<Props> — Typed React components
//
// React.FC<Props> = "Function Component that takes Props"
// It adds:
//   - children prop (ReactNode) automatically
//   - return type checking (must return JSX or null)
//
// The Props interface is defined inline or separately.
// ─────────────────────────────────────────────────────────────

import { Box, Avatar, Typography, Tooltip } from "@mui/material";
import { UserBadgeProps, UserRole, RoleConfig } from "../types";

// Record<UserRole, RoleConfig> — an object where:
//   keys   = every value in UserRole ('admin' | 'manager' | 'viewer')
//   values = RoleConfig
// TS will error if you forget any key — exhaustive mapping
const roleColors: Record<UserRole, RoleConfig> = {
  admin: { bg: "#EFEDFF", color: "#6C63FF", label: "Admin" },
  manager: { bg: "#E8FBF0", color: "#2ECC71", label: "Manager" },
  viewer: { bg: "#FEF3C7", color: "#F39C12", label: "Viewer" },
};

// React.FC<UserBadgeProps> — fully typed functional component
// Props come from UserBadgeProps interface in types/index.ts
export default function UserBadge({
  user,
  showRole = false,
  size = "small",
}: UserBadgeProps) {
  // No 'if (!user)' needed — TS guarantees user is a User (not null/undefined)
  // because UserBadgeProps.user: User (not User | null)

  const isSmall = size === "small";
  const avatarSz = isSmall ? 22 : 32;

  // roleColors[user.role] is safe — user.role is UserRole, all keys are covered
  const role = roleColors[user.role];

  // TypeScript infers: initials is string[]
  const initials = user.name
    .split(" ")
    .map((n: string) => n[0]) // n is typed as string — .split() returns string[]
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
          src={user.avatarUrl} // avatarUrl?: string — TS knows it might be undefined, Avatar accepts that
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
