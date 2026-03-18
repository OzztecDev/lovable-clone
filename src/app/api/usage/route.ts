import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { getPlanFeatures } from '@/lib/utils';

export async function GET(request: NextRequest) {
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

    const planFeatures = getPlanFeatures(user.plan);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const dailyUsage = await prisma.usageLog.count({
      where: {
        userId: user.id,
        createdAt: { gte: today },
        action: 'generate',
      },
    });

    const monthlyUsage = await prisma.usageLog.aggregate({
      where: {
        userId: user.id,
        createdAt: { gte: monthStart },
      },
      _sum: {
        totalTokens: true,
      },
    });

    const dailyLimit = planFeatures.generationsPerDay;
    const monthlyLimit = planFeatures.monthlyTokens;
    const dailyRemaining = Math.max(0, dailyLimit - dailyUsage);
    const monthlyRemaining = Math.max(0, monthlyLimit - (monthlyUsage._sum.totalTokens || 0));

    return NextResponse.json(
      {
        success: true,
        usage: {
          daily: {
            used: dailyUsage,
            limit: dailyLimit,
            remaining: dailyRemaining,
          },
          monthly: {
            used: monthlyUsage._sum.totalTokens || 0,
            limit: monthlyLimit,
            remaining: monthlyRemaining,
          },
          plan: user.plan,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get usage error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
