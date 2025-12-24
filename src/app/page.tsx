// 文件路径: src/app/page.tsx
'use client';

import { useState, DragEvent, ChangeEvent, useEffect } from 'react';
import { FileText, Type, ArrowRight, Loader2, Check, Copy, AlertCircle, UploadCloud, ShieldCheck } from 'lucide-react';

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
      if (file) setError('格式错误：仅支持 .yaml 或 .yml 配置文件');
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
      if (!response.ok) throw new Error(data.error || '生成失败，请重试');
      setResult(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误');
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
    <main className="min-h-screen w-full flex items-center justify-center p-8 sm:p-12 lg:p-20 bg-[#FDFDFD]">
      
      {/* 极度克制的背景光：像清晨的雾气 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[70vw] h-[70vw] bg-gray-50/80 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-zinc-50/80 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
        
        {/* 巨型标题区 */}
        <div className="mb-16 sm:mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 text-zinc-600 text-sm font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>私有化部署 · 安全托管</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold text-zinc-900 tracking-tight leading-tight">
            配置托管<span className="text-zinc-300">中心</span>
          </h1>
          <p className="text-xl text-zinc-500 max-w-2xl font-light leading-relaxed">
            为您打造的极简 Clash 配置分发服务。
            <br />
            持久化存储，全终端秒级同步。
          </p>
        </div>

        {/* 核心交互区：左右分栏大布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
          
          {/* 左侧：输入控制 (占 7 列) */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* 1. 别名设置 */}
            <div className="space-y-5">
              <label className="text-xl font-semibold text-zinc-900 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-white text-sm">1</span>
                设定订阅别名
              </label>
              <input
                type="text"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="例如：my-office-mac"
                className="zen-input w-full h-20 px-8 rounded-3xl text-2xl tracking-wide"
              />
              <p className="text-sm text-zinc-400 pl-2">这将成为您订阅链接的唯一标识符。</p>
            </div>

            {/* 2. 内容来源 */}
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <label className="text-xl font-semibold text-zinc-900 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-white text-sm">2</span>
                  导入配置内容
                </label>
                
                {/* 切换开关 */}
                <div className="flex bg-zinc-100 p-1.5 rounded-xl">
                  <button 
                    onClick={() => setUploadMode('file')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${uploadMode === 'file' ? 'bg-white shadow-md text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
                  >
                    文件上传
                  </button>
                  <button 
                    onClick={() => setUploadMode('text')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${uploadMode === 'text' ? 'bg-white shadow-md text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
                  >
                    文本粘贴
                  </button>
                </div>
              </div>

              <div className="min-h-[240px]">
                {uploadMode === 'file' ? (
                  <div
                    onDragEnter={(e) => handleDrag(e, true)}
                    onDragLeave={(e) => handleDrag(e, false)}
                    onDragOver={(e) => handleDrag(e, true)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className={`
                      w-full h-64 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-6
                      ${isDragging || selectedFile 
                        ? 'border-zinc-400 bg-zinc-50' 
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/60'}
                    `}
                  >
                    <input id="file-upload" type="file" className="hidden" accept=".yaml,.yml" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                    {selectedFile ? (
                      <div className="text-center space-y-3 animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shadow-xl mx-auto">
                          <FileText className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-zinc-900">{selectedFile.name}</p>
                          <p className="text-sm text-zinc-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400">
                          <UploadCloud className="w-7 h-7" />
                        </div>
                        <p className="text-lg text-zinc-500 font-medium">点击或拖拽 YAML 文件至此</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <textarea
                    value={pastedContent}
                    onChange={(e) => setPastedContent(e.target.value)}
                    placeholder="请在此粘贴您的配置内容..."
                    className="zen-input w-full h-64 p-8 rounded-3xl resize-none font-mono text-sm leading-relaxed"
                    spellCheck={false}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 右侧：状态与行动 (占 5 列) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-8">
            
            {/* 状态卡片 */}
            <div className="zen-card rounded-[32px] p-8 space-y-6">
              <h3 className="text-lg font-semibold text-zinc-900">准备就绪</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-zinc-100">
                  <span className="text-zinc-500">别名检查</span>
                  <span className={customKey ? "text-emerald-600 font-medium flex items-center gap-1" : "text-zinc-300"}>
                    {customKey ? <><Check className="w-4 h-4" /> 通过</> : "待输入"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-100">
                  <span className="text-zinc-500">内容检查</span>
                  <span className={(uploadMode === 'file' && selectedFile) || (uploadMode === 'text' && pastedContent) ? "text-emerald-600 font-medium flex items-center gap-1" : "text-zinc-300"}>
                    {(uploadMode === 'file' && selectedFile) || (uploadMode === 'text' && pastedContent) ? <><Check className="w-4 h-4" /> 已载入</> : "待载入"}
                  </span>
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* 成功结果 */}
              {result && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="p-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl">
                    <div className="bg-white rounded-xl p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold uppercase tracking-wider">
                        <Check className="w-4 h-4" /> 生成成功
                      </div>
                      <code className="text-xs text-zinc-600 break-all bg-zinc-50 p-3 rounded-lg font-mono">
                        {result}
                      </code>
                    </div>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(result)}
                    className="w-full py-4 rounded-xl bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                  >
                    {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {isCopied ? '已复制链接' : '复制订阅链接'}
                  </button>
                </div>
              )}

              {/* 这里的按钮高度加到了 h-20 (80px)，极具分量感 */}
              {!result && (
                <button
                  onClick={handleSubmit}
                  disabled={!customKey || (uploadMode === 'file' ? !selectedFile : !pastedContent) || isLoading}
                  className={`
                    w-full h-20 rounded-3xl font-bold text-xl flex items-center justify-center gap-3
                    ${!customKey || (uploadMode === 'file' ? !selectedFile : !pastedContent)
                      ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
                      : 'zen-btn-primary'
                    }
                  `}
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>立即生成 <ArrowRight className="w-6 h-6" /></>}
                </button>
              )}
            </div>

            <div className="text-center text-zinc-400 text-sm">
              © 2025 Clash Hub · 高性能边缘网络驱动
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
