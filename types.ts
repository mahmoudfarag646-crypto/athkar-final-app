export interface ThikrItem {
  id: string;
  text: string;
  count: number;
  currentCount: number; // For tracking user progress
  category?: string; // e.g., 'morning', 'evening', 'scanned'
  reference?: string; // e.g., 'Muslim', 'Bukhari'
}

export enum AppView {
  HOME = 'HOME',
  MORNING = 'MORNING',
  EVENING = 'EVENING',
  SCAN = 'SCAN',
  SCANNED_RESULT = 'SCANNED_RESULT'
}

export interface AIThikrResponse {
  athkar: {
    text: string;
    count: number;
    reference: string;
  }[];
}