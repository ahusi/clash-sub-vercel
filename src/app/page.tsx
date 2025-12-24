// 文件路径: src/app/page.tsx
'use client';

import { useState, DragEvent, ChangeEvent, useEffect } from 'react';
import { UploadCloud, Copy, AlertCircle, Check, Zap, FileCode, Shield } from 'lucide-react';

export default function HomePage() {
  const [customKey, setCustomKey] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (file: File | null) => {
    if (file && (file.name.endsWith('.yaml') || file.name.endsWith('.yml'))) {
      setSelectedFile(file);
      setError(null);
    } else {
      setSelectedFile(null);
      if (file) setError('Please select a valid .yaml or .yml file.');
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !customKey) {
      setError('Please provide an alias and select a file.');
      return;
    }
    setIsLoading(true);
    setResult(null);
    setError(null);
    setIsCopied(false);

    const reader = new FileReader();
    reader.readAsText(selectedFile);
    reader.onload = async (event) => {
      const content = event.target?.result;
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain', 'X-Custom-Key': customKey },
          body: content as string,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Something went wrong.');
        setResult(data.url);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError('An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden bg-zinc-950 font-sans selection:bg-violet-500/30">
      
      {/* 动态流光背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* 卡片容器 */}
        <div className="glass-card rounded-2xl p-8 transition-all duration-500 hover:shadow-violet-500/10 hover:border-violet-500/20 group">
          
          {/* 标题头 */}
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/5 animate-float">
              <Shield className="w-8 h-8 text-transparent bg-clip-text bg-gradient-to-br from-violet-400 to-cyan-400 stroke-current" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400 tracking-tight">
                Subscription Hub
              </h1>
              <p className="text-zinc-500 text-sm mt-2 font-medium">
                Securely host & distribute your Clash configs.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* 输入框组 */}
            <div className="space-y-2">
              <label htmlFor="custom-key" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                Alias / Key
              </label>
              <div className="relative group/input">
                <input
                  type="text"
                  id="custom-key"
                  value={customKey}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomKey(e.target.value)}
                  placeholder="e.g. my-private-server"
                  className="input-field w-full px-4 py-3.5 rounded-xl outline-none pl-11"
                  autoComplete="off"
                />
                <Zap className="absolute left-3.5 top-3.5 w-5 h-5 text-zinc-500 transition-colors group-focus-within/input:text-violet-400" />
              </div>
            </div>

            {/* 拖拽上传区域 */}
            <div
              onDrop={handleDrop}
              onDragOver={(e: DragEvent<HTMLDivElement>) => e.preventDefault()}
              onClick={() => (document.getElementById('file-input') as HTMLInputElement).click()}
              className={`
                relative group/drop cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300
                flex flex-col items-center justify-center py-8 px-4 gap-3
                ${selectedFile 
                  ? 'border-emerald-500/50 bg-emerald-500/5' 
                  : 'border-zinc-700 hover:border-violet-500/50 hover:bg-zinc-800/50'
                }
              `}
            >
              <div className={`
                p-3 rounded-full transition-all duration-300
                ${selectedFile ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400 group-hover/drop:bg-violet-500/20 group-hover/drop:text-violet-400'}
              `}>
                {selectedFile ? <FileCode className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium transition-colors ${selectedFile ? 'text-emerald-400' : 'text-zinc-300'}`}>
                  {selectedFile ? selectedFile.name : 'Click to upload config'}
                </p>
                {!selectedFile && <p className="text-xs text-zinc-500 mt-1">.yaml or .yml files supported</p>}
              </div>
              <input id="file-input" type="file" className="sr-only" onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null)} accept=".yaml,.yml" />
            </div>

            {/* 提交按钮 */}
            <button
              onClick={handleSubmit}
              disabled={!customKey || !selectedFile || isLoading}
              className={`
                w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 relative overflow-hidden group/btn
                disabled:opacity-50 disabled:cursor-not-allowed
                ${!customKey || !selectedFile ? 'bg-zinc-800 text-zinc-500' : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-lg hover:shadow-violet-500/25 text-white transform hover:-translate-y-0.5'}
              `}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Generate Link'
                )}
              </span>
            </button>
          </div>

          {/* 状态反馈 */}
          <div className="mt-6 space-y-4 min-h-[2rem]">
            {error && (
              <div className="animate-in fade-in slide-in-from-top-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 text-red-400 text-sm items-start">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium px-1">
                  <Check className="w-4 h-4" />
                  <span>Success! Link ready.</span>
                </div>
                
                <div className="relative group/result">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl opacity-30 blur group-hover/result:opacity-50 transition duration-500"></div>
                  <div className="relative flex items-center bg-zinc-950 rounded-xl border border-zinc-800 p-1 pr-1.5 shadow-xl">
                    <div className="pl-3 py-2.5 overflow-x-auto w-full no-scrollbar">
                      <code className="text-sm font-mono text-zinc-300 whitespace-nowrap">{result}</code>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(result)}
                      className={`
                        shrink-0 p-2 rounded-lg transition-all duration-200 ml-2
                        ${isCopied ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}
                      `}
                    >
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-center text-xs text-zinc-600">
                  Paste this URL into your Clash client subscription field.
                </p>
              </div>
            )}
          </div>
          
        </div>
        
        <div className="text-center mt-8 text-zinc-700 text-xs">
          <p>© 2025 Clash Hub • Private Deployment</p>
        </div>
      </div>
    </main>
  );
}
