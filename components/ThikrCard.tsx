import React, { useState, useEffect } from 'react';
import { ThikrItem } from '../types';
import { Check, RotateCcw, Pencil } from 'lucide-react';

interface ThikrCardProps {
  item: ThikrItem;
  onUpdate: (id: string, newCount: number) => void;
  onEdit?: (item: ThikrItem) => void;
}

export const ThikrCard: React.FC<ThikrCardProps> = ({ item, onUpdate, onEdit }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  // Calculate percentage for the circular progress
  const progress = Math.min((item.currentCount / item.count) * 100, 100);
  const isCompleted = item.currentCount >= item.count;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleClick = () => {
    if (isCompleted) return;
    
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    
    // Haptic feedback if available (mobile)
    if (navigator.vibrate) navigator.vibrate(10);
    
    onUpdate(item.id, item.currentCount + 1);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(item.id, 0);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(item);
  };

  return (
    <div 
      onClick={handleClick}
      className={`relative mb-4 overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 border-2
        ${isCompleted ? 'border-emerald-500/20 bg-emerald-50/50' : 'border-transparent'}
        ${isPressed ? 'scale-[0.98]' : 'scale-100'}
        cursor-pointer select-none
      `}
    >
      <div className="p-5 flex flex-col gap-4">
        {/* Header: Reference and Counter */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span className="font-sans font-medium px-2 py-1 bg-sand-100 rounded-md">
            {item.reference || 'ذكر'}
          </span>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button 
                onClick={handleEditClick}
                className="p-1 text-gray-300 hover:text-emerald-600 transition-colors"
                title="تعديل"
              >
                <Pencil size={16} />
              </button>
            )}
            {isCompleted && (
               <button 
               onClick={handleReset}
               className="p-1 text-gray-400 hover:text-red-500 transition-colors"
               title="إعادة"
             >
               <RotateCcw size={16} />
             </button>
            )}
            <span className={`font-bold ${isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
              {item.currentCount} / {item.count}
            </span>
          </div>
        </div>

        {/* Thikr Text */}
        <p className={`text-xl font-serif leading-loose text-gray-800 text-center transition-opacity duration-300 ${isCompleted ? 'opacity-50' : 'opacity-100'}`}>
          {item.text}
        </p>

        {/* Progress Indicator (Bottom Center) */}
        <div className="flex justify-center mt-2">
          {isCompleted ? (
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 text-white shadow-lg animate-bounce-short">
              <Check size={24} />
            </div>
          ) : (
            <div className="relative w-12 h-12">
               {/* Background Circle */}
               <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-gray-100"
                />
                {/* Progress Circle */}
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-emerald-500 transition-all duration-300 ease-out"
                />
              </svg>
              {/* Tap Icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center text-emerald-500/30">
                <div className="w-2 h-2 rounded-full bg-current"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};