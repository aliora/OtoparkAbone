import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Shield, Clock, Smartphone, Headset, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
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

  const displayedLocations = showAllParkings ? filteredLocations : filteredLocations.slice(0, 6);
  const remainingCount = filteredLocations.length - 6;

  const handleSubscriptionSuccess = (data: { plan: string; planPrice: string; licensePlate: string }) => {
    setSuccessData(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-deep-navy mb-4">
            İstay Park'a Abone Ol
          </h1>
          <p className="text-xl text-cool-gray mb-8">
            İstanbul'un en güvenilir otopark ağında yerinizi ayırın
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-cool-gray">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-turkish-blue" />
              <span>Güvenli Ödeme</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-turkish-blue" />
              <span>7/24 Hizmet</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-turkish-blue" />
              <span>SMS Bilgilendirme</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Parking Locations */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-deep-navy mb-6">Otopark Lokasyonları</h2>
              
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Otopark ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cool-gray w-4 h-4" />
                </div>
              </div>

              {/* Parking Cards Grid */}
              {isLoading ? (
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-3"></div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4 mb-6">
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
                <button
                  onClick={() => setShowAllParkings(true)}
                  className="w-full py-3 text-turkish-blue border border-turkish-blue rounded-lg hover:bg-turkish-blue hover:text-white transition-colors"
                >
                  Daha Fazla Otopark Göster (+{remainingCount})
                </button>
              )}
            </div>
          </div>

          {/* Right Side - Subscription Form */}
          <div className="lg:col-span-1">
            <SubscriptionForm 
              selectedParkingId={selectedParkingId}
              onSuccess={handleSubscriptionSuccess}
            />
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-deep-navy text-center mb-8">Neden İstay Park?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="w-12 h-12 text-turkish-blue mx-auto mb-4" />
              <h3 className="font-semibold text-deep-navy mb-2">Güvenli Ödeme</h3>
              <p className="text-cool-gray">SSL sertifikası ile korunan güvenli ödeme altyapısı</p>
            </div>
            <div className="text-center">
              <Headset className="w-12 h-12 text-turkish-blue mx-auto mb-4" />
              <h3 className="font-semibold text-deep-navy mb-2">7/24 Destek</h3>
              <p className="text-cool-gray">Her zaman yanınızda olan müşteri hizmetleri</p>
            </div>
            <div className="text-center">
              <MapPin className="w-12 h-12 text-turkish-blue mx-auto mb-4" />
              <h3 className="font-semibold text-deep-navy mb-2">Geniş Ağ</h3>
              <p className="text-cool-gray">İstanbul'un her yerinde 23+ otopark lokasyonu</p>
            </div>
          </div>
        </div>
      </div>

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
