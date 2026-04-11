import HomeSummaryPageClient from "@/components/modules/Home/HomeSummaryPageClient";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HomeSummaryPageClient />
        </div>
      </main>
      <Footer />
    </div>
  );
}
