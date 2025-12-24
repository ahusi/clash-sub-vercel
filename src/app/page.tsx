// 文件路径: src/app/page.tsx
'use client';

import { useState, DragEvent, ChangeEvent, useEffect } from 'react';
import { FileText, Clipboard, UploadCloud, ArrowRight, Loader2, Check, Copy, AlertCircle, FileCode, Zap } from 'lucide-react';

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
      if (file) setError('Only .yaml or .yml files are supported.');
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
    <main className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-white">
      
      {/* 极简大气背景光斑 */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px] animate-float-slow"></div>
         <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-indigo-50/60 rounded-full blur-[100px] animate-float-slow animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* 标题区：极简 */}
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">
            Clash Hub
          </h1>
          <p className="text-zinc-500 text-base font-normal">
            Effortless configuration hosting.
          </p>
        </div>

        {/* 主卡片：纯净磨砂 */}
        <div className="clean-glass rounded-[32px] p-2">
          <div className="bg-white/50 rounded-[24px] p-6 sm:p-8 space-y-6">
            
            {/* Alias 输入 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Configuration Alias</label>
              <div className="relative">
                <input
                  type="text"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="e.g. macbook-pro-2025"
                  className="clean-input w-full px-4 py-4 rounded-2xl pl-11 text-base"
                />
                <Zap className="absolute left-4 top-4 w-5 h-5 text-zinc-400" />
              </div>
            </div>

            {/* 模式切换 */}
            <div className="bg-zinc-100/80 p-1.5 rounded-2xl flex gap-1">
              <button
                onClick={() => { setUploadMode('file'); setError(null); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
                  ${uploadMode === 'file' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:bg-white/50'}`}
              >
                <FileText className="w-4 h-4" /> Upload File
              </button>
              <button
                onClick={() => { setUploadMode('text'); setError(null); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
                  ${uploadMode === 'text' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:bg-white/50'}`}
              >
                <Clipboard className="w-4 h-4" /> Paste Text
              </button>
            </div>

            {/* 内容输入区 */}
            <div className="transition-all duration-300">
              {uploadMode === 'file' ? (
                <div
                  onDragEnter={(e) => handleDrag(e, true)}
                  onDragLeave={(e) => handleDrag(e, false)}
                  onDragOver={(e) => handleDrag(e, true)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className={`
                    group cursor-pointer border-2 border-dashed rounded-2xl h-48
                    flex flex-col items-center justify-center gap-4 transition-all duration-200
                    ${isDragging || selectedFile 
                      ? 'border-blue-500/30 bg-blue-50/30' 
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50'}
                  `}
                >
                  <input id="file-upload" type="file" className="hidden" accept=".yaml,.yml" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                  
                  {selectedFile ? (
                    <div className="text-center space-y-2 animate-in zoom-in-95 duration-200">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                        <FileCode className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{selectedFile.name}</p>
                        <p className="text-xs text-zinc-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400 group-hover:bg-white group-hover:shadow-md transition-all">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-600">Click or drag file here</p>
                        <p className="text-xs text-zinc-400">Supported formats: .yaml, .yml</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  value={pastedContent}
                  onChange={(e) => setPastedContent(e.target.value)}
                  placeholder="Paste your configuration content here..."
                  className="clean-input w-full px-5 py-4 rounded-2xl font-mono text-sm h-48 resize-none leading-relaxed"
                  spellCheck={false}
                />
              )}
            </div>

            {/* 主按钮 */}
            <button
              onClick={handleSubmit}
              disabled={!customKey || (uploadMode === 'file' ? !selectedFile : !pastedContent) || isLoading}
              className={`
                w-full py-4 rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-2
                ${(!customKey || (uploadMode === 'file' ? !selectedFile : !pastedContent))
                  ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  : 'clean-btn-primary'
                }
              `}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Subscription Link <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>

        {/* 结果弹窗 - 浮动式设计 */}
        {(result || error) && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 text-red-600 text-sm font-medium items-center shadow-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {result && (
              <div className="bg-white rounded-2xl p-1.5 shadow-xl shadow-zinc-200/50 border border-zinc-100">
                <div className="bg-zinc-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-zinc-100">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-0.5">Subscription URL</p>
                    <p className="text-sm font-mono text-zinc-800 truncate select-all">{result}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(result)}
                    className={`h-9 w-9 flex items-center justify-center rounded-lg transition-all
                      ${isCopied ? 'bg-green-600 text-white shadow-md' : 'bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-800'}`}
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="px-4 py-2 text-center">
                  <p className="text-xs text-zinc-400">Link copied! Paste into your Clash client.</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}