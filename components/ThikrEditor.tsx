import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { ThikrItem } from '../types';

interface ThikrEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<ThikrItem>) => void;
  onDelete?: (id: string) => void;
  initialItem?: ThikrItem | null;
}

export const ThikrEditor: React.FC<ThikrEditorProps> = ({ isOpen, onClose, onSave, onDelete, initialItem }) => {
  const [text, setText] = useState('');
  const [count, setCount] = useState(1);
  const [reference, setReference] = useState('');

  useEffect(() => {
    if (initialItem) {
      setText(initialItem.text);
      setCount(initialItem.count);
      setReference(initialItem.reference || '');
    } else {
      setText('');
      setCount(1);
      setReference('');
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialItem?.id, // undefined if new
      text,
      count: Number(count),
      reference,
      currentCount: initialItem?.currentCount || 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-xl animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {initialItem ? 'تعديل الذكر' : 'إضافة ذكر جديد'}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نص الذكر</label>
            <textarea
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none min-h-[120px] font-serif text-lg leading-relaxed resize-none"
              placeholder="اكتب الذكر هنا..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">العدد</label>
              <input
                type="number"
                min="1"
                required
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-center font-bold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المصدر (اختياري)</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                placeholder="مثلاً: رواه مسلم"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8 pt-4 border-t border-gray-50">
             {initialItem && onDelete && (
              <button
                type="button"
                onClick={() => {
                   if(window.confirm('هل أنت متأكد من حذف هذا الذكر؟')) {
                     onDelete(initialItem.id);
                     onClose();
                   }
                }}
                className="p-4 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                title="حذف"
              >
                <Trash2 size={24} />
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-emerald-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Save size={20} />
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};