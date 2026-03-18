import type { Plan } from '@/types/auth';

export interface PlanDetails {
  name: string;
  price: number;
  billingCycle: string;
  features: string[];
  limits: {
    generationsPerDay: number;
    monthlyTokens: number;
  };
  iyzicoPricingPlanCode: string;
}

export const PLANS: Record<Plan, PlanDetails> = {
  FREE: {
    name: 'Free',
    price: 0,
    billingCycle: 'N/A',
    features: [
      '5 AI generations per day',
      'Access to free models',
      'Basic project templates',
      'Community support',
      '1 concurrent project',
    ],
    limits: {
      generationsPerDay: 5,
      monthlyTokens: 10000,
    },
    iyzicoPricingPlanCode: '',
  },
  PRO: {
    name: 'Pro',
    price: 29,
    billingCycle: 'monthly',
    features: [
      '50 AI generations per day',
      'Access to Gemini & all OpenRouter models',
      'Advanced project templates',
      'Priority email support',
      '5 concurrent projects',
      'Export to Vercel/Netlify',
      'Custom domain support',
    ],
    limits: {
      generationsPerDay: 50,
      monthlyTokens: 100000,
    },
    iyzicoPricingPlanCode: process.env.IYZICO_PRO_PLAN_CODE || 'pro-monthly',
  },
  PREMIUM: {
    name: 'Premium',
    price: 99,
    billingCycle: 'monthly',
    features: [
      'Unlimited AI generations',
      'Priority access to new models',
      'All Pro features',
      'Priority support',
      'Unlimited concurrent projects',
      'API access',
      'White-label option',
      'Custom integrations',
    ],
    limits: {
      generationsPerDay: Infinity,
      monthlyTokens: Infinity,
    },
    iyzicoPricingPlanCode: process.env.IYZICO_PREMIUM_PLAN_CODE || 'premium-monthly',
  },
};

export function getPlanDetails(plan: Plan): PlanDetails {
  return PLANS[plan] || PLANS.FREE;
}

export function getPlanFromPrice(price: number): Plan {
  if (price === 0) return 'FREE';
  if (price <= 29) return 'PRO';
  return 'PREMIUM';
}

export function calculateDiscount(originalPrice: number, discount: number): number {
  return originalPrice - (originalPrice * discount) / 100;
}

export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
