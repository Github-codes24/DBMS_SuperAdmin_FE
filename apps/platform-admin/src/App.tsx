import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import RolesPermissionsPage from './features/roles/RolesPermissionsPage';
import UsersPage from './features/users/UsersPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/roles-permissions" element={<RolesPermissionsPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
