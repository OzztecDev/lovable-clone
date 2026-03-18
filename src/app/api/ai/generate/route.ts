import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { createAIEngine } from '@/lib/ai';
import { promptSchema } from '@/lib/validators';
import { ZodError } from 'zod';
import { getPlanFeatures } from '@/lib/utils';
import type { Plan } from '@/types/auth';

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
    const validatedData = promptSchema.parse(body);

    const planFeatures = getPlanFeatures(user.plan);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyUsage = await prisma.usageLog.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: today,
        },
        action: 'generate',
      },
    });

    if (dailyUsage >= planFeatures.generationsPerDay) {
      return NextResponse.json(
        { 
          error: 'Daily limit exceeded',
          limit: planFeatures.generationsPerDay,
          used: dailyUsage,
          plan: user.plan,
        },
        { status: 429 }
      );
    }

    const aiEngine = createAIEngine(user.plan as Plan);

    const response = await aiEngine.generate({
      prompt: validatedData.content,
      model: validatedData.model,
      systemPrompt: 'You are an expert full-stack developer. Generate clean, production-ready code based on user requirements. Return code in a structured format with file paths and contents.',
    });

    await prisma.prompt.create({
      data: {
        userId: user.id,
        projectId: validatedData.projectId || null,
        content: validatedData.content,
        response: response.content,
        model: response.model,
        inputTokens: response.tokens.input,
        outputTokens: response.tokens.output,
        totalTokens: response.tokens.total,
        status: 'completed',
      },
    });

    await prisma.usageLog.create({
      data: {
        userId: user.id,
        action: 'generate',
        model: response.model,
        inputTokens: response.tokens.input,
        outputTokens: response.tokens.output,
        totalTokens: response.tokens.total,
        cost: response.cost,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        dailyRequestCount: dailyUsage + 1,
        monthlyTokenCount: user.monthlyTokenCount + response.tokens.total,
      },
    });

    return NextResponse.json(
      {
        success: true,
        content: response.content,
        model: response.model,
        tokens: response.tokens,
        cost: response.cost,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('AI Generate error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
