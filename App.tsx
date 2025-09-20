import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { SubtitleTable } from './components/SubtitleTable';
import { parseSrt } from './services/srtParser';
import { refineSubtitles } from './services/geminiService';
import { downloadFile, formatSrt } from './utils/file';
import type { SubtitleEntry } from './types';
import Spinner from './components/Spinner';
import { MagicIcon, DownloadIcon } from './components/Icon';
import ProgressBar from './components/ProgressBar';
import { ScrollButtons } from './components/ScrollButtons';

const App: React.FC = () => {
  const [originalSrt, setOriginalSrt] = useState<SubtitleEntry[] | null>(null);
  const [translatedSrt, setTranslatedSrt] = useState<SubtitleEntry[] | null>(null);
  const [refinedSrt, setRefinedSrt] = useState<SubtitleEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [matchingCount, setMatchingCount] = useState<number>(0);

  useEffect(() => {
    if (originalSrt && translatedSrt) {
        const count = originalSrt.filter(originalEntry => 
            translatedSrt.find(t => t.index === originalEntry.index)
        ).length;
        setMatchingCount(count);
    } else {
        setMatchingCount(0);
    }
  }, [originalSrt, translatedSrt]);

  const resetState = () => {
      setError(null);
      setRefinedSrt(null);
      setProcessingTime(null);
      setProgress(0);
  }

  const handleOriginalUpload = useCallback((content: string) => {
    try {
      setOriginalSrt(parseSrt(content));
      resetState();
    } catch (e) {
      setError("Lỗi khi đọc tệp SRT gốc. Vui lòng kiểm tra lại định dạng.");
      setOriginalSrt(null);
    }
  }, []);

  const handleTranslatedUpload = useCallback((content: string) => {
    try {
      setTranslatedSrt(parseSrt(content));
      resetState();
    } catch (e) {
      setError("Lỗi khi đọc tệp SRT đã dịch. Vui lòng kiểm tra lại định dạng.");
      setTranslatedSrt(null);
    }
  }, []);

  const handleRefine = async () => {
    if (!originalSrt || !translatedSrt) {
      setError("Vui lòng tải lên cả hai tệp SRT gốc và bản dịch.");
      return;
    }
    
    if(originalSrt.length !== translatedSrt.length || (originalSrt.length > 0 && translatedSrt.length > 0 && originalSrt[0].index !== translatedSrt[0].index)) {
        if(!window.confirm("Cảnh báo: Hai tệp SRT có vẻ không khớp về số lượng hoặc cấu trúc. Điều này có thể dẫn đến kết quả không chính xác. Bạn vẫn muốn tiếp tục?")) {
            return;
        }
    }

    setIsLoading(true);
    setError(null);
    setProcessingTime(null);
    setProgress(0);

    const startTime = performance.now();

    try {
      const result = await refineSubtitles(originalSrt, translatedSrt, (currentProgress) => {
        setProgress(currentProgress);
      });
      setRefinedSrt(result);
      const endTime = performance.now();
      setProcessingTime((endTime - startTime) / 1000);
      setProgress(100); // Ensure it completes to 100
    } catch (e: any) {
      setError(e.message || "Đã xảy ra lỗi không xác định trong quá trình tinh chỉnh bằng AI.");
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!refinedSrt) {
      setError("Không có phụ đề đã tinh chỉnh để tải xuống.");
      return;
    }
    const srtContent = formatSrt(refinedSrt);
    downloadFile(srtContent, 'refined_translation_vi.srt', 'text/plain;charset=utf-8');
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            Trình Tinh Chỉnh Phụ Đề SRT Bằng AI
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            So sánh và cải thiện phụ đề tiếng Việt bằng AI
          </p>
        </header>

        <main>
          <div className="max-w-4xl mx-auto bg-gray-800/50 p-6 rounded-lg shadow-xl border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload id="original-srt" label="Phụ Đề Gốc (Tiếng Trung)" onFileUpload={handleOriginalUpload} />
              <FileUpload id="translated-srt" label="Bản Dịch Thô (Tiếng Việt)" onFileUpload={handleTranslatedUpload} />
            </div>
            {error && <div className="mt-4 text-center p-3 bg-red-900/50 text-red-300 rounded-md border border-red-700">{error}</div>}
          </div>

          {originalSrt && translatedSrt && (
            <>
              {matchingCount > 0 && (
                <div className="text-center mt-6 text-gray-400">
                  <p>
                    Sẵn sàng gửi <span className="font-bold text-indigo-400">{matchingCount}</span> cặp phụ đề tới AI để xử lý.
                  </p>
                </div>
              )}
              <div className="text-center mt-4">
                <button
                  onClick={handleRefine}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
                >
                  {isLoading ? <Spinner /> : <MagicIcon className="mr-2 h-5 w-5" />}
                  {isLoading ? `Đang tinh chỉnh... ${progress.toFixed(0)}%` : 'Tinh Chỉnh với AI'}
                </button>
                {isLoading && <ProgressBar progress={progress} />}
              </div>
            </>
          )}

          {refinedSrt && (
             <div className="text-center mt-6 space-y-3">
               {processingTime && (
                <p className="text-sm text-gray-400" aria-live="polite">
                  ✨ Hoàn tất tinh chỉnh trong {processingTime.toFixed(2)} giây.
                </p>
              )}
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-emerald-400 hover:bg-emerald-500 transition-colors"
              >
                <DownloadIcon className="mr-2 h-5 w-5" />
                Tải Phụ Đề Đã Tinh Chỉnh
              </button>
            </div>
          )}
          
          {originalSrt && translatedSrt && (
            <>
                <SubtitleTable 
                    originalSrt={originalSrt} 
                    translatedSrt={translatedSrt} 
                    refinedSrt={refinedSrt} 
                />
                <ScrollButtons />
            </>
          )}
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>Phát triển bởi Gemini AI</p>
        </footer>
      </div>
    </div>
  );
};

export default App;