import { Outlet } from 'react-router-dom';

export default function CommonLayout() {
  return (
    <div className="min-h-screen flex flex-col">
        <header className="bg-amber-500">
            common header
        </header>
        <main className="flex-1 w-full flex flex-col min-h-0">
            <Outlet />
        </main>
    </div>
  )
}