import HomeSummaryPageClient from "@/components/modules/Home/HomeSummaryPageClient";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import FoodBot from "@/components/shared/FoodBot";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HomeSummaryPageClient />
      </main>
      <Footer />
      <FoodBot />
    </div>
  );
}
