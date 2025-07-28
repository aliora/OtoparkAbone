import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSubscriptionSchema, type InsertSubscription } from "@shared/schema";

interface SubscriptionFormProps {
  selectedParkingId: string;
  onSuccess: (data: { plan: string; planPrice: string; licensePlate: string }) => void;
}

export default function SubscriptionForm({ selectedParkingId, onSuccess }: SubscriptionFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [subscriptionId, setSubscriptionId] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertSubscription>({
    resolver: zodResolver(insertSubscriptionSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      licensePlate: "",
      cardNumber: "",
      cardHolder: "",
      expiryDate: "",
      cvv: "",
      plan: "monthly",
      planPrice: 29900,
      parkingLocationId: selectedParkingId,
      acceptTerms: false,
    },
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (data: InsertSubscription) => {
      const response = await apiRequest("POST", "/api/subscriptions", data);
      return response.json();
    },
    onSuccess: (data) => {
      setSubscriptionId(data.id);
      setShowSMSModal(true);
      toast({
        title: "SMS Gönderildi",
        description: "Telefon numaranıza doğrulama kodu gönderildi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Abonelik oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async ({ id, code }: { id: string; code: string }) => {
      const response = await apiRequest("POST", `/api/subscriptions/${id}/verify`, { code });
      return response.json();
    },
    onSuccess: (data) => {
      onSuccess({
        plan: "Aylık Plan",
        planPrice: "₺299",
        licensePlate: form.getValues("licensePlate"),
      });
      toast({
        title: "Başarılı!",
        description: "Aboneliğiniz başarıyla oluşturuldu.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Doğrulama kodu geçersiz",
        variant: "destructive",
      });
    },
  });

  const resendCodeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/subscriptions/${id}/resend`);
      return response.json();
    },
    onSuccess: () => {
      setResendCountdown(60);
      toast({
        title: "SMS Gönderildi",
        description: "Yeni doğrulama kodu gönderildi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "SMS gönderilemedi",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleVerification = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Uyarı",
        description: "Lütfen 6 haneli doğrulama kodunu girin",
        variant: "destructive",
      });
      return;
    }
    verifyCodeMutation.mutate({ id: subscriptionId, code: verificationCode });
  };

  const handleSubmit = () => {
    const data = form.getValues();
    if (!data.acceptTerms) {
      toast({
        title: "Uyarı",
        description: "Lütfen kullanım şartlarını kabul edin",
        variant: "destructive",
      });
      return;
    }
    createSubscriptionMutation.mutate(data);
  };

  return (
    <>
      <div className="max-w-md mx-auto space-y-6">
        {/* Step 1: License Plate */}
        <div className={`bg-white rounded-lg shadow-lg p-6 transition-all duration-700 transform ${
          currentStep >= 1 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          <h3 className="text-xl font-bold text-deep-navy mb-6">1. Plaka Bilgisi</h3>
          <div className="mb-4">
            <Label htmlFor="licensePlate">Plaka Numarası</Label>
            <Input
              id="licensePlate"
              {...form.register("licensePlate")}
              placeholder="34 ABC 123"
              className="text-center font-mono text-lg"
            />
            {form.formState.errors.licensePlate && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.licensePlate.message}</p>
            )}
          </div>
          <div className="mb-4">
            <Label htmlFor="firstName">Ad Soyad</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                id="firstName"
                {...form.register("firstName")}
                placeholder="Ad"
              />
              <Input
                id="lastName"
                {...form.register("lastName")}
                placeholder="Soyad"
              />
            </div>
            {(form.formState.errors.firstName || form.formState.errors.lastName) && (
              <p className="text-sm text-red-600 mt-1">Ad ve soyad gerekli</p>
            )}
          </div>
          <div className="mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Seçilen Otopark</div>
              <div className="text-lg font-bold text-deep-navy">Otopark #{selectedParkingId}</div>
              <div className="text-sm text-gray-600 mt-2">Aylık Tarife</div>
              <div className="text-xl font-bold text-turkish-blue">₺299</div>
            </div>
          </div>
          <Button
            onClick={() => {
              const licensePlate = form.getValues("licensePlate");
              const firstName = form.getValues("firstName");
              const lastName = form.getValues("lastName");
              
              if (!licensePlate || !firstName || !lastName) {
                toast({
                  title: "Uyarı",
                  description: "Lütfen tüm alanları doldurun",
                  variant: "destructive",
                });
                return;
              }
              setCurrentStep(2);
            }}
            className="w-full bg-turkish-blue hover:bg-turkish-blue/90 text-white font-semibold"
            disabled={currentStep > 1}
          >
            {currentStep > 1 ? "✓ Tamamlandı" : "Devam Et"}
          </Button>
        </div>

        {/* Step 2: Contact Information */}
        <div className={`bg-white rounded-lg shadow-lg p-6 transition-all duration-700 transform ${
          currentStep >= 2 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`} style={{ transitionDelay: currentStep >= 2 ? '300ms' : '0ms' }}>
          <h3 className="text-xl font-bold text-deep-navy mb-6">2. İletişim Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="ornek@email.com"
                disabled={currentStep < 2}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="+90 5XX XXX XX XX"
                disabled={currentStep < 2}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.phone.message}</p>
              )}
            </div>
          </div>
          <Button
            onClick={() => {
              const email = form.getValues("email");
              const phone = form.getValues("phone");
              
              if (!email || !phone) {
                toast({
                  title: "Uyarı",
                  description: "Lütfen tüm alanları doldurun",
                  variant: "destructive",
                });
                return;
              }
              setCurrentStep(3);
            }}
            className="w-full mt-4 bg-turkish-blue hover:bg-turkish-blue/90 text-white font-semibold"
            disabled={currentStep < 2 || currentStep > 2}
          >
            {currentStep > 2 ? "✓ Tamamlandı" : currentStep < 2 ? "Bekliyor..." : "Devam Et"}
          </Button>
        </div>

        {/* Step 3: Payment Information */}
        <div className={`bg-white rounded-lg shadow-lg p-6 transition-all duration-700 transform ${
          currentStep >= 3 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`} style={{ transitionDelay: currentStep >= 3 ? '600ms' : '0ms' }}>
          <h3 className="text-xl font-bold text-deep-navy mb-6">3. Ödeme Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Kart Numarası</Label>
              <Input
                id="cardNumber"
                {...form.register("cardNumber")}
                placeholder="1234 5678 9012 3456"
                disabled={currentStep < 3}
              />
              {form.formState.errors.cardNumber && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.cardNumber.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Son Kullanma</Label>
                <Input
                  id="expiryDate"
                  {...form.register("expiryDate")}
                  placeholder="MM/YY"
                  disabled={currentStep < 3}
                />
                {form.formState.errors.expiryDate && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.expiryDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  {...form.register("cvv")}
                  placeholder="123"
                  maxLength={3}
                  disabled={currentStep < 3}
                />
                {form.formState.errors.cvv && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.cvv.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="cardHolder">Kart Sahibi Adı</Label>
              <Input
                id="cardHolder"
                {...form.register("cardHolder")}
                placeholder="Kart üzerindeki isim"
                disabled={currentStep < 3}
              />
              {form.formState.errors.cardHolder && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.cardHolder.message}</p>
              )}
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={form.watch("acceptTerms")}
                onCheckedChange={(checked) => form.setValue("acceptTerms", !!checked)}
                disabled={currentStep < 3}
              />
              <Label htmlFor="terms" className="text-sm text-cool-gray">
                <a href="#" className="text-turkish-blue hover:underline">Kullanım Şartları</a> ve 
                <a href="#" className="text-turkish-blue hover:underline"> Gizlilik Politikası</a>'nı okudum ve kabul ediyorum.
              </Label>
            </div>
            {form.formState.errors.acceptTerms && (
              <p className="text-sm text-red-600">{form.formState.errors.acceptTerms.message}</p>
            )}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={createSubscriptionMutation.isPending || currentStep < 3}
            className="w-full mt-4 bg-turkish-blue hover:bg-turkish-blue/90 text-white font-semibold"
          >
            {createSubscriptionMutation.isPending ? "Gönderiliyor..." : currentStep < 3 ? "Bekliyor..." : "SMS Doğrulama"}
          </Button>
        </div>
      </div>

      {/* SMS Verification Modal */}
      {showSMSModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-deep-navy mb-4">SMS Doğrulama</h3>
            
            <div className="text-center mb-6">
              <Smartphone className="w-12 h-12 text-turkish-blue mx-auto mb-4" />
              <p className="text-cool-gray mb-2">
                {form.getValues("phone")} numarasına doğrulama kodu gönderildi.
              </p>
            </div>

            <div className="mb-6">
              <Label htmlFor="verificationCode">Doğrulama Kodu</Label>
              <Input
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="text-center text-2xl font-mono tracking-widest"
                maxLength={6}
              />
            </div>

            <div className="text-center mb-6">
              <p className="text-sm text-cool-gray mb-2">Kod gelmedi mi?</p>
              <Button
                variant="link"
                onClick={() => resendCodeMutation.mutate(subscriptionId)}
                disabled={resendCountdown > 0 || resendCodeMutation.isPending}
                className="text-turkish-blue p-0 h-auto"
              >
                Yeniden Gönder {resendCountdown > 0 && `(${resendCountdown}s)`}
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSMSModal(false)}
                className="flex-1 border-turkish-blue text-turkish-blue hover:bg-turkish-blue hover:text-white"
              >
                İptal
              </Button>
              <Button
                onClick={handleVerification}
                disabled={verifyCodeMutation.isPending || verificationCode.length !== 6}
                className="flex-1 bg-turkish-blue hover:bg-turkish-blue/90 text-white font-semibold"
              >
                {verifyCodeMutation.isPending ? "Doğrulanıyor..." : "Doğrula"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}