import React, { useState, ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, Box } from "@mui/material";
import Sidebar from "./components/SideBar";

import DashboardPage from "./pages/DashboardPage";
import CreateCampaignPage from "./pages/CreateCampaignPage";
import CampaignDetailPage from "./pages/CampaignDetailPage";
import EditCampaignPage from "./pages/EditCampaignPage";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  const childrenWithProps = React.Children.map(children, (child) =>
    React.isValidElement(child)
      ? React.cloneElement(child, { activeUserId } as Record<string, unknown>)
      : child,
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar onUserFilter={setActiveUserId} activeUserId={activeUserId} />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        {childrenWithProps}
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <>
      <CssBaseline />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/campaigns" element={<DashboardPage />} />
            <Route path="/campaigns/new" element={<CreateCampaignPage />} />
            <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
            <Route path="/campaigns/:id/edit" element={<EditCampaignPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </>
  );
}
