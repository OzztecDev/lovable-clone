import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('demo123', 12);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@lovable.dev' },
    update: {},
    create: {
      email: 'demo@lovable.dev',
      name: 'Demo User',
      password: hashedPassword,
      plan: 'PRO',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created demo user:', demoUser.email);

  const sampleProject = await prisma.project.upsert({
    where: { id: 'sample-project-1' },
    update: {},
    create: {
      id: 'sample-project-1',
      userId: demoUser.id,
      name: 'Sample React App',
      description: 'A modern React application built with TypeScript',
      status: 'COMPLETED',
      framework: 'react',
      styling: 'tailwind',
      files: JSON.stringify([
        {
          name: 'App.tsx',
          path: '/src/App.tsx',
          content: `import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
      <header className="p-6">
        <h1 className="text-4xl font-bold text-white">
          Welcome to Your App
        </h1>
      </header>
      <main className="p-6">
        <p className="text-gray-300">
          Your React app is ready!
        </p>
      </main>
    </div>
  );
}

export default App;`,
        },
      ]),
    },
  });

  await prisma.prompt.create({
    data: {
      userId: demoUser.id,
      projectId: sampleProject.id,
      content: 'Create a modern React app with a beautiful gradient background',
      response: 'Generated a React app with Tailwind CSS styling',
      model: 'gemini-pro',
      inputTokens: 150,
      outputTokens: 300,
      totalTokens: 450,
      status: 'completed',
    },
  });

  console.log('✅ Created sample project:', sampleProject.name);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
