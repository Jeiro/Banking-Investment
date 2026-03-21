import DashboardSidebar from "@/components/dashboard/Sidebar"
import DashboardTopBar from "@/components/dashboard/TopBar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <DashboardTopBar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}