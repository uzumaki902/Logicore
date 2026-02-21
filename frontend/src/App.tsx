import { Routes, Route } from "react-router-dom";
import CommonLayout from "./components/common/layout";
import { Navigate } from "react-router-dom";
import Login from "./pages/login";
import Support from "./pages/support";
import OrgSetup from "./pages/org-setup";
import Dashboard from "./pages/dashboard";
import { AuthGate } from "./context/auth";

export default function App() {
  return (
    <Routes>
      <Route element={<CommonLayout />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/org-setup"
          element={
            <AuthGate>
              <OrgSetup />
            </AuthGate>
          }
        />
        <Route
          path="/support"
          element={
            <AuthGate>
              <Support />
            </AuthGate>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AuthGate>
              <Dashboard />
            </AuthGate>
          }
        />
        <Route path="*" element={<div>404 not found.</div>} />
      </Route>
    </Routes>
  );
}
