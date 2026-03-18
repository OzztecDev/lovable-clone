import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { getPlanFromPrice } from '@/lib/payments/utils';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { status, conversationId, paymentId, price, authCode, errorCode, errorMessage } = body;

    console.log('Iyzico webhook received:', body);

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Invalid webhook data' },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findFirst({
      where: { conversationId },
      include: { user: true },
    });

    if (!payment) {
      console.error('Payment not found for conversationId:', conversationId);
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (status === 'success' || status === 'SUCCESS') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          paymentId,
          iyzicoResponse: body,
        },
      });

      const plan = getPlanFromPrice(payment.amount);

      await prisma.user.update({
        where: { id: payment.userId },
        data: { plan },
      });

      await prisma.subscription.upsert({
        where: { userId: payment.userId },
        update: {
          plan,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          iyzicoSubscriptionId: paymentId,
        },
        create: {
          userId: payment.userId,
          plan,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          iyzicoSubscriptionId: paymentId,
        },
      });

      console.log('Payment successful for user:', payment.userId);
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          iyzicoResponse: body,
        },
      });

      console.error('Payment failed:', errorMessage || 'Unknown error');
    }

    return NextResponse.json(
      { status: 'ok' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Iyzico webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
