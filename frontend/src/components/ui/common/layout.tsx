import { Outlet } from "react-router-dom";

export default function CommonLayout() {
  return (
    <div>
      <header className="border-b border-slate-200 bg-white/70 px-6 py-3 backdrop-blur md:px-10">
        <p className="text-sm font-medium text-slate-700">Logicore</p>
      </header>
      <Outlet />
    </div>
  );
}
