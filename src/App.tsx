import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { UserFilterProvider } from "./context/UserfilterContext";
import { AppLayout } from "./components";
import {
  ROOT_PATH,
  CAMPAIGN_PATH,
  MESSAGE_PATH,
  CAMPAIGN_ROUTES,
  EVENT_PATH,
  EVENT_ROUTES,
  MESSAGE_ROUTES,
} from "./router";

import {
  DashboardPage,
  CreateCampaignPage,
  CampaignDetailPage,
  EditCampaignPage,
  // 👇 uncomment when ready
  // EventsPage,
  // EventDetailPage,
  // MessagesPage,
} from "./pages";

export default function App() {
  return (
    <>
      <CssBaseline />

      <UserFilterProvider>
        {" "}
        {/* ✅ REQUIRED */}
        <BrowserRouter>
          <Routes>
            <Route path={ROOT_PATH} element={<Navigate to={CAMPAIGN_PATH} />} />

            <Route element={<AppLayout />}>
              <Route path={CAMPAIGN_PATH}>
                <Route index element={<DashboardPage />} />
                <Route path="new" element={<CreateCampaignPage />} />
                <Route path=":id" element={<CampaignDetailPage />} />
                <Route path=":id/edit" element={<EditCampaignPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </UserFilterProvider>
    </>
  );
}
