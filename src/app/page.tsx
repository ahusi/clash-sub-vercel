// 文件路径: src/app/page.tsx
'use client';

import { useState, DragEvent, ChangeEvent, useEffect } from 'react';
import { FileText, Type, ArrowRight, Loader2, Check, Copy, AlertCircle, UploadCloud } from 'lucide-react';

export default function HomePage() {
  const [customKey, setCustomKey] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedContent, setPastedContent] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (file: File | null) => {
    if (file && (file.name.endsWith('.yaml') || file.name.endsWith('.yml'))) {
      setSelectedFile(file);
      setError(null);
    } else {
      setSelectedFile(null);
      if (file) setError('Please upload a valid .yaml configuration file.');
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>, status: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(status);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    handleDrag(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    const contentToUpload = uploadMode === 'file' ? selectedFile : pastedContent;
    if (!customKey || !contentToUpload) return;
    
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      let finalContent = '';
      if (uploadMode === 'file' && selectedFile) {
        finalContent = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsText(selectedFile);
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = (e) => reject(e);
        });
      } else {
        finalContent = pastedContent;
      }
      
      if (!finalContent.trim()) throw new Error("Content is empty.");

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain', 'X-Custom-Key': customKey },
        body: finalContent,
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Deployment failed.');
      setResult(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-8 bg-[#FAFAFA]">
      
      {/* 极简背景装饰：大尺寸柔光，不干扰视线 */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-gradient-to-tr from-emerald-50/50 to-teal-50/50 rounded-full blur-[120px]" />
      </div>

      {/* 主容器：宽幅、大气 */}
      <div className="relative z-10 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* 标题区：巨大、自信 */}
        <div className="mb-12 text-center sm:text-left">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-zinc-900 tracking-tight mb-4">
            Clash<span className="text-zinc-300">Hub</span>
          </h1>
          <p className="text-lg text-zinc-500 max-w-lg leading-relaxed">
            Your personal, secure configuration distribution center. 
            <br className="hidden sm:block" />
            Simple, persistent, and fast.
          </p>
        </div>

        {/* 核心卡片：极简白 */}
        <div className="horizon-card rounded-[32px] p-8 sm:p-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* 左侧：输入区域 */}
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-zinc-900 block">1. Set Alias</label>
                <input
                  type="text"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="e.g. my-iphone-pro"
                  className="horizon-input w-full h-14 px-6 rounded-2xl text-lg"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-zinc-900 flex justify-between items-center">
                  <span>2. Choose Source</span>
                  <div className="flex bg-zinc-100 rounded-lg p-1 gap-1">
                    <button 
                      onClick={() => setUploadMode('file')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${uploadMode === 'file' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                      File
                    </button>
                    <button 
                      onClick={() => setUploadMode('text')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${uploadMode === 'text' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                      Text
                    </button>
                  </div>
                </label>
                
                <div className="h-40">
                  {uploadMode === 'file' ? (
                    <div
                      onDragEnter={(e) => handleDrag(e, true)}
                      onDragLeave={(e) => handleDrag(e, false)}
                      onDragOver={(e) => handleDrag(e, true)}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className={`
                        w-full h-full rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3
                        ${isDragging || selectedFile 
                          ? 'border-zinc-400 bg-zinc-50' 
                          : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50'}
                      `}
                    >
                      <input id="file-upload" type="file" className="hidden" accept=".yaml,.yml" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                      {selectedFile ? (
                        <>
                          <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-medium text-zinc-900 max-w-[80%] truncate">{selectedFile.name}</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 text-zinc-300" />
                          <span className="text-sm text-zinc-400 font-medium">Drop config file here</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <textarea
                      value={pastedContent}
                      onChange={(e) => setPastedContent(e.target.value)}
                      placeholder="Paste configuration content..."
                      className="horizon-input w-full h-full p-4 rounded-2xl resize-none font-mono text-xs leading-relaxed"
                      spellCheck={false}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 右侧：动作与结果 */}
            <div className="flex flex-col justify-between space-y-8 md:border-l md:border-zinc-100 md:pl-12">
              
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-900">Summary</h3>
                <div className="text-sm text-zinc-500 space-y-2">
                  <div className="flex justify-between">
                    <span>Key Status</span>
                    <span className={customKey ? "text-emerald-500 font-medium" : "text-zinc-300"}>
                      {customKey ? "Valid" : "Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Content</span>
                    <span className={(uploadMode === 'file' && selectedFile) || (uploadMode === 'text' && pastedContent) ? "text-emerald-500 font-medium" : "text-zinc-300"}>
                      {uploadMode === 'file' && selectedFile ? "File Selected" : uploadMode === 'text' && pastedContent ? "Text Ready" : "Empty"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {result ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between gap-3 group">
                      <code className="text-xs font-mono text-zinc-600 truncate flex-1">{result}</code>
                      <button 
                        onClick={() => copyToClipboard(result)}
                        className="p-2 bg-white border border-zinc-200 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-sm"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-600" />}
                      </button>
                    </div>
                    <p className="text-center text-xs text-emerald-600 font-medium">✨ Link ready to use</p>
                  </div>
                ) : (
                  error && (
                    <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      {error}
                    </div>
                  )
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!customKey || (uploadMode === 'file' ? !selectedFile : !pastedContent) || isLoading}
                  className={`
                    w-full h-16 rounded-2xl font-bold text-lg flex items-center justify-center gap-3
                    ${!customKey || (uploadMode === 'file' ? !selectedFile : !pastedContent)
                      ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
                      : 'horizon-btn-primary'
                    }
                  `}
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Deploy Config <ArrowRight className="w-6 h-6" /></>}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}