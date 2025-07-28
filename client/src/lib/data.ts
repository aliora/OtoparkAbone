export const PLAN_PRICES = {
  monthly: { price: 29900, period: "/ay" },
  quarterly: { price: 80900, originalPrice: 89700, period: "" },
  yearly: { price: 269300, originalPrice: 358800, period: "" },
};

export const formatPrice = (price: number) => `₺${(price / 100).toLocaleString('tr-TR')}`;
