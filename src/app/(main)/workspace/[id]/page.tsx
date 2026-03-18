'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useAI } from '@/hooks/useAI';
import { Sparkles, Loader2, Download, Copy, Check, File, Folder, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
}

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { generate, isLoading: isGenerating, response, error } = useAI();
  
  const [project, setProject] = useState<any>(null);
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [activeTab, setActiveTab] = useState('prompt');
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && resolvedParams.id) {
      fetchProject();
    }
  }, [user, resolvedParams.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${resolvedParams.id}`);
      const data = await response.json();
      
      if (data.project) {
        setProject(data.project);
        const projectFiles = data.project.files || [];
        setFiles(projectFiles);
        if (projectFiles.length > 0) {
          setSelectedFile(projectFiles[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return;

    const result = await generate(prompt, resolvedParams.id);

    if (result.success) {
      const codeBlock = extractCodeBlocks(result.content || '');
      
      const newFiles: ProjectFile[] = codeBlock.map((code, index) => ({
        id: `file-${Date.now()}-${index}`,
        name: code.filename || `file-${index}.tsx`,
        path: code.path || `/${code.filename || `file-${index}.tsx`}`,
        content: code.content,
      }));

      setFiles(newFiles);
      if (newFiles.length > 0) {
        setSelectedFile(newFiles[0]);
      }
      
      await updateProject({ files: newFiles, status: 'COMPLETED' });
      setActiveTab('files');
    }
  };

  const extractCodeBlocks = (content: string): Array<{ filename: string; path: string; content: string }> => {
    const codeBlocks: Array<{ filename: string; path: string; content: string }> = [];
    
    const regex = /```(\w+)?\s*(?:\/\/\s*(?:file:?\s*)?([^\n]+))?\n([\s\S]*?)```/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const filename = match[2] || `component.${getExtension(match[1])}`;
      codeBlocks.push({
        filename,
        path: `/src/${filename}`,
        content: match[3].trim(),
      });
    }

    if (codeBlocks.length === 0 && content.trim()) {
      codeBlocks.push({
        filename: 'App.tsx',
        path: '/src/App.tsx',
        content,
      });
    }

    return codeBlocks;
  };

  const getExtension = (lang: string): string => {
    const extensions: Record<string, string> = {
      tsx: 'tsx',
      ts: 'ts',
      jsx: 'jsx',
      js: 'js',
      css: 'css',
      json: 'json',
    };
    return extensions[lang] || 'tsx';
  };

  const updateProject = async (updates: any) => {
    try {
      await fetch(`/api/projects/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleFileContentChange = (content: string) => {
    if (!selectedFile) return;
    
    const updatedFiles = files.map(f =>
      f.id === selectedFile.id ? { ...f, content } : f
    );
    setFiles(updatedFiles);
    setSelectedFile({ ...selectedFile, content });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateProject({ files });
    setTimeout(() => setIsSaving(false), 1000);
  };

  const copyToClipboard = async () => {
    if (!selectedFile) return;
    await navigator.clipboard.writeText(selectedFile.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadFile = () => {
    if (!selectedFile) return;
    
    const blob = new Blob([selectedFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold">{project?.name || 'Loading...'}</h1>
              <p className="text-xs text-muted-foreground">
                {files.length} files • {project?.framework || 'React'} • {project?.styling || 'Tailwind'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File Tree */}
        <div className="w-64 border-r bg-muted/30 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-medium text-sm">Files</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors',
                  selectedFile?.id === file.id && 'bg-accent'
                )}
              >
                <File className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{file.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b px-4 py-2 flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="prompt">Prompt</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              {selectedFile && activeTab === 'files' && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={downloadFile}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="prompt" className="h-full m-0 p-4">
                <div className="max-w-4xl mx-auto">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Describe Your Project
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="Create a modern React dashboard with authentication, charts, and a responsive design..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-[200px]"
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Be specific for better results
                        </p>
                        <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
                          {isGenerating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate Code
                            </>
                          )}
                        </Button>
                      </div>
                      {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                          {error}
                        </div>
                      )}
                      {response && (
                        <div className="bg-green-500/10 text-green-500 text-sm p-3 rounded-md">
                          Code generated successfully! Check the Files tab.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="files" className="h-full m-0">
                {selectedFile ? (
                  <MonacoEditor
                    height="100%"
                    language={getLanguage(selectedFile.name)}
                    value={selectedFile.content}
                    onChange={(value) => handleFileContentChange(value || '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Folder className="h-12 w-12 mx-auto mb-4" />
                      <p>No files yet</p>
                      <p className="text-sm">Generate code to create files</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="preview" className="h-full m-0">
                <div className="h-full flex items-center justify-center bg-muted/50">
                  <div className="text-center">
                    <p className="text-muted-foreground">Preview will be available soon</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Deploy your project to see it live
                    </p>
                    <Button className="mt-4" variant="outline">
                      Deploy Project
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const languages: Record<string, string> = {
    tsx: 'typescript',
    ts: 'typescript',
    jsx: 'javascript',
    js: 'javascript',
    css: 'css',
    scss: 'scss',
    json: 'json',
    html: 'html',
  };
  return languages[ext || ''] || 'typescript';
}
