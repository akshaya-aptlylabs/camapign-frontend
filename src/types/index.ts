export type CampaignStatus = "active" | "completed" | "draft" | "paused";
export type CampaignType = "email" | "sms" | "push" | "in-app";
export type TriggerType = "manual" | "scheduled" | "event" | "api";
export type UserRole = "admin" | "manager" | "viewer";

export interface CampaignMetrics {
  deliveredRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  bounceRate: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  campaignCount?: number;
  campaigns?: Campaign[];
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  type: CampaignType;
  triggeredBy: TriggerType;
  tags: string[];
  subject?: string;
  senderName?: string;
  senderEmail?: string;
  totalRecipients: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  bounced: number;
  unsubscribed: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  userId: string;
  user?: User;
  metrics?: CampaignMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CampaignStats {
  counts: {
    total: number;
    active: number;
    completed: number;
    draft: number;
  };
  aggregates: {
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    totalRecipients: number;
    avgOpenRate: string;
    avgClickRate: string;
    avgConversionRate: string;
  };
}

export interface CampaignFormData {
  name: string;
  description: string;
  type: CampaignType;
  triggeredBy: TriggerType;
  tags: string[];
  subject: string;
  senderName: string;
  senderEmail: string;
  totalRecipients: string;
  scheduledAt: string;
  userId: string;
}

export type FormErrors = Partial<Record<keyof CampaignFormData, string>>;

export interface CampaignCardProps {
  campaign: Campaign;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: CampaignStatus) => void;
}

export interface UserBadgeProps {
  user: User;
  showRole?: boolean;
  size?: "small" | "large";
}

export interface UsersPanelProps {
  onUserFilter: (userId: string | null) => void;
  activeUserId: string | null;
}

export interface SidebarProps {
  onUserFilter: (userId: string | null) => void;
  activeUserId: string | null;
}

export interface StatsBarProps {
  stats: CampaignStats | null;
  loading: boolean;
}

export interface DashboardPageProps {
  activeUserId?: string | null;
}

export interface StatusConfig {
  label: string;
  color: string;
  bgcolor: string;
}

export interface RoleConfig {
  label: string;
  color: string;
  bg: string;
}

export interface TabConfig {
  label: string;
  value: CampaignStatus;
}

export interface NavItem {
  label: string;
  icon: React.ReactElement;
  path: string;
  hasArrow?: boolean;
}

export interface NavSection {
  items: NavItem[];
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}
