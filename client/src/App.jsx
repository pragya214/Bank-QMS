import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerLandingPage from "./pages/customer/CustomerLandingPage";

import AuthPage from "./pages/AuthPage";
import DashboardHomePage from "./pages/DashboardHomePage";
import JoinQueuePage from "./pages/JoinQueuePage";
import QueueStatusPage from "./pages/QueueStatusPage";
import StaffPanelPage from "./pages/StaffPanelPage";
import DisplayBoardPage from "./pages/DisplayBoardPage";

import AdminOverviewPage from "./pages/AdminOverviewPage";
import BranchManagementPage from "./pages/BranchManagementPage";
import ServiceManagementPage from "./pages/ServiceManagementPage";
import CounterManagementPage from "./pages/CounterManagementPage";
import ProfilePage from "./pages/ProfilePage";
import AuditLogsPage from "./pages/AuditLogsPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />

        <Route path="/customer" element={<CustomerLandingPage />} />
        <Route path="/customer/join-queue" element={<JoinQueuePage />} />
        <Route path="/customer/token-status" element={<QueueStatusPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardHomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="join-queue"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <JoinQueuePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="queue-status"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <QueueStatusPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="staff-panel"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <StaffPanelPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="display-board"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff", "display"]}>
                <DisplayBoardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin-panel/overview"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminOverviewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin-panel/branches"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <BranchManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin-panel/services"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ServiceManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin-panel/counters"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CounterManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin-panel/audit-logs"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="settings"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="profile"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff", "display"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;