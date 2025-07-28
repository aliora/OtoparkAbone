import { Car, Clock, MapPin, AlertTriangle } from "lucide-react";
import type { ParkingLocation } from "@shared/schema";

interface ParkingCardProps {
  location: ParkingLocation;
  isSelected: boolean;
  onSelect: () => void;
}

const getAvailabilityInfo = (availability: string) => {
  switch (availability) {
    case "available":
      return { text: "Müsait", className: "bg-green-100 text-green-800", showAlert: false };
    case "limited":
      return { text: "Sınırlı", className: "bg-yellow-100 text-yellow-800", showAlert: true };
    case "full":
      return { text: "Dolu", className: "bg-red-100 text-red-800", showAlert: true };
    default:
      return { text: "Müsait", className: "bg-green-100 text-green-800", showAlert: false };
  }
};

export default function ParkingCard({ location, isSelected, onSelect }: ParkingCardProps) {
  const availabilityInfo = getAvailabilityInfo(location.availability);

  const handleMapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = `${location.name}, ${location.address}`;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    if (confirm("Bu bağlantı sizi Google Maps'e yönlendirecektir. Devam etmek istiyor musunuz?")) {
      window.open(googleMapsUrl, '_blank');
    }
  };

  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col parking-card cursor-pointer relative ${
        isSelected ? "glow border-2 border-turkish-blue" : ""
      }`}
      onClick={onSelect}
    >
      {/* Alert indicator for full/limited parking */}
      {availabilityInfo.showAlert && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
          <AlertTriangle className="w-4 h-4" />
        </div>
      )}

      {/* Otopark Banner */}
      <div className="w-full h-24 mb-4 rounded-md overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-turkish-blue to-deep-navy flex items-center justify-center">
          <span className="text-white font-bold text-lg">İSTAY</span>
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-gray-800 mb-2">{location.name}</h3>
      <p className="text-gray-600 mb-4 flex-grow">
        <span className="block">
          <MapPin className="inline w-4 h-4 mr-2 text-turkish-blue" />
          {location.address}
        </span>
        <span className="block">
          <Car className="inline w-4 h-4 mr-2 text-turkish-blue" />
          Kapasite: {location.capacity} araç
        </span>
        <span className="block">
          <Clock className="inline w-4 h-4 mr-2 text-turkish-blue" />
          {location.operatingHours}
        </span>
      </p>
      
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3">
          <button
            className="relative bg-turkish-blue hover:bg-turkish-blue/90 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 group"
            title="₺299/ay"
          >
            Abone Ol
            {/* Desktop hover tooltip */}
            <div className="hidden md:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              ₺299/ay
            </div>
          </button>
          {/* Mobile price display */}
          <div className="md:hidden text-sm text-turkish-blue font-semibold">
            ₺299/ay
          </div>
        </div>
        <button
          onClick={handleMapClick}
          className="maps-icon"
          title="Haritada Göster"
        >
          <MapPin className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
