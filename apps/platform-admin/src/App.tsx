import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import LoginPage from "./features/auth/LoginPage";
import ProjectManagementPage from "./features/projects/ProjectManagementPage";
import ReportsPage from "./features/reports/ReportsPage";
import RolesPermissionsPage from "./features/roles/RolesPermissionsPage";
import UsersPage from "./features/users/UsersPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import SettingsPage from "./features/settings/SettingsPage";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider> 
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/project-management" element={<ProjectManagementPage />} />
            <Route path="/projects" element={<ProjectManagementPage />} />
            <Route path="/roles-permissions" element={<RolesPermissionsPage />} />
            <Route path="/reports-analytics" element={<ReportsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/appearance" element={<SettingsPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
