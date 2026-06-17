import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-metro-bg font-sans text-metro-text">
      <Sidebar />
      <main className="flex flex-col flex-1 overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-metro-navy via-metro-primary to-metro-accent flex-shrink-0" />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
