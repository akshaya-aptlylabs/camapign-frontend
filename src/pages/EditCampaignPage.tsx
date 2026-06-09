import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Divider,
} from "@mui/material";
import { Add, Close, ArrowBack } from "@mui/icons-material";
import { campaignApi } from "../services/api";
import {
  CampaignFormData,
  CampaignType,
  TriggerType,
  CampaignStatus,
  FormErrors,
} from "../types";

interface EditFormData extends CampaignFormData {
  status: CampaignStatus;
}

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<EditFormData | null>(null);
  const [tagInput, setTagInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!id) return;
    campaignApi
      .getById(id)
      .then((res) => {
        const c = res.data;
        setForm({
          name: c.name ?? "",
          description: c.description ?? "",
          type: c.type ?? "email",
          triggeredBy: c.triggeredBy ?? "manual",
          status: c.status ?? "draft",
          tags: c.tags ?? [],
          subject: c.subject ?? "",
          senderName: c.senderName ?? "",
          senderEmail: c.senderEmail ?? "",
          totalRecipients: String(c.totalRecipients ?? ""),
          scheduledAt: c.scheduledAt ?? "",
          userId: c.userId ?? "",
        });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange =
    (field: keyof EditFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => (f ? { ...f, [field]: e.target.value } : f));
      setFieldErrors((fe) => ({ ...fe, [field]: undefined }));
    };

  const addTag = (): void => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && form && !form.tags.includes(tag)) {
      setForm((f) => (f ? { ...f, tags: [...f.tags, tag] } : f));
    }
    setTagInput("");
  };

  const removeTag = (tag: string): void => {
    setForm((f) =>
      f ? { ...f, tags: f.tags.filter((t: string) => t !== tag) } : f,
    );
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form?.name.trim()) errs.name = "Campaign name is required";
    if (
      form?.senderEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.senderEmail)
    ) {
      errs.senderEmail = "Invalid email address";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (): Promise<void> => {
    if (!validate() || !form || !id) return;
    setSaving(true);
    setError(null);
    try {
      await campaignApi.update(id, {
        ...form,
        totalRecipients: form.totalRecipients
          ? parseInt(form.totalRecipients, 10)
          : undefined,
      });
      navigate(`/campaigns/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
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

  if (!form)
    return (
      <Box sx={{ p: 3, flex: 1, bgcolor: "background.default" }}>
        <Alert severity="error">{error || "Campaign not found"}</Alert>
      </Box>
    );

  return (
    <Box sx={{ flex: 1, bgcolor: "background.default", p: 3 }}>
      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <IconButton
            onClick={() => navigate(`/campaigns/${id}`)}
            sx={{ bgcolor: "background.paper" }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Edit Campaign
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update your campaign settings
            </Typography>
          </Box>
        </Box>

        <Paper sx={{ p: 4, borderRadius: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Campaign Information
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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

            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) =>
                      f
                        ? { ...f, status: e.target.value as CampaignStatus }
                        : f,
                    )
                  }
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) =>
                      f ? { ...f, type: e.target.value as CampaignType } : f,
                    )
                  }
                  label="Type"
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="sms">SMS</MenuItem>
                  <MenuItem value="push">Push Notification</MenuItem>
                  <MenuItem value="in-app">In-App</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Triggered By</InputLabel>
              <Select
                value={form.triggeredBy}
                onChange={(e) =>
                  setForm((f) =>
                    f
                      ? { ...f, triggeredBy: e.target.value as TriggerType }
                      : f,
                  )
                }
                label="Triggered By"
              >
                <MenuItem value="manual">Manual</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="event">Event</MenuItem>
                <MenuItem value="api">API</MenuItem>
              </Select>
            </FormControl>

            <Divider />
            <Typography variant="subtitle2" fontWeight={600}>
              Sender Configuration
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

            <TextField
              label="Total Recipients"
              value={form.totalRecipients}
              onChange={handleChange("totalRecipients")}
              type="number"
              fullWidth
              inputProps={{ min: 0 }}
            />

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
                <Button variant="outlined" onClick={addTag} startIcon={<Add />}>
                  Add
                </Button>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate(`/campaigns/${id}`)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={
                saving ? <CircularProgress size={16} color="inherit" /> : null
              }
            >
              Save Changes
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
