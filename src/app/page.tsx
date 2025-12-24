// 文件路径: src/app/page.tsx
'use client';

import { useState, DragEvent, ChangeEvent, useEffect } from 'react';
import { UploadCloud, Copy, AlertCircle, Check, Zap, FileCode, ArrowRight, Loader2, Sparkles, FileText, Clipboard } from 'lucide-react';

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
      if (file) setError('Only .yaml or .yml files are allowed.');
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
    // 验证逻辑：根据模式检查对应的内容
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
      
      // 简单的格式校验
      if (!finalContent.trim()) throw new Error("Content cannot be empty.");

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain', 'X-Custom-Key': customKey },
        body: finalContent,
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create link.');
      setResult(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred.');
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
    <main className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* 动态背景光晕 */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      <div className="glass-panel w-full max-w-[480px] rounded-3xl p-8 relative z-10 transition-all duration-500">
        
        {/* 头部 */}
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 mb-2 shadow-inner">
            <Sparkles className="w-6 h-6 text-white/80" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white text-glow">Clash Hub</h1>
          <p className="text-zinc-500 text-sm">Secure config hosting & distribution</p>
        </div>

        {/* 核心表单 */}
        <div className="space-y-5">
          
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 pl-1">Alias Key</label>
            <div className="relative group">
              <input
                type="text"
                value={customKey}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomKey(e.target.value)}
                placeholder="personal-macbook"
                className="glass-input w-full px-4 py-3 rounded-xl pl-10 font-mono text-sm"
              />
              <Zap className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-600 group-focus-within:text-cyan-400 transition-colors" />
            </div>
          </div>

          {/* 模式切换 Tab */}
          <div className="bg-zinc-900/50 p-1 rounded-xl flex gap-1 border border-white/5">
            <button
              onClick={() => { setUploadMode('file'); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${uploadMode === 'file' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <FileText className="w-3.5 h-3.5" /> File Upload
            </button>
            <button
              onClick={() => { setUploadMode('text'); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${uploadMode === 'text' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Clipboard className="w-3.5 h-3.5" /> Paste Text
            </button>
          </div>

          {/* 根据模式显示不同的输入区域 */}
          {uploadMode === 'file' ? (
            <div
              onDragEnter={(e) => handleDrag(e, true)}
              onDragLeave={(e) => handleDrag(e, false)}
              onDragOver={(e) => handleDrag(e, true)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
              className={`
                relative group cursor-pointer border-2 border-dashed rounded-2xl h-40
                flex flex-col items-center justify-center gap-2 transition-all duration-300
                ${isDragging || selectedFile 
                  ? 'border-cyan-500/30 bg-cyan-500/5' 
                  : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'}
              `}
            >
              <input id="file-upload" type="file" className="hidden" accept=".yaml,.yml" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
              
              {selectedFile ? (
                <>
                  <div className="p-2 bg-cyan-500/10 rounded-full text-cyan-400 animate-bounce">
                    <FileCode className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-zinc-300 max-w-[80%] truncate">{selectedFile.name}</p>
                  <p className="text-xs text-zinc-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </>
              ) : (
                <>
                  <div className="p-2 bg-zinc-800 rounded-full text-zinc-500 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-zinc-500">Drag config file here</p>
                </>
              )}
            </div>
          ) : (
             <div className="relative group">
                <textarea
                  value={pastedContent}
                  onChange={(e) => setPastedContent(e.target.value)}
                  placeholder="Paste your YAML config content here..."
                  className="glass-input w-full px-4 py-3 rounded-xl font-mono text-xs h-40 resize-none"
                  spellCheck={false}
                />
             </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!customKey || (uploadMode === 'file' ? !selectedFile : !pastedContent) || isLoading}
            className={`
              w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300
              flex items-center justify-center gap-2
              ${(!customKey || (uploadMode === 'file' ? !selectedFile : !pastedContent))
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-white text-black hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-[0.98]'
              }
            `}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Link <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>

        {/* 结果显示 */}
        <div className={`mt-6 transition-all duration-500 ${result || error ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none absolute'}`}>
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/10 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {result && (
            <div className="relative overflow-hidden rounded-xl bg-black/40 border border-white/5 p-1">
               {/* 扫描线动画 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-scanline pointer-events-none" />
              
              <div className="flex items-center gap-2 p-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                <span className="text-xs font-medium text-emerald-500">Active</span>
              </div>
              
              <div className="flex items-center gap-2 bg-black/40 rounded-lg p-2 mx-1 mb-1 border border-white/5">
                <code className="text-[11px] font-mono text-zinc-400 flex-1 truncate select-all">{result}</code>
                <button 
                  onClick={() => copyToClipboard(result)}
                  className={`p-1.5 rounded-md transition-colors ${isCopied ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-white/10 text-zinc-500'}`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
      
      <div className="absolute bottom-6 text-[10px] text-zinc-700 font-mono tracking-widest opacity-50">
        V 2.1 • DUAL INPUT
      </div>
    </main>
  );
}
