import { Routes, Route } from 'react-router-dom';
import CommonLayout from './components/ui/common/layout';
import { Navigate } from 'react-router-dom';
import Login from './pages/login';

export default function App() {
  return (
    <Routes>
      <Route element={<CommonLayout />}>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<div>404 not found</div>} />
      </Route>
    </Routes>
  );
}