export type Plan = 'FREE' | 'PRO' | 'PREMIUM';

export interface Subscription {
  id: string;
  userId: string;
  plan: Plan;
  status: string;
  startDate: Date;
  endDate: Date | null;
  autoRenew: boolean;
  iyzicoSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  plan: Plan;
  paymentId?: string;
  conversationId?: string;
  createdAt: Date;
}

export interface UsageStats {
  dailyRequests: number;
  dailyLimit: number;
  monthlyTokens: number;
  monthlyLimit: number;
  requestsRemaining: number;
  tokensRemaining: number;
}

export interface PlanLimits {
  generationsPerDay: number;
  monthlyTokens: number;
  maxProjects: number;
  maxFileSize: number;
}
