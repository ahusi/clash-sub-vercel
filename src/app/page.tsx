// 文件路径: src/app/page.tsx
'use client';

import { useState, DragEvent, ChangeEvent, useEffect } from 'react';
import { Upload, FileText, ArrowRight, Loader2, Check, Copy, AlertOctagon, Terminal, Command } from 'lucide-react';

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
      if (file) setError('INVALID FILE FORMAT. ONLY .YAML SUPPORTED.');
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
      
      if (!finalContent.trim()) throw new Error("EMPTY_CONTENT_ERROR");

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain', 'X-Custom-Key': customKey },
        body: finalContent,
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'DEPLOYMENT_FAILED');
      setResult(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SYSTEM_ERROR');
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
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative">
      
      {/* 极简聚光灯效果 */}
      <div className="fixed top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-white/[0.03] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[460px] animate-fade-up">
        
        {/* 顶部标识 */}
        <div className="flex items-center justify-between mb-8 px-1">
          <div className="flex items-center gap-2 text-zinc-100">
            <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
               <div className="w-2 h-2 bg-black rounded-[1px]" />
            </div>
            <span className="font-semibold tracking-tight text-lg">Clash<span className="text-zinc-500 font-normal">Hub</span></span>
          </div>
          <div className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase border border-zinc-800 px-2 py-0.5 rounded-full">
            Secure Enclave
          </div>
        </div>

        {/* 主卡片 */}
        <div className="luxury-card rounded-2xl overflow-hidden">
          
          {/* 输入区域 */}
          <div className="p-1">
            <div className="space-y-1 p-5">
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <Command className="w-3 h-3" /> Alias ID
              </label>
              <input
                type="text"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="Enter unique identifier..."
                className="luxury-input w-full px-0 py-2 bg-transparent border-0 border-b border-white/10 rounded-none focus:ring-0 focus:border-white/40 placeholder:text-zinc-700 text-lg font-light"
                spellCheck={false}
              />
            </div>

            <div className="hairline mx-5" />

            {/* 模式选择 */}
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-6">
                 <button 
                   onClick={() => setUploadMode('file')}
                   className={`text-sm font-medium transition-colors duration-300 pb-1 border-b-2 ${uploadMode === 'file' ? 'text-white border-white' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}
                 >
                   File Import
                 </button>
                 <button 
                   onClick={() => setUploadMode('text')}
                   className={`text-sm font-medium transition-colors duration-300 pb-1 border-b-2 ${uploadMode === 'text' ? 'text-white border-white' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}
                 >
                   Raw Text
                 </button>
              </div>

              <div className="min-h-[140px] transition-all duration-500">
                {uploadMode === 'file' ? (
                  <div
                    onDragEnter={(e) => handleDrag(e, true)}
                    onDragLeave={(e) => handleDrag(e, false)}
                    onDragOver={(e) => handleDrag(e, true)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className={`
                      group w-full h-32 rounded-lg border border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer
                      ${isDragging || selectedFile ? 'border-zinc-500 bg-white/5' : 'border-zinc-800 hover:border-zinc-700 hover:bg-white/[0.02]'}
                    `}
                  >
                    <input id="file-upload" type="file" className="hidden" accept=".yaml,.yml" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                    {selectedFile ? (
                      <div className="flex items-center gap-3 text-zinc-200">
                        <FileText className="w-5 h-5" />
                        <span className="font-mono text-sm">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                        <span className="text-xs text-zinc-600 uppercase tracking-wider">Drop .yaml file</span>
                      </>
                    )}
                  </div>
                ) : (
                  <textarea
                    value={pastedContent}
                    onChange={(e) => setPastedContent(e.target.value)}
                    placeholder="// Paste configuration..."
                    className="w-full h-32 bg-transparent text-xs font-mono text-zinc-400 resize-none outline-none placeholder:text-zinc-800"
                    spellCheck={false}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 底部按钮栏 */}
          <div className="bg-zinc-900/80 p-5 border-t border-white/5 flex items-center justify-between gap-4">
             <div className="flex items-center gap-2 text-xs text-zinc-600">
               <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : result ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
               {isLoading ? 'PROCESSING' : result ? 'READY' : 'STANDBY'}
             </div>
             
             <button
               onClick={handleSubmit}
               disabled={!customKey || (uploadMode === 'file' ? !selectedFile : !pastedContent) || isLoading}
               className={`
                 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2
                 ${!customKey || (uploadMode === 'file' ? !selectedFile : !pastedContent)
                   ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                   : 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                 }
               `}
             >
               {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Deploy <ArrowRight className="w-4 h-4" /></>}
             </button>
          </div>
        </div>

        {/* 结果展示区 - 终端风格 */}
        {(result || error) && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-950/20 border border-red-900/30 rounded-lg text-red-400 text-xs font-mono">
                <AlertOctagon className="w-4 h-4" />
                <span>ERR: {error}</span>
              </div>
            )}

            {result && (
              <div className="group relative rounded-xl bg-black border border-white/10 overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-emerald-500/50 to-emerald-500/0"></div>
                <div className="p-4 flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-zinc-600" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Generated Endpoint</p>
                    <p className="font-mono text-xs text-emerald-500 truncate">{result}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(result)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-500 hover:text-white"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
