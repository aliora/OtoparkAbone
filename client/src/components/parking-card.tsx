import { Car, Clock } from "lucide-react";
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

  return (
    <div
      className={`border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer ${
        isSelected
          ? "border-2 border-turkish-blue ring-2 ring-turkish-blue ring-opacity-20"
          : "border-gray-200 hover:border-turkish-blue"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-deep-navy text-sm leading-tight">{location.name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${availabilityInfo.className}`}>
          {availabilityInfo.text}
        </span>
      </div>
      <p className="text-sm text-cool-gray mb-3 line-clamp-2">{location.address}</p>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-turkish-blue" />
          <span>{location.capacity} araç kapasitesi</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-turkish-blue" />
          <span>{location.operatingHours}</span>
        </div>
      </div>
    </div>
  );
}
