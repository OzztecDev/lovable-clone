import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Lovable Clone - AI-Powered Project Generation',
  description: 'Generate, edit, and deploy projects using AI prompts. Powered by Google Gemini and OpenRouter.',
  keywords: ['AI', 'code generation', 'project builder', 'React', 'Next.js', 'Gemini', 'OpenRouter'],
  authors: [{ name: 'Lovable Clone' }],
  openGraph: {
    title: 'Lovable Clone - AI-Powered Project Generation',
    description: 'Generate, edit, and deploy projects using AI prompts',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
