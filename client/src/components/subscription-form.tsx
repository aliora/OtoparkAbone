import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSubscriptionSchema } from "@shared/schema";
import type { InsertSubscription } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

interface SubscriptionFormProps {
  selectedParkingId: string;
  onSuccess: (data: { plan: string; planPrice: string; licensePlate: string }) => void;
}

type Plan = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  isPopular?: boolean;
};

const plans: Plan[] = [
  { id: "monthly", name: "Aylık Plan", description: "Esnek kullanım", price: 29900 },
  { id: "quarterly", name: "3 Aylık Plan", description: "%10 indirim", price: 80900, originalPrice: 89700 },
  { id: "yearly", name: "Yıllık Plan", description: "%25 indirim", price: 269300, originalPrice: 358800, isPopular: true },
];

const formatPrice = (price: number) => `₺${(price / 100).toLocaleString('tr-TR')}`;

export default function SubscriptionForm({ selectedParkingId, onSuccess }: SubscriptionFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [subscriptionId, setSubscriptionId] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
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
      plan: "",
      planPrice: 0,
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
      setCurrentStep(3);
      toast({
        title: "SMS Gönderildi",
        description: "Doğrulama kodu telefon numaranıza gönderildi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Abonelik oluşturulurken hata oluştu",
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
      const selectedPlanData = plans.find(p => p.id === selectedPlan);
      onSuccess({
        plan: selectedPlanData?.name || "",
        planPrice: selectedPlanData ? formatPrice(selectedPlanData.price) : "",
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
      const response = await apiRequest("POST", `/api/subscriptions/${id}/resend-code`, {});
      return response.json();
    },
    onSuccess: () => {
      setResendCountdown(60);
      const interval = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      toast({
        title: "Kod Gönderildi",
        description: "Yeni doğrulama kodu gönderildi.",
      });
    },
  });

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      form.setValue("plan", planId);
      form.setValue("planPrice", plan.price);
    }
  };

  const handleStep2Submit = (data: InsertSubscription) => {
    if (!selectedPlan) {
      toast({
        title: "Uyarı",
        description: "Lütfen bir plan seçin",
        variant: "destructive",
      });
      return;
    }
    createSubscriptionMutation.mutate(data);
  };

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

  const StepIndicator = ({ step, title, isActive, isCompleted }: { step: number; title: string; isActive: boolean; isCompleted: boolean }) => (
    <div className="flex items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
        isActive || isCompleted ? 'bg-turkish-blue text-white' : 'bg-gray-300 text-gray-600'
      }`}>
        {step}
      </div>
      <span className={`ml-2 text-sm font-medium ${isActive ? 'text-deep-navy' : 'text-gray-600'}`}>
        {title}
      </span>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
      <h2 className="text-xl font-bold text-deep-navy mb-6">Abonelik Bilgileri</h2>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        <StepIndicator step={1} title="Plan Seç" isActive={currentStep === 1} isCompleted={currentStep > 1} />
        <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
        <StepIndicator step={2} title="Bilgiler" isActive={currentStep === 2} isCompleted={currentStep > 2} />
        <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
        <StepIndicator step={3} title="Doğrula" isActive={currentStep === 3} isCompleted={false} />
      </div>

      {/* Step 1: Plan Selection */}
      {currentStep === 1 && (
        <div>
          <h3 className="text-lg font-semibold text-deep-navy mb-4">Abonelik Planını Seçin</h3>
          
          <div className="space-y-4 mb-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors relative ${
                  selectedPlan === plan.id
                    ? "border-2 border-turkish-blue bg-turkish-blue bg-opacity-5"
                    : "border border-gray-300 hover:border-turkish-blue"
                }`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {plan.isPopular && (
                  <div className="absolute -top-2 right-4 bg-turkish-red text-white text-xs px-2 py-1 rounded-full">
                    En Popüler
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-deep-navy">{plan.name}</h4>
                    <p className="text-sm text-cool-gray">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${selectedPlan === plan.id ? 'text-turkish-blue' : 'text-deep-navy'}`}>
                      {formatPrice(plan.price)}
                    </div>
                    {plan.originalPrice && (
                      <div className="text-sm text-cool-gray line-through">
                        {formatPrice(plan.originalPrice)}
                      </div>
                    )}
                    {plan.id === "monthly" && (
                      <div className="text-sm text-cool-gray">/ay</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={() => {
              if (!selectedPlan) {
                toast({
                  title: "Uyarı",
                  description: "Lütfen bir plan seçin",
                  variant: "destructive",
                });
                return;
              }
              setCurrentStep(2);
            }}
            className="w-full bg-turkish-blue hover:bg-turkish-blue/90 text-white font-semibold"
          >
            Devam Et
          </Button>
        </div>
      )}

      {/* Step 2: Personal Information Form */}
      {currentStep === 2 && (
        <div>
          <h3 className="text-lg font-semibold text-deep-navy mb-4">Kişisel Bilgiler</h3>
          
          <form onSubmit={form.handleSubmit(handleStep2Submit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Ad</Label>
                <Input
                  id="firstName"
                  {...form.register("firstName")}
                  placeholder="Adınız"
                />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Soyad</Label>
                <Input
                  id="lastName"
                  {...form.register("lastName")}
                  placeholder="Soyadınız"
                />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="ornek@email.com"
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
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="licensePlate">Plaka Numarası</Label>
              <Input
                id="licensePlate"
                {...form.register("licensePlate")}
                placeholder="34 ABC 123"
              />
              <p className="text-xs text-cool-gray mt-1">Türkiye plaka formatında giriniz</p>
              {form.formState.errors.licensePlate && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.licensePlate.message}</p>
              )}
            </div>

            {/* Credit Card Information */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-deep-navy mb-4">Ödeme Bilgileri</h4>
              
              <div>
                <Label htmlFor="cardNumber">Kart Numarası</Label>
                <Input
                  id="cardNumber"
                  {...form.register("cardNumber")}
                  placeholder="1234 5678 9012 3456"
                />
                {form.formState.errors.cardNumber && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.cardNumber.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="expiryDate">Son Kullanma</Label>
                  <Input
                    id="expiryDate"
                    {...form.register("expiryDate")}
                    placeholder="MM/YY"
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
                  />
                  {form.formState.errors.cvv && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.cvv.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="cardHolder">Kart Sahibi Adı</Label>
                <Input
                  id="cardHolder"
                  {...form.register("cardHolder")}
                  placeholder="Kart üzerindeki isim"
                />
                {form.formState.errors.cardHolder && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.cardHolder.message}</p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3 mt-6">
              <Checkbox
                id="terms"
                checked={form.watch("acceptTerms")}
                onCheckedChange={(checked) => form.setValue("acceptTerms", !!checked)}
              />
              <Label htmlFor="terms" className="text-sm text-cool-gray">
                <a href="#" className="text-turkish-blue hover:underline">Kullanım Şartları</a> ve 
                <a href="#" className="text-turkish-blue hover:underline"> Gizlilik Politikası</a>'nı okudum ve kabul ediyorum.
              </Label>
            </div>
            {form.formState.errors.acceptTerms && (
              <p className="text-sm text-red-600">{form.formState.errors.acceptTerms.message}</p>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="flex-1 border-turkish-blue text-turkish-blue hover:bg-turkish-blue hover:text-white"
              >
                Geri
              </Button>
              <Button
                type="submit"
                disabled={createSubscriptionMutation.isPending}
                className="flex-1 bg-turkish-blue hover:bg-turkish-blue/90 text-white font-semibold"
              >
                {createSubscriptionMutation.isPending ? "Gönderiliyor..." : "SMS Doğrulama"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: SMS Verification */}
      {currentStep === 3 && (
        <div>
          <h3 className="text-lg font-semibold text-deep-navy mb-4">SMS Doğrulama</h3>
          
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
              onClick={() => setCurrentStep(2)}
              className="flex-1 border-turkish-blue text-turkish-blue hover:bg-turkish-blue hover:text-white"
            >
              Geri
            </Button>
            <Button
              onClick={handleVerification}
              disabled={verifyCodeMutation.isPending}
              className="flex-1 bg-turkish-blue hover:bg-turkish-blue/90 text-white font-semibold"
            >
              {verifyCodeMutation.isPending ? "Doğrulanıyor..." : "Aboneliği Tamamla"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
