import { Transaction, Goal, BudgetMap, CategoryInfo } from '../types';

export const DEFAULT_CATEGORIES: CategoryInfo[] = [
  { name: 'อาหาร', icon: '🍜', isDefault: true },
  { name: 'เดินทาง', icon: '🚗', isDefault: true },
  { name: 'ช้อปปิ้ง', icon: '🛍️', isDefault: true },
  { name: 'การศึกษา', icon: '📚', isDefault: true },
  { name: 'ความบันเทิง', icon: '🎮', isDefault: true },
  { name: 'สุขภาพ', icon: '💊', isDefault: false },
  { name: 'ที่อยู่อาศัย', icon: '🏠', isDefault: false },
  { name: 'อื่น ๆ', icon: '📦', isDefault: true },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 1, name: 'ข้าวมันไก่', cat: 'อาหาร', type: 'expense', amount: 60, date: 'วันนี้' },
  { id: 2, name: 'ค่าจ้างงาน', cat: 'รายรับ', type: 'income', amount: 1500, date: 'เมื่อวาน' },
  { id: 3, name: 'ค่าเดินทาง', cat: 'เดินทาง', type: 'expense', amount: 45, date: '22 ก.ย.' },
  { id: 4, name: 'อาหารกลางวัน', cat: 'อาหาร', type: 'expense', amount: 120, date: '22 ก.ย.' },
  { id: 5, name: 'หนังสือเรียน', cat: 'การศึกษา', type: 'expense', amount: 390, date: '21 ก.ย.' },
  { id: 6, name: 'ขายของออนไลน์', cat: 'รายรับ', type: 'income', amount: 2500, date: '20 ก.ย.' },
  { id: 7, name: 'เสื้อผ้า', cat: 'ช้อปปิ้ง', type: 'expense', amount: 700, date: '19 ก.ย.' },
  { id: 8, name: 'ค่ารถ', cat: 'เดินทาง', type: 'expense', amount: 150, date: '18 ก.ย.' },
  // Baseline initial items for a realistic full month
  { id: 9, name: 'เงินเดือน / ค่าจ้างพิเศษ', cat: 'รายรับ', type: 'income', amount: 4500, date: '15 ก.ย.' },
  { id: 10, name: 'ของสดและวัตถุดิบทำอาหาร', cat: 'อาหาร', type: 'expense', amount: 1470, date: '12 ก.ย.' },
  { id: 11, name: 'เติมเงินบัตรรถไฟฟ้า BTS/MRT', cat: 'เดินทาง', type: 'expense', amount: 605, date: '10 ก.ย.' },
  { id: 12, name: 'ค่าอินเทอร์เน็ต & โทรศัพท์', cat: 'อื่น ๆ', type: 'expense', amount: 650, date: '08 ก.ย.' },
  { id: 13, name: 'ดูหนัง & สตรีมมิ่ง', cat: 'ความบันเทิง', type: 'expense', amount: 560, date: '05 ก.ย.' }
];

export const INITIAL_GOALS: Goal[] = [
  { id: 1, name: 'ซื้อหูฟังใหม่', target: 3000, saved: 2400, icon: '🎧', deadline: 'ต.ค. 2569' },
  { id: 2, name: 'กองทุนฉุกเฉิน 3 เดือน', target: 20000, saved: 12500, icon: '🛡️', deadline: 'ธ.ค. 2569' },
  { id: 3, name: 'ทริปเที่ยวเชียงใหม่', target: 8000, saved: 3200, icon: '✈️', deadline: 'พ.ย. 2569' },
];

export const INITIAL_BUDGETS: BudgetMap = {
  อาหาร: 2100,
  เดินทาง: 1500,
  ช้อปปิ้ง: 1000,
  การศึกษา: 800,
  ความบันเทิง: 700,
  'อื่น ๆ': 500,
  สุขภาพ: 1000,
  ที่อยู่อาศัย: 2500,
};

export const getCategoryIcon = (cat: string, customCategories: CategoryInfo[] = DEFAULT_CATEGORIES): string => {
  if (cat === 'รายรับ') return '💼';
  const found = customCategories.find((c) => c.name === cat);
  if (found) return found.icon;
  const map: Record<string, string> = {
    อาหาร: '🍜',
    เดินทาง: '🚗',
    ช้อปปิ้ง: '🛍️',
    การศึกษา: '📚',
    ความบันเทิง: '🎮',
    สุขภาพ: '💊',
    ที่อยู่อาศัย: '🏠',
    'อื่น ๆ': '📦',
    รายรับ: '💼',
    โบนัส: '🎉',
    ลงทุน: '📈',
  };
  return map[cat] || '📦';
};

export const formatMoney = (n: number): string => {
  return '฿' + Math.round(n).toLocaleString('th-TH');
};
