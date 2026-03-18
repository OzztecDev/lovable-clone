'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const PLANS = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for trying out',
    icon: Sparkles,
    features: [
      '5 AI generations per day',
      'Access to free models',
      'Basic project templates',
      'Community support',
      '1 concurrent project',
    ],
    cta: 'Get Started',
    href: '/register',
  },
  {
    name: 'Pro',
    price: 29,
    description: 'For professional developers',
    icon: Zap,
    popular: true,
    features: [
      '50 AI generations per day',
      'Access to Gemini & all OpenRouter models',
      'Advanced project templates',
      'Priority email support',
      '5 concurrent projects',
      'Export to Vercel/Netlify',
      'Custom domain support',
    ],
    cta: 'Start Pro Trial',
    href: '/register?plan=pro',
  },
  {
    name: 'Premium',
    price: 99,
    description: 'For teams and agencies',
    icon: Crown,
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
    cta: 'Contact Sales',
    href: '/contact',
  },
];

export default function PricingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const handleSelectPlan = (planName: string, href: string) => {
    if (planName === 'Free') {
      router.push(href);
    } else {
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(href)}`);
      } else {
        router.push(href);
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Lovable Clone</span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <Link href="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = user?.plan?.toLowerCase() === plan.name.toLowerCase();

              return (
                <Card
                  key={plan.name}
                  className={cn(
                    'relative',
                    plan.popular && 'border-primary shadow-lg shadow-primary/20 scale-105'
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-6 w-6 text-primary" />
                      <CardTitle>{plan.name}</CardTitle>
                      {isCurrentPlan && (
                        <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                          Current Plan
                        </span>
                      )}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      {plan.price > 0 && (
                        <span className="text-muted-foreground">/month</span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-5 w-5 text-green-500 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                      disabled={isCurrentPlan}
                      onClick={() => handleSelectPlan(plan.name, plan.href)}
                    >
                      {isCurrentPlan ? 'Current Plan' : plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              {[
                {
                  q: 'Can I change plans later?',
                  a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit cards through our secure payment partner Iyzico.',
                },
                {
                  q: 'Is there a free trial for Pro?',
                  a: 'Yes! Start with the Free plan and upgrade when you need more generations.',
                },
                {
                  q: 'What happens if I exceed my daily limit?',
                  a: 'You\'ll need to wait until the next day or upgrade to a higher plan for more generations.',
                },
                {
                  q: 'Can I cancel anytime?',
                  a: 'Yes, you can cancel your subscription at any time. No questions asked.',
                },
              ].map((faq, index) => (
                <div key={index} className="border-b pb-6">
                  <h3 className="font-medium mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
