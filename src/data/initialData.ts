import { Transaction, Goal, BudgetMap, CategoryInfo, UserSettings } from '../types';

export const DEFAULT_CATEGORIES: CategoryInfo[] = [
  { name: 'อาหาร', icon: '🍜', isDefault: true, color: '#f59e0b' },
  { name: 'เดินทาง', icon: '🚗', isDefault: true, color: '#3b82f6' },
  { name: 'ช้อปปิ้ง', icon: '🛍️', isDefault: true, color: '#ec4899' },
  { name: 'การศึกษา', icon: '📚', isDefault: true, color: '#8b5cf6' },
  { name: 'ความบันเทิง', icon: '🎮', isDefault: true, color: '#10b981' },
  { name: 'สุขภาพ', icon: '💊', isDefault: false, color: '#ef4444' },
  { name: 'ที่อยู่อาศัย', icon: '🏠', isDefault: false, color: '#06b6d4' },
  { name: 'สัตว์เลี้ยง', icon: '🐱', isDefault: false, color: '#f97316' },
  { name: 'อื่น ๆ', icon: '📦', isDefault: true, color: '#6b7280' },
];

export const AVAILABLE_EMOJIS = [
  '🍜', '🚗', '🛍️', '📚', '🎮', '🐱', '☕', '💻', 
  '🏋️', '💊', '🏠', '✈️', '🎁', '⚡', '🎨', '🍿',
  '👕', '🍔', '🍺', '💼', '🎵', '🌿', '👶', '📱'
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 1, name: 'ข้าวมันไก่พิเศษ', cat: 'อาหาร', type: 'expense', amount: 65, date: 'วันนี้', rawDate: '2026-09-24', note: 'มื้อเที่ยง' },
  { id: 2, name: 'ค่าจ้างออกแบบฟรีแลนซ์', cat: 'รายรับ', type: 'income', amount: 3500, date: 'เมื่อวาน', rawDate: '2026-09-23', note: 'โปรเจกต์ไอคอน' },
  { id: 3, name: 'ค่ารถไฟฟ้า MRT', cat: 'เดินทาง', type: 'expense', amount: 45, date: '22 ก.ย.', rawDate: '2026-09-22' },
  { id: 4, name: 'ก๋วยเตี๋ยวต้มยำ & ชานม', cat: 'อาหาร', type: 'expense', amount: 130, date: '22 ก.ย.', rawDate: '2026-09-22' },
  { id: 5, name: 'หนังสือเตรียมสอบภาษาอังกฤษ', cat: 'การศึกษา', type: 'expense', amount: 390, date: '21 ก.ย.', rawDate: '2026-09-21' },
  { id: 6, name: 'ขายของสะสมมือสอง', cat: 'รายรับ', type: 'income', amount: 2500, date: '20 ก.ย.', rawDate: '2026-09-20' },
  { id: 7, name: 'เสื้อผ้าและรองเท้าผ้าใบ', cat: 'ช้อปปิ้ง', type: 'expense', amount: 890, date: '19 ก.ย.', rawDate: '2026-09-19' },
  { id: 8, name: 'เติมน้ำมันมอเตอร์ไซค์', cat: 'เดินทาง', type: 'expense', amount: 150, date: '18 ก.ย.', rawDate: '2026-09-18' },
  { id: 9, name: 'เงินเดือน / ค่าจ้างพาร์ตไทม์', cat: 'รายรับ', type: 'income', amount: 12500, date: '15 ก.ย.', rawDate: '2026-09-15' },
  { id: 10, name: 'ซื้อของสดซูเปอร์มาร์เก็ต', cat: 'อาหาร', type: 'expense', amount: 1470, date: '12 ก.ย.', rawDate: '2026-09-12' },
  { id: 11, name: 'เติมเงินบัตร BTS รายเดือน', cat: 'เดินทาง', type: 'expense', amount: 650, date: '10 ก.ย.', rawDate: '2026-09-10' },
  { id: 12, name: 'ค่าอินเทอร์เน็ตบ้าน & โทรศัพท์', cat: 'อื่น ๆ', type: 'expense', amount: 699, date: '08 ก.ย.', rawDate: '2026-09-08' },
  { id: 13, name: 'ดูหนัง & ซื้อบัตรคอนเสิร์ต', cat: 'ความบันเทิง', type: 'expense', amount: 620, date: '05 ก.ย.', rawDate: '2026-09-05' },
  { id: 14, name: 'อาหารและทรายแมว', cat: 'สัตว์เลี้ยง', type: 'expense', amount: 480, date: '03 ก.ย.', rawDate: '2026-09-03' },
  { id: 15, name: 'ยาและวิตามินบำรุง', cat: 'สุขภาพ', type: 'expense', amount: 350, date: '01 ก.ย.', rawDate: '2026-09-01' }
];

export const INITIAL_GOALS: Goal[] = [
  { id: 1, name: 'ซื้อหูฟังใหม่', target: 3000, saved: 2400, icon: '🎧', deadline: '30 วัน', targetDays: 30 },
  { id: 2, name: 'กองทุนฉุกเฉิน 3 เดือน', target: 20000, saved: 13500, icon: '🛡️', deadline: '90 วัน', targetDays: 90 },
  { id: 3, name: 'ทริปเที่ยวเชียงใหม่', target: 8000, saved: 4200, icon: '✈️', deadline: '60 วัน', targetDays: 60 },
];

export const INITIAL_BUDGETS: BudgetMap = {
  อาหาร: 2500,
  เดินทาง: 1500,
  ช้อปปิ้ง: 1200,
  การศึกษา: 800,
  ความบันเทิง: 800,
  'อื่น ๆ': 800,
  สุขภาพ: 1000,
  ที่อยู่อาศัย: 2500,
  สัตว์เลี้ยง: 800,
};

export const INITIAL_SETTINGS: UserSettings = {
  userName: 'มีตังค์ User',
  currencySymbol: '฿',
  monthlySavingsTarget: 5000,
  enableAlerts: true,
};

export const getCategoryIcon = (cat: string, customCategories: CategoryInfo[] = DEFAULT_CATEGORIES): string => {
  if (cat === 'รายรับ') return '💼';
  const found = customCategories.find((c) => c.name.toLowerCase() === cat.toLowerCase());
  if (found) return found.icon;
  const map: Record<string, string> = {
    อาหาร: '🍜',
    เดินทาง: '🚗',
    ช้อปปิ้ง: '🛍️',
    การศึกษา: '📚',
    ความบันเทิง: '🎮',
    สุขภาพ: '💊',
    ที่อยู่อาศัย: '🏠',
    สัตว์เลี้ยง: '🐱',
    'อื่น ๆ': '📦',
    รายรับ: '💼',
    โบนัส: '🎉',
    ลงทุน: '📈',
  };
  return map[cat] || '📦';
};

export const getCategoryColor = (cat: string, customCategories: CategoryInfo[] = DEFAULT_CATEGORIES): string => {
  const found = customCategories.find((c) => c.name.toLowerCase() === cat.toLowerCase());
  if (found?.color) return found.color;
  const colors = ['#8fd19d', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6', '#10b981', '#f97316', '#6b7280'];
  let hash = 0;
  for (let i = 0; i < cat.length; i++) {
    hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const formatMoney = (n: number): string => {
  return '฿' + Math.round(n).toLocaleString('th-TH');
};

// Storage helper functions as required by V5 architecture
export const STORAGE_KEYS = {
  TRANSACTIONS: 'meetang_v5_txs',
  CATEGORIES: 'meetang_v5_cats',
  BUDGETS: 'meetang_v5_budgets',
  GOALS: 'meetang_v5_goals',
  SETTINGS: 'meetang_v5_settings',
};

export function loadData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error loading ${key} from localStorage:`, err);
    return fallback;
  }
}

export function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error saving ${key} to localStorage:`, err);
  }
}

export function resetAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  } catch (err) {
    console.error('Error clearing data:', err);
  }
}
