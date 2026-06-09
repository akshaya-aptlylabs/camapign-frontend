import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Avatar,
} from "@mui/material";
import { Add, Close, ArrowBack } from "@mui/icons-material";
import { campaignApi, userApi } from "../services/api";
import {
  CampaignFormData,
  FormErrors,
  User,
  CampaignType,
  TriggerType,
} from "../types";

const steps: string[] = ["Basic Info", "Configuration", "Review"];

const defaultForm: CampaignFormData = {
  name: "",
  description: "",
  type: "email",
  triggeredBy: "manual",
  tags: [],
  subject: "",
  senderName: "",
  senderEmail: "",
  totalRecipients: "",
  scheduledAt: "",
  userId: "",
};

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [form, setForm] = useState<CampaignFormData>(defaultForm);
  const [tagInput, setTagInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    userApi
      .getAll()
      .then((res) => {
        const list: User[] = res.data || [];
        setUsers(list);
        const admin = list.find((u: User) => u.role === "admin");
        if (admin) setForm((f) => ({ ...f, userId: admin.id }));
      })
      .catch(console.error);
  }, []);
  const handleChange =
    (field: keyof CampaignFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setFieldErrors((fe) => ({ ...fe, [field]: undefined }));
    };

  const addTag = (): void => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string): void => {
    setForm((f) => ({ ...f, tags: f.tags.filter((t: string) => t !== tag) }));
  };

  const validateStep = (): boolean => {
    const errs: FormErrors = {};
    if (activeStep === 0) {
      if (!form.name.trim()) errs.name = "Campaign name is required";
      if (!form.userId) errs.userId = "Please select an owner";
    }
    if (activeStep === 1) {
      if (
        form.senderEmail &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.senderEmail)
      ) {
        errs.senderEmail = "Invalid email address";
      }
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = (): void => {
    if (validateStep()) setActiveStep((s) => s + 1);
  };
  const handleBack = (): void => setActiveStep((s) => s - 1);

  const handleSubmit = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...form,
        totalRecipients: form.totalRecipients
          ? parseInt(form.totalRecipients, 10)
          : undefined,
        scheduledAt: form.scheduledAt || undefined,
      };
      await campaignApi.create(payload);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create campaign",
      );
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string): string =>
    name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const selectedUser: User | undefined = users.find(
    (u: User) => u.id === form.userId,
  );

  return (
    <Box sx={{ flex: 1, bgcolor: "background.default", p: 3 }}>
      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <IconButton
            onClick={() => navigate("/")}
            sx={{ bgcolor: "background.paper" }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Create Campaign
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set up a new campaign to engage your audience
            </Typography>
          </Box>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label: string) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper sx={{ p: 4, borderRadius: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {activeStep === 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Basic Information
              </Typography>

              <TextField
                label="Campaign Name *"
                value={form.name}
                onChange={handleChange("name")}
                error={!!fieldErrors.name}
                helperText={fieldErrors.name}
                fullWidth
              />

              <TextField
                label="Description"
                value={form.description}
                onChange={handleChange("description")}
                fullWidth
                multiline
                rows={3}
              />

              <FormControl fullWidth error={!!fieldErrors.userId}>
                <InputLabel>Campaign Owner *</InputLabel>
                <Select
                  value={form.userId}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, userId: e.target.value }));
                    setFieldErrors((fe) => ({ ...fe, userId: undefined }));
                  }}
                  label="Campaign Owner *"
                  renderValue={(id: string) => {
                    const u = users.find((u: User) => u.id === id);
                    if (!u) return "Select owner";
                    return (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          src={u.avatarUrl}
                          sx={{ width: 24, height: 24, fontSize: "0.65rem" }}
                        >
                          {getInitials(u.name)}
                        </Avatar>
                        <span>{u.name}</span>
                        <Chip
                          label={u.role}
                          size="small"
                          sx={{ height: 18, fontSize: "0.65rem" }}
                        />
                      </Box>
                    );
                  }}
                >
                  {users.map((u: User) => (
                    <MenuItem key={u.id} value={u.id}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          width: "100%",
                        }}
                      >
                        <Avatar
                          src={u.avatarUrl}
                          sx={{ width: 30, height: 30, fontSize: "0.7rem" }}
                        >
                          {getInitials(u.name)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {u.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {u.email}
                          </Typography>
                        </Box>
                        <Chip
                          label={u.role}
                          size="small"
                          sx={{ fontSize: "0.65rem" }}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {fieldErrors.userId && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.5, ml: 1.5 }}
                  >
                    {fieldErrors.userId}
                  </Typography>
                )}
              </FormControl>

              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Campaign Type</InputLabel>
                  <Select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        type: e.target.value as CampaignType,
                      }))
                    }
                    label="Campaign Type"
                  >
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="sms">SMS</MenuItem>
                    <MenuItem value="push">Push Notification</MenuItem>
                    <MenuItem value="in-app">In-App</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Triggered By</InputLabel>
                  <Select
                    value={form.triggeredBy}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        triggeredBy: e.target.value as TriggerType,
                      }))
                    }
                    label="Triggered By"
                  >
                    <MenuItem value="manual">Manual</MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="event">Event</MenuItem>
                    <MenuItem value="api">API</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  Tags
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                  {form.tags.map((tag: string) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      onDelete={() => removeTag(tag)}
                      deleteIcon={<Close />}
                    />
                  ))}
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTagInput(e.target.value)
                    }
                    onKeyDown={(e: React.KeyboardEvent) =>
                      e.key === "Enter" && addTag()
                    }
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={addTag}
                    startIcon={<Add />}
                  >
                    Add
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          {activeStep === 1 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Campaign Configuration
              </Typography>
              {form.type === "email" && (
                <TextField
                  label="Email Subject"
                  value={form.subject}
                  onChange={handleChange("subject")}
                  fullWidth
                />
              )}
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Sender Name"
                  value={form.senderName}
                  onChange={handleChange("senderName")}
                  fullWidth
                />
                <TextField
                  label="Sender Email"
                  value={form.senderEmail}
                  onChange={handleChange("senderEmail")}
                  error={!!fieldErrors.senderEmail}
                  helperText={fieldErrors.senderEmail}
                  fullWidth
                  type="email"
                />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Total Recipients"
                  value={form.totalRecipients}
                  onChange={handleChange("totalRecipients")}
                  type="number"
                  fullWidth
                  inputProps={{ min: 0 }}
                />
                {form.triggeredBy === "scheduled" && (
                  <TextField
                    label="Scheduled Date"
                    value={form.scheduledAt}
                    onChange={handleChange("scheduledAt")}
                    type="datetime-local"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              </Box>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                Review Campaign
              </Typography>
              {(
                [
                  ["Name", form.name],
                  [
                    "Owner",
                    selectedUser
                      ? `${selectedUser.name} (${selectedUser.role})`
                      : "—",
                  ],
                  ["Type", form.type],
                  ["Triggered By", form.triggeredBy],
                  ["Subject", form.subject || "—"],
                  ["Sender", form.senderName || "—"],
                  ["Recipients", form.totalRecipients || "0"],
                  ["Tags", form.tags.length > 0 ? form.tags.join(", ") : "—"],
                ] as [string, string][]
              ).map(([label, value]) => (
                <Box key={label}>
                  <Box sx={{ display: "flex", py: 1.5 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ width: 140, flexShrink: 0 }}
                    >
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {value}
                    </Typography>
                  </Box>
                  <Divider />
                </Box>
              ))}
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              variant="outlined"
              onClick={activeStep === 0 ? () => navigate("/") : handleBack}
            >
              {activeStep === 0 ? "Cancel" : "Back"}
            </Button>
            <Button
              variant="contained"
              onClick={activeStep < 2 ? handleNext : handleSubmit}
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={16} color="inherit" /> : null
              }
            >
              {activeStep < 2 ? "Continue" : "Create Campaign"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
