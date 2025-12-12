import React, { useRef, useState } from 'react';
import { Camera, Upload, Loader2, Sparkles, X } from 'lucide-react';
import { extractAthkarFromImage } from '../services/geminiService';
import { ThikrItem } from '../types';

interface CameraScannerProps {
  onScanComplete: (items: ThikrItem[]) => void;
  onCancel: () => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onScanComplete, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Convert to Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        try {
          const result = await extractAthkarFromImage(base64String);
          
          // Map AI result to internal type
          const mappedItems: ThikrItem[] = result.athkar.map((item, index) => ({
            id: `scanned-${Date.now()}-${index}`,
            text: item.text,
            count: item.count,
            currentCount: 0,
            reference: item.reference,
            category: 'scanned'
          }));

          onScanComplete(mappedItems);
        } catch (apiError) {
          setError("عذراً، لم نتمكن من قراءة الصورة. يرجى المحاولة مرة أخرى بصورة أوضح.");
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setError("حدث خطأ أثناء معالجة الملف.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-sand-50 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
        <h2 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
          <Sparkles className="text-emerald-500" size={20} />
          الماسح الذكي
        </h2>
        <button onClick={onCancel} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-200 rounded-full blur animate-pulse"></div>
              <Loader2 size={48} className="relative text-emerald-600 animate-spin" />
            </div>
            <p className="text-lg font-medium text-emerald-800">جاري تحليل الصورة بالذكاء الاصطناعي...</p>
            <p className="text-sm text-gray-500">نستخرج النصوص ونقوم بتهيئتها لك</p>
          </div>
        ) : (
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-2">
               <h3 className="text-2xl font-bold text-gray-800">لديك ورقة أذكار؟</h3>
               <p className="text-gray-500">التقط صورة لصفحة من كتاب الحصن الحصين أو أي ورقة دعاء، وسيقوم التطبيق بتحويلها لعداد إلكتروني.</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

            <div className="grid gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="group relative overflow-hidden flex items-center justify-center gap-3 w-full bg-emerald-600 text-white p-5 rounded-2xl shadow-lg shadow-emerald-200 active:scale-95 transition-all"
              >
                <Camera size={24} />
                <span className="font-bold text-lg">التقاط صورة / اختيار ملف</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
              </button>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};