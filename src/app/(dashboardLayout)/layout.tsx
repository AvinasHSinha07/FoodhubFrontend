import React from "react"
import DashboardSidebar from "@/components/modules/Dashboard/DashboardSidebar"
import DashboardNavbar from "@/components/modules/Dashboard/DashboardNavbar"

const DashboardLayout = ({children} : {children: React.ReactNode}) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
        {/* Dashboard Sidebar */}
        <DashboardSidebar />

        <div className="flex flex-1 flex-col overflow-hidden">
            {/* DashboardNavbar */}
            <DashboardNavbar />
            {/* Dashboard Content */}
            <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {children}
                </div>
            </main>
        </div>
    </div>
  )
}

export default DashboardLayout
