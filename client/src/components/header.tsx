import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-deep-navy text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        <a href="/" className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-turkish-blue rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">İ</span>
          </div>
          <span className="text-2xl font-bold tracking-wider text-white">
            İSTAY
          </span>
        </a>

        <nav className="hidden md:flex space-x-6">
          <a href="/" className="text-white hover:text-turkish-blue transition duration-300 font-medium">ANASAYFA</a>
          <a href="/otoparklarimiz" className="text-white hover:text-turkish-blue transition duration-300 font-medium">OTOPARKLARIMIZ</a>
          <a href="/borc-sorgula" className="text-white hover:text-turkish-blue transition duration-300 font-medium">BORÇ SORGULA</a>
          <a href="/yardim" className="text-white hover:text-turkish-blue transition duration-300 font-medium">YARDIM</a>
        </nav>
        
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-white"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
      </div>
      
      {mobileMenuOpen && (
        <div className="bg-deep-navy md:hidden">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-4">
            <a href="/" className="text-white hover:text-turkish-blue transition duration-300 font-medium">ANASAYFA</a>
            <a href="/otoparklarimiz" className="text-white hover:text-turkish-blue transition duration-300 font-medium">OTOPARKLARIMIZ</a>
            <a href="/borc-sorgula" className="text-white hover:text-turkish-blue transition duration-300 font-medium">BORÇ SORGULA</a>
            <a href="/yardim" className="text-white hover:text-turkish-blue transition duration-300 font-medium">YARDIM</a>
          </div>
        </div>
      )}
    </header>
  );
}