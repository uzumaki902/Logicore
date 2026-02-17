import { Routes, Route } from "react-router-dom";
import CommonLayout from "./components/common/layout";
import { Navigate } from "react-router-dom";
import Login from "./pages/login";
import Support from "./pages/support";

export default function App() {
  return (
    <Routes>
      <Route element={<CommonLayout />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/support" element={<Support />} />
        <Route path="*" element={<div>404 not found</div>} />
      </Route>
    </Routes>
  );
}
