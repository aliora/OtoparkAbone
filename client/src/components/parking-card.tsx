import { Car, Clock, MapPin } from "lucide-react";
import type { ParkingLocation } from "@shared/schema";

interface ParkingCardProps {
  location: ParkingLocation;
  isSelected: boolean;
  onSelect: () => void;
}

const getAvailabilityInfo = (availability: string) => {
  switch (availability) {
    case "available":
      return { text: "Müsait", className: "bg-green-100 text-green-800" };
    case "limited":
      return { text: "Sınırlı", className: "bg-yellow-100 text-yellow-800" };
    case "full":
      return { text: "Dolu", className: "bg-red-100 text-red-800" };
    default:
      return { text: "Müsait", className: "bg-green-100 text-green-800" };
  }
};

export default function ParkingCard({ location, isSelected, onSelect }: ParkingCardProps) {
  const availabilityInfo = getAvailabilityInfo(location.availability);

  const handleMapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Mock coordinates for demo - in real app you'd have actual coordinates
    const query = `${location.name}, ${location.address}`;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    if (confirm("Bu bağlantı sizi Google Maps'e yönlendirecektir. Devam etmek istiyor musunuz?")) {
      window.open(googleMapsUrl, '_blank');
    }
  };

  return (
    <div
      className={`bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col parking-card cursor-pointer ${
        isSelected ? "glow border-2 border-turkish-blue" : ""
      }`}
      onClick={onSelect}
    >
      {/* Otopark Banner */}
      <div className="w-full h-20 mb-4 rounded-md overflow-hidden bg-gradient-to-r from-turkish-blue to-deep-navy flex items-center justify-center">
        <span className="text-white font-bold text-lg">İSTAY</span>
      </div>
      
      <h3 className="text-lg font-bold text-gray-800 mb-2">{location.name}</h3>
      <div className="text-gray-600 mb-4 flex-grow space-y-1">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-turkish-blue mt-0.5 flex-shrink-0" />
          <span className="text-sm">{location.address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-turkish-blue" />
          <span className="text-sm">Kapasite: {location.capacity} araç</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-turkish-blue" />
          <span className="text-sm">{location.operatingHours}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-auto">
        <span className={`text-xs px-2 py-1 rounded-full ${availabilityInfo.className}`}>
          {availabilityInfo.text}
        </span>
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
