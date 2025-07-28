export default function Footer() {
  return (
    <footer className="bg-deep-navy text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-turkish-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">İ</span>
              </div>
              <span className="text-2xl font-bold tracking-wider">İSTAY</span>
            </div>
            <p className="text-gray-300 text-sm">
              İstanbul'un akıllı otopark sistemleri. Güvenli, hızlı ve kolay park çözümleri.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Hızlı Bağlantılar</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-gray-300 hover:text-turkish-blue transition duration-300">Anasayfa</a></li>
              <li><a href="/otoparklarimiz" className="text-gray-300 hover:text-turkish-blue transition duration-300">Otoparklarımız</a></li>
              <li><a href="/borc-sorgula" className="text-gray-300 hover:text-turkish-blue transition duration-300">Borç Sorgula</a></li>
              <li><a href="/yardim" className="text-gray-300 hover:text-turkish-blue transition duration-300">Yardım</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Hizmetler</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-turkish-blue transition duration-300">Aylık Abonelik</a></li>
              <li><a href="#" className="text-gray-300 hover:text-turkish-blue transition duration-300">Günlük Park</a></li>
              <li><a href="#" className="text-gray-300 hover:text-turkish-blue transition duration-300">Kurumsal Çözümler</a></li>
              <li><a href="#" className="text-gray-300 hover:text-turkish-blue transition duration-300">Mobil Uygulama</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">İletişim</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>📧 info@istaypark.com</li>
              <li>📞 0212 444 4567</li>
              <li>📍 İstanbul, Türkiye</li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 İSTAY Park. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}