import Link from "next/link";
import { Truck, Mail, MapPin, Phone } from "lucide-react";
import { FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="relative mt-24 bg-[#0F172A] pt-20 pb-10 overflow-hidden text-slate-300">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-[#ED6A5E] to-transparent opacity-50" />
      <div className="absolute -top-[200px] -right-[200px] h-[400px] w-[400px] rounded-full bg-[#377771] blur-[150px] opacity-20 pointer-events-none" />
      <div className="absolute -bottom-[200px] -left-[200px] h-[400px] w-[400px] rounded-full bg-[#ED6A5E] blur-[150px] opacity-10 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand Identity */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#ED6A5E] to-[#FF8E72] text-white shadow-lg shadow-[#ED6A5E]/20">
                <Truck className="h-6 w-6" />
              </span>
              <span className="text-3xl font-extrabold tracking-tight text-white">
                FoodHub
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Elevating the food delivery experience. Premium meals from top restaurants delivered with care and speed.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-[#377771] hover:text-white transition-colors duration-300">
                <FaInstagram className="h-4 w-4" />
              </Link>
              <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-[#377771] hover:text-white transition-colors duration-300">
                <FaTwitter className="h-4 w-4" />
              </Link>
              <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-[#377771] hover:text-white transition-colors duration-300">
                <FaFacebook className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Quick Links</h3>
            <ul className="flex flex-col gap-4 text-sm">
              <li><Link href="/meals" className="hover:text-[#FFAF87] transition-colors flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[#ED6A5E]" /> Explore Meals</Link></li>
              <li><Link href="/restaurants" className="hover:text-[#FFAF87] transition-colors flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[#ED6A5E]" /> Top Restaurants</Link></li>
              <li><Link href="/about" className="hover:text-[#FFAF87] transition-colors flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[#ED6A5E]" /> About Us</Link></li>
              <li><Link href="/contact" className="hover:text-[#FFAF87] transition-colors flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[#ED6A5E]" /> Contact Us</Link></li>
              <li><Link href="/help" className="hover:text-[#FFAF87] transition-colors flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[#ED6A5E]" /> Help & Support</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-6">Contact</h3>
            <ul className="flex flex-col gap-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#4CE0B3] shrink-0" />
                <span>123 Culinary Boulevard,<br/>Food District, FD 10024</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#4CE0B3] shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#4CE0B3] shrink-0" />
                <span>support@foodhub.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-6">Stay Updated</h3>
            <p className="text-sm text-slate-400 mb-4">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form className="flex flex-col gap-3">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-slate-800/50 border-slate-700 text-white rounded-[16px] focus-visible:ring-[#ED6A5E] placeholder:text-slate-500 h-11"
              />
              <Button className="w-full bg-[#ED6A5E] hover:bg-[#FF8E72] text-white rounded-[14px] h-11 shadow-lg shadow-[#ED6A5E]/20 transition-all hover:-translate-y-0.5 font-semibold">
                Subscribe
              </Button>
            </form>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} FoodHub. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
