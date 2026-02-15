import { Outlet } from 'react-router-dom';

export default function CommonLayout() {
  return (
    <div>
        <div className=" bg-amber-500">
            common header
        </div>
        <main className="relative mx-auto max-w-20xl px-1 py-90">
            <Outlet />
        </main>
    </div>
  )
}