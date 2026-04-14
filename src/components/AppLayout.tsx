import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import SideBar from "./SideBar";
import { useUserFilter } from "../context";

export default function AppLayout() {
  const { activeUserId, setActiveUserId } = useUserFilter();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <SideBar onUserFilter={setActiveUserId} activeUserId={activeUserId} />

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          minWidth: 0,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
