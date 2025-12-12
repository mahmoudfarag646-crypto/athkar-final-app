import React, { useState } from 'react';
import { Moon, Sun, Camera, Home, ChevronLeft, Share2, Plus, Check } from 'lucide-react';
import { ThikrItem, AppView } from './types';
import { MORNING_ATHKAR, EVENING_ATHKAR } from './constants';
import { ThikrCard } from './components/ThikrCard';
import { CameraScanner } from './components/CameraScanner';
import { ThikrEditor } from './components/ThikrEditor';

const App = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [morningList, setMorningList] = useState<ThikrItem[]>(MORNING_ATHKAR);
  const [eveningList, setEveningList] = useState<ThikrItem[]>(EVENING_ATHKAR);
  const [scannedList, setScannedList] = useState<ThikrItem[]>([]);

  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ThikrItem | null>(null);
  const [targetListType, setTargetListType] = useState<'morning' | 'evening' | 'scanned' | null>(null);
  
  // Toast State
  const [showToast, setShowToast] = useState(false);

  // Calculate total progress for home screen stats
  const calculateProgress = (list: ThikrItem[]) => {
    if (list.length === 0) return 0;
    const total = list.reduce((acc, item) => acc + item.count, 0);
    const current = list.reduce((acc, item) => acc + item.currentCount, 0);
    return Math.round((current / total) * 100);
  };

  const updateCount = (listType: 'morning' | 'evening' | 'scanned', id: string, newCount: number) => {
    const updater = (prev: ThikrItem[]) => prev.map(item => 
      item.id === id ? { ...item, currentCount: newCount } : item
    );

    if (listType === 'morning') setMorningList(updater);
    if (listType === 'evening') setEveningList(updater);
    if (listType === 'scanned') setScannedList(updater);
  };

  const handleScanComplete = (items: ThikrItem[]) => {
    setScannedList(items);
    setCurrentView(AppView.SCANNED_RESULT);
  };

  const handleShareApp = async () => {
    // ⚠️ إصلاح نهائي لمشكلة الرابط:
    // نترك الرابط فارغاً الآن لتجنب أي أخطاء (404 أو Cannot be reached).
    // بمجرد رفع التطبيق على المتجر، قم بوضع الرابط الحقيقي هنا.
    // مثال: const APP_LINK = "https://play.google.com/store/apps/details?id=com.myapp";
    const APP_LINK = ""; 
    
    const shareText = 'تطبيق أذكار ذكي، حول أذكارك من الورق إلى تطبيق باستخدام الكاميرا.';
    
    // يتم إضافة الرابط للنص فقط في حال كان موجوداً
    const fullText = APP_LINK ? `${shareText}\n${APP_LINK}` : shareText;

    // Modern Copy Function using Clipboard API first, falling back to legacy
    const copyToClipboard = async () => {
      try {
        // Try modern API first (works in secure contexts)
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(fullText);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
          return;
        }
        throw new Error('Clipboard API unavailable');
      } catch (err) {
        // Legacy Fallback (execCommand)
        try {
          const textArea = document.createElement("textarea");
          textArea.value = fullText;
          
          // Ensure element is part of layout but invisible
          textArea.style.position = "fixed";
          textArea.style.left = "-9999px";
          textArea.style.top = "0";
          textArea.setAttribute('readonly', '');
          
          document.body.appendChild(textArea);
          
          // Select content
          textArea.select();
          textArea.setSelectionRange(0, 99999); /* For mobile devices */

          const successful = document.execCommand('copy');
          
          // Cleanup safely
          if (document.body.contains(textArea)) {
            document.body.removeChild(textArea);
          }

          if (successful) {
             setShowToast(true);
             setTimeout(() => setShowToast(false), 3000);
          } else {
             throw new Error('execCommand returned false');
          }
        } catch (fallbackErr) {
          // If all automatic methods fail, fallback to a simple alert or log
          console.log("Copy failed manually");
        }
      }
    };
    
    // Try Native Share first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'تطبيق حصني',
          text: shareText,
          url: APP_LINK || undefined, // Pass undefined if no link to avoid errors
        });
      } catch (err: any) {
        // If user cancelled, do nothing. If error, try copy.
        if (err.name !== 'AbortError') {
          await copyToClipboard();
        }
      }
    } else {
      // No native share, use copy
      await copyToClipboard();
    }
  };

  // --- CRUD Operations ---

  const openAddModal = (listType: 'morning' | 'evening' | 'scanned') => {
    setTargetListType(listType);
    setEditingItem(null);
    setIsEditorOpen(true);
  };

  const openEditModal = (listType: 'morning' | 'evening' | 'scanned', item: ThikrItem) => {
    setTargetListType(listType);
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  const handleSaveThikr = (itemData: Partial<ThikrItem>) => {
    if (!targetListType) return;

    const setList = 
      targetListType === 'morning' ? setMorningList :
      targetListType === 'evening' ? setEveningList : setScannedList;

    setList(prevList => {
      if (itemData.id) {
        // Edit existing
        return prevList.map(item => item.id === itemData.id ? { ...item, ...itemData } as ThikrItem : item);
      } else {
        // Add new
        const newItem: ThikrItem = {
          id: `${targetListType}-${Date.now()}`,
          text: itemData.text || '',
          count: itemData.count || 1,
          currentCount: 0,
          reference: itemData.reference || '',
          category: targetListType
        };
        return [...prevList, newItem];
      }
    });
  };

  const handleDeleteThikr = (id: string) => {
    if (!targetListType) return;
    
    const setList = 
      targetListType === 'morning' ? setMorningList :
      targetListType === 'evening' ? setEveningList : setScannedList;

    setList(prevList => prevList.filter(item => item.id !== id));
  };

  // --- Renderers ---

  const renderHome = () => (
    <div className="flex flex-col gap-6 p-6 animate-fade-in pb-24">
      <header className="flex justify-between items-start mb-4">
        <div>
           <h1 className="text-3xl font-bold text-emerald-900 font-serif mb-1">حصني</h1>
           <p className="text-gray-500 text-sm">اجعل لسانك رطباً بذكر الله</p>
        </div>
        <button 
          onClick={handleShareApp}
          className="p-2.5 bg-white rounded-xl shadow-sm border border-emerald-100 text-emerald-600 hover:bg-emerald-50 active:scale-95 transition-all"
          title="مشاركة التطبيق"
        >
          <Share2 size={20} />
        </button>
      </header>

      {/* Main Action Cards */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setCurrentView(AppView.MORNING)}
          className="relative overflow-hidden bg-gradient-to-br from-amber-100 to-orange-50 p-6 rounded-3xl shadow-sm text-right flex flex-col justify-between h-40 transition-transform active:scale-95 border border-amber-200/50"
        >
          <Sun className="text-amber-500 mb-4" size={32} />
          <div>
            <span className="block font-bold text-amber-900 text-lg">أذكار الصباح</span>
            <span className="text-xs text-amber-700 mt-1 block">{calculateProgress(morningList)}% مكتمل</span>
          </div>
        </button>

        <button 
          onClick={() => setCurrentView(AppView.EVENING)}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-100 to-blue-50 p-6 rounded-3xl shadow-sm text-right flex flex-col justify-between h-40 transition-transform active:scale-95 border border-indigo-200/50"
        >
          <Moon className="text-indigo-500 mb-4" size={32} />
          <div>
            <span className="block font-bold text-indigo-900 text-lg">أذكار المساء</span>
            <span className="text-xs text-indigo-700 mt-1 block">{calculateProgress(eveningList)}% مكتمل</span>
          </div>
        </button>
      </div>

      {/* Scanner Promo Card */}
      <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col items-start gap-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Camera size={28} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">قارئ الأذكار الذكي</h3>
            <p className="text-emerald-100 text-sm leading-relaxed mb-4">
              حول صور الأذكار من الكتب إلى عداد إلكتروني باستخدام الذكاء الاصطناعي.
            </p>
            <button 
              onClick={() => setCurrentView(AppView.SCAN)}
              className="bg-white text-emerald-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-50 active:bg-emerald-100 transition-colors"
            >
              جرب الآن
            </button>
          </div>
        </div>
      </div>
      
      {scannedList.length > 0 && (
         <button 
         onClick={() => setCurrentView(AppView.SCANNED_RESULT)}
         className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group active:scale-[0.99] transition-all"
       >
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
               <Camera size={20} />
            </div>
            <div className="text-right">
              <span className="block font-bold text-gray-800">آخر مسح ضوئي</span>
              <span className="text-xs text-gray-500">{calculateProgress(scannedList)}% مكتمل</span>
            </div>
         </div>
         <ChevronLeft className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
       </button>
      )}
    </div>
  );

  const renderThikrList = (title: string, list: ThikrItem[], type: 'morning' | 'evening' | 'scanned') => (
    <div className="min-h-screen bg-sand-50 animate-slide-in-rtl pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-sand-50/80 backdrop-blur-md border-b border-sand-200 px-4 py-4 flex items-center justify-between">
        <button 
          onClick={() => setCurrentView(AppView.HOME)}
          className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <div className="flex items-center gap-1 font-medium">
             <ChevronLeft size={24} className="rotate-180" /> {/* RTL flip */}
             <span>الرئيسية</span>
          </div>
        </button>
        
        <h2 className="text-xl font-bold text-gray-800 font-serif">{title}</h2>
        
        <button 
          onClick={() => openAddModal(type)}
          className="p-2 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors"
          title="إضافة ذكر"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {list.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>لا توجد أذكار هنا. اضغط + لإضافة ذكر جديد.</p>
          </div>
        ) : (
          list.map(item => (
            <ThikrCard 
              key={item.id} 
              item={item} 
              onUpdate={(id, count) => updateCount(type, id, count)} 
              onEdit={(item) => openEditModal(type, item)}
            />
          ))
        )}
      </div>

      {/* Floating Progress Bar */}
      <div className="fixed bottom-6 left-6 right-6 z-30 max-w-2xl mx-auto">
        <div className="bg-gray-900/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="flex-1">
             <div className="flex justify-between text-xs mb-1 text-gray-300">
               <span>التقدم</span>
               <span>{calculateProgress(list)}%</span>
             </div>
             <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
                 style={{ width: `${calculateProgress(list)}%` }}
               />
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-sans text-gray-900 selection:bg-emerald-200 selection:text-emerald-900">
      {currentView === AppView.HOME && renderHome()}
      {currentView === AppView.MORNING && renderThikrList('أذكار الصباح', morningList, 'morning')}
      {currentView === AppView.EVENING && renderThikrList('أذكار المساء', eveningList, 'evening')}
      {currentView === AppView.SCANNED_RESULT && renderThikrList('نتائج المسح', scannedList, 'scanned')}
      
      {currentView === AppView.SCAN && (
        <CameraScanner 
          onScanComplete={handleScanComplete}
          onCancel={() => setCurrentView(AppView.HOME)}
        />
      )}

      {/* Editor Modal */}
      <ThikrEditor 
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveThikr}
        onDelete={handleDeleteThikr}
        initialItem={editingItem}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
            <div className="bg-emerald-500 rounded-full p-1">
              <Check size={14} className="text-white" />
            </div>
            <span className="font-medium text-sm">تم نسخ رابط التطبيق</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;