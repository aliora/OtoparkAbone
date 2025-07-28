import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
  data: {
    plan: string;
    planPrice: string;
    licensePlate: string;
  };
  onClose: () => void;
}

export default function SuccessModal({ data, onClose }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-semibold text-deep-navy mb-2">Tebrikler!</h3>
        <p className="text-cool-gray mb-6">İstay Park aboneliğiniz başarıyla oluşturuldu. Hoş geldiniz!</p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-semibold text-deep-navy mb-2">Abonelik Detayları</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Plan:</span>
              <span>{data.plan}</span>
            </div>
            <div className="flex justify-between">
              <span>Ücret:</span>
              <span>{data.planPrice}</span>
            </div>
            <div className="flex justify-between">
              <span>Plaka:</span>
              <span>{data.licensePlate}</span>
            </div>
            <div className="flex justify-between">
              <span>Başlangıç:</span>
              <span>Bugün</span>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={onClose}
          className="w-full bg-turkish-blue hover:bg-turkish-blue/90"
        >
          Anladım
        </Button>
      </div>
    </div>
  );
}
