// 文件路径: src/app/page.tsx
'use client';

import { useState, DragEvent, ChangeEvent, useEffect } from 'react';
import { FileText, ArrowRight, Loader2, Check, Copy, AlertCircle, UploadCloud, ShieldCheck, Zap } from 'lucide-react';

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
      if (file) setError('格式错误：仅支持 .yaml 或 .yml 文件');
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
      
      if (!finalContent.trim()) throw new Error("配置内容不能为空");

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain', 'X-Custom-Key': customKey },
        body: finalContent,
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '生成失败');
      setResult(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
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
    // 使用 h-screen 和 overflow-hidden 确保不出现滚动条
    <main className="h-screen w-full flex items-center justify-center bg-[#FDFDFD] overflow-hidden relative selection:bg-zinc-900 selection:text-white">
      
      {/* 背景光效：稍微减淡，避免干扰 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] bg-zinc-50/80 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] bg-gray-50/80 rounded-full blur-[120px]" />
      </div>

      {/* 主容器：限制最大高度，确保垂直居中 */}
      <div className="relative z-10 w-full max-w-6xl px-6 lg:px-12 flex flex-col justify-center h-full max-h-[900px]">
        
        {/* 顶部 Header：更紧凑 */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
              配置托管中心
              <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-500 text-xs font-bold tracking-wider uppercase">PRO</span>
            </h1>
            <p className="text-zinc-400 mt-1 font-light text-base">安全、持久的 Clash 订阅分发服务</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-zinc-400 text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>私有化部署</span>
          </div>
        </div>

        {/* 核心卡片：横向超宽布局 */}
        <div className="bg-white border border-zinc-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-3xl p-1 overflow-hidden flex flex-col lg:flex-row h-auto lg:h-[520px]">
          
          {/* 左侧：操作区 (占 60% 宽度) */}
          <div className="flex-1 p-6 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-50">
            
            <div className="space-y-8">
              {/* 1. 别名输入 */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                  设定订阅别名
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="输入唯一标识，如 my-server-01"
                    className="zen-input w-full h-14 px-5 pl-12 rounded-xl text-lg bg-zinc-50/50 hover:bg-zinc-50 focus:bg-white border border-transparent focus:border-zinc-200 transition-all"
                  />
                  <Zap className="absolute left-4 top-4 w-5 h-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                </div>
              </div>

              {/* 2. 内容上传区 */}
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                    配置内容
                  </label>
                  <div className="flex gap-4 text-xs font-medium text-zinc-400">
                    <button onClick={() => setUploadMode('file')} className={`transition-colors ${uploadMode === 'file' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'hover:text-zinc-600'}`}>文件上传</button>
                    <button onClick={() => setUploadMode('text')} className={`transition-colors ${uploadMode === 'text' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'hover:text-zinc-600'}`}>文本粘贴</button>
                  </div>
                </div>

                <div className="flex-1 min-h-[200px]">
                  {uploadMode === 'file' ? (
                    <div
                      onDragEnter={(e) => handleDrag(e, true)}
                      onDragLeave={(e) => handleDrag(e, false)}
                      onDragOver={(e) => handleDrag(e, true)}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className={`
                        w-full h-full min-h-[200px] rounded-xl border border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-4
                        ${isDragging || selectedFile 
                          ? 'border-zinc-400 bg-zinc-50' 
                          : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/30'}
                      `}
                    >
                      <input id="file-upload" type="file" className="hidden" accept=".yaml,.yml" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                      {selectedFile ? (
                        <div className="text-center animate-in fade-in zoom-in-95">
                          <div className="w-12 h-12 bg-zinc-900 text-white rounded-lg flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <FileText className="w-6 h-6" />
                          </div>
                          <p className="font-medium text-zinc-900">{selectedFile.name}</p>
                          <p className="text-xs text-zinc-400 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <UploadCloud className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                          <span className="text-zinc-500 font-medium">点击或拖拽 YAML 文件</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <textarea
                      value={pastedContent}
                      onChange={(e) => setPastedContent(e.target.value)}
                      placeholder="请在此粘贴配置内容..."
                      className="w-full h-full min-h-[200px] p-5 rounded-xl bg-zinc-50/50 hover:bg-zinc-50 focus:bg-white border border-transparent focus:border-zinc-200 resize-none font-mono text-xs leading-relaxed outline-none transition-all"
                      spellCheck={false}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：状态与按钮 (占 40% 宽度，背景稍深一点点) */}
          <div className="lg:w-[400px] bg-zinc-50/30 p-6 sm:p-10 flex flex-col justify-center space-y-8">
            
            {/* 状态展示 */}
            <div className="flex-1 flex flex-col justify-center space-y-6">
              {result ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    <span>生成成功</span>
                  </div>
                  <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-sm">
                    <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider mb-2">订阅链接</p>
                    <code className="text-xs text-zinc-600 font-mono break-all block">
                      {result}
                    </code>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(result)}
                    className="w-full py-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700 font-medium transition-all flex items-center justify-center gap-2"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? '已复制' : '复制链接'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6 opacity-60 pointer-events-none">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-200" />
                    <div className="h-4 w-24 bg-zinc-200 rounded" />
                  </div>
                  <div className="h-24 bg-zinc-200 rounded-xl w-full" />
                </div>
              )}
              
              {/* 错误提示 */}
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
            </div>

            {/* 底部按钮 */}
            <div>
              <button
                onClick={handleSubmit}
                disabled={!customKey || (uploadMode === 'file' ? !selectedFile : !pastedContent) || isLoading}
                className={`
                  w-full h-16 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-zinc-200
                  ${!customKey || (uploadMode === 'file' ? !selectedFile : !pastedContent)
                    ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none'
                    : 'bg-zinc-900 text-white hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all'
                  }
                `}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>立即生成 <ArrowRight className="w-5 h-5" /></>}
              </button>
              <p className="text-center text-xs text-zinc-400 mt-4 font-light">
                配置将存储于边缘网络，有效期 10 年
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}