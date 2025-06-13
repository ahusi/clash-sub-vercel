// 文件路径: src/app/page.tsx
'use client';

import { useState, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, Link, Copy, AlertTriangle, CheckCircle, LoaderCircle } from 'lucide-react';

export default function HomePage() {
  const [customKey, setCustomKey] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

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

  return (
    <main className="min-h-screen w-full bg-slate-50 dark:bg-gray-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* --- 这是酷炫背景的关键代码 --- */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] dark:bg-slate-900"></div>
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-transparent bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      {/* ----------------------------- */}

      <div className="w-full max-w-md mx-auto bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 p-8 space-y-6 animate-in fade-in-25 slide-in-from-bottom-8 duration-500">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Clash Subscription Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Create & update your persistent subscription links.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="custom-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 text-left">
              Subscription Alias / Key
            </label>
            <input
              type="text"
              id="custom-key"
              value={customKey}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomKey(e.target.value)}
              placeholder="e.g., my-personal-config"
              className="mt-1 block w-full px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-sm shadow-sm placeholder-slate-400 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            />
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(e: DragEvent<HTMLDivElement>) => e.preventDefault()}
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-all duration-200"
            onClick={() => (document.getElementById('file-input') as HTMLInputElement).click()}
          >
            <div className="space-y-1 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {selectedFile ? selectedFile.name : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">.yaml or .yml file</p>
              <input id="file-input" type="file" className="sr-only" onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null)} accept=".yaml,.yml" />
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!customKey || !selectedFile || isLoading}
          className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? <LoaderCircle className="animate-spin h-5 w-5" /> : 'Create / Update Link'}
        </button>

        { (error || result) && <div className="animate-in fade-in-25 slide-in-from-bottom-4 duration-500 pt-2">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30 p-3 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}
          {result && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-500/30 p-4 rounded-lg space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Success! Your link is ready:</p>
              </div>
              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-700/50 p-2 rounded-md">
                <Link className="h-4 w-4 text-slate-500" />
                <input type="text" readOnly value={result} className="text-sm text-slate-700 dark:text-slate-300 bg-transparent w-full focus:outline-none" />
                <button onClick={() => copyToClipboard(result)} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  {isCopied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-slate-500" />}
                </button>
              </div>
            </div>
          )}
        </div>}
      </div>
    </main>
  );
}