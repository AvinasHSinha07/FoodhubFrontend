import React from "react"
import DashboardSidebar from "@/components/modules/Dashboard/DashboardSidebar"
import DashboardNavbar from "@/components/modules/Dashboard/DashboardNavbar"
import FoodBot from "@/components/shared/FoodBot"

const DashboardLayout = ({children} : {children: React.ReactNode}) => {
  return (
    <div className="flex min-h-screen bg-background text-foreground relative">
        {/* Dashboard Sidebar */}
        <DashboardSidebar />

        <div className="flex flex-1 flex-col min-w-0">
            {/* DashboardNavbar */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
               <DashboardNavbar />
            </div>
            {/* Dashboard Content */}
            <main className="flex-1 bg-muted/20 p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {children}
                </div>
            </main>
        </div>

        {/* AI Assistant - available globally in dashboard */}
        <FoodBot />
    </div>
  )
}

export default DashboardLayout
