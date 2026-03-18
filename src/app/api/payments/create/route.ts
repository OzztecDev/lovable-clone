import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { createCheckoutForm } from '@/lib/payments/iyzico';
import { getPlanDetails, getPlanFromPrice } from '@/lib/payments/utils';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { plan, billingCycle = 'monthly' } = body;

    if (!['PRO', 'PREMIUM'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    const planDetails = getPlanDetails(plan);
    const price = planDetails.price;
    const basketId = crypto.randomUUID();

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: price,
        currency: 'USD',
        status: 'PENDING',
        plan: plan as any,
        conversationId: basketId,
      },
    });

    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/iyzico`;

    const checkoutForm = await createCheckoutForm({
      price: price.toString(),
      paidPrice: price.toString(),
      currency: 'USD',
      basketId,
      customer: {
        name: user.name?.split(' ')[0] || 'Customer',
        surname: user.name?.split(' ').slice(1).join(' ') || 'User',
        email: user.email,
        gsmNumber: '+1234567890',
      },
      billingAddress: {
        contactName: user.name || 'Customer',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Default Address',
        zipCode: '34000',
      },
      shippingAddress: {
        contactName: user.name || 'Customer',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Default Address',
        zipCode: '34000',
      },
      installment: '1',
      callbackUrl,
    });

    return NextResponse.json(
      {
        success: true,
        checkoutFormToken: checkoutForm.token,
        checkoutFormContent: checkoutForm.checkoutFormContent,
        paymentPageUrl: checkoutForm.paymentPageUrl,
        paymentId: payment.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
