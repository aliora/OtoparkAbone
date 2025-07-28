import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Shield, Clock, Smartphone, Headset, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ParkingCard from "@/components/parking-card";
import SubscriptionForm from "@/components/subscription-form";
import SuccessModal from "@/components/success-modal";
import type { ParkingLocation } from "@shared/schema";

export default function SubscriptionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParkingId, setSelectedParkingId] = useState<string>("");
  const [showAllParkings, setShowAllParkings] = useState(false);
  const [successData, setSuccessData] = useState<{
    plan: string;
    planPrice: string;
    licensePlate: string;
  } | null>(null);

  const { data: parkingLocations = [], isLoading } = useQuery<ParkingLocation[]>({
    queryKey: ["/api/parking-locations"],
  });

  const filteredLocations = parkingLocations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedLocations = showAllParkings ? filteredLocations : filteredLocations.slice(0, 8);
  const remainingCount = filteredLocations.length - 8;

  const handleSubscriptionSuccess = (data: { plan: string; planPrice: string; licensePlate: string }) => {
    setSuccessData(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Main Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl lg:text-5xl font-bold text-turkish-blue mb-3">OTOPARKLAR</h2>
          </div>

          {/* Search Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-center mb-8">
              <div className="relative w-full max-w-md">
                <Input
                  type="text"
                  placeholder="Otopark Ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-5 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-turkish-blue focus:border-transparent pr-12"
                />
                <button className="absolute inset-y-0 right-0 flex items-center pr-3 text-turkish-blue hover:text-deep-navy transition duration-300">
                  <Search className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Left side - Parking Cards (3/4 width) */}
              <div className="lg:col-span-3">
                {/* Parking Cards Grid */}
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                        <div className="h-20 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-3"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6" id="parkingGarageContainer">
                    {displayedLocations.map((location) => (
                      <ParkingCard
                        key={location.id}
                        location={location}
                        isSelected={selectedParkingId === location.id}
                        onSelect={() => setSelectedParkingId(location.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Show More Button */}
                {!showAllParkings && remainingCount > 0 && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setShowAllParkings(true)}
                      className="aboneol-btn"
                    >
                      Daha Fazla Otopark Göster (+{remainingCount})
                    </button>
                  </div>
                )}
              </div>

              {/* Right side - Subscription Form (1/4 width) */}
              <div className="lg:col-span-1">
                {selectedParkingId && (
                  <SubscriptionForm 
                    selectedParkingId={selectedParkingId}
                    onSuccess={handleSubscriptionSuccess}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-deep-navy text-center mb-12">Neden İSTAY Park?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="w-16 h-16 text-turkish-blue mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-deep-navy mb-3">Güvenli Ödeme</h3>
              <p className="text-cool-gray">SSL sertifikası ile korunan güvenli ödeme altyapısı</p>
            </div>
            <div className="text-center">
              <Headset className="w-16 h-16 text-turkish-blue mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-deep-navy mb-3">7/24 Destek</h3>
              <p className="text-cool-gray">Her zaman yanınızda olan müşteri hizmetleri</p>
            </div>
            <div className="text-center">
              <MapPin className="w-16 h-16 text-turkish-blue mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-deep-navy mb-3">Geniş Ağ</h3>
              <p className="text-cool-gray">İstanbul'un her yerinde 25+ otopark lokasyonu</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Success Modal */}
      {successData && (
        <SuccessModal
          data={successData}
          onClose={() => setSuccessData(null)}
        />
      )}
    </div>
  );
}