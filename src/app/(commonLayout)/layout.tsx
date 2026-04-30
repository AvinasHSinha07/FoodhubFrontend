import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import FoodBot from "@/components/shared/FoodBot";

export default function CommonLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <FoodBot />
    </>
  );
}
