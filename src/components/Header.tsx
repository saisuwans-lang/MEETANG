import React from 'react';
import { PageId } from '../types';

interface HeaderProps {
  currentPage: PageId;
  selectedMonth: string;
  onSelectMonth: (m: string) => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  selectedMonth,
  onSelectMonth,
  onResetData,
}) => {
  const pageTitles: Record<PageId, [string, string]> = {
    dashboard: ['สวัสดี 👋 วันนี้เงินเป็นอย่างไรบ้าง?', `ภาพรวมการเงินของคุณ · ${selectedMonth}`],
    transactions: ['💸 รายรับ-รายจ่าย', 'จัดการรายการเงินของคุณแบบละเอียด'],
    analysis: ['📊 วิเคราะห์', 'มองเห็นพฤติกรรมการใช้เงินและการออมของคุณ'],
    goals: ['🎯 เป้าหมายการเงิน', 'เปลี่ยนสิ่งที่อยากได้ให้กลายเป็นแผนที่ทำได้จริง'],
    budget: ['📅 วางแผนงบประมาณ', 'กำหนดขีดจำกัดการใช้เงินในแต่ละหมวดหมู่'],
    v5: ['✨ Smart Dashboard', 'ภาพรวมอัจฉริยะ แจ้งเตือนงบ และหมวดหมู่ของคุณ'],
    ai: ['🤖 MEETANG AI', 'ผู้ช่วยวิเคราะห์การเงินและแนะนำการออมส่วนตัว'],
  };

  const [title, subtitle] = pageTitles[currentPage];

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#17211b] mb-1">
          {title}
        </h1>
        <p className="text-xs sm:text-[13px] text-[#778178] font-normal">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2.5 self-end sm:self-auto">
        <select
          value={selectedMonth}
          onChange={(e) => onSelectMonth(e.target.value)}
          className="text-xs sm:text-sm px-3 py-2 bg-white border border-[#e6ebe6] rounded-xl text-[#17211b] font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
        >
          <option value="กันยายน 2569">กันยายน 2569</option>
          <option value="สิงหาคม 2569">สิงหาคม 2569</option>
          <option value="กรกฎาคม 2569">กรกฎาคม 2569</option>
        </select>

        <button
          onClick={onResetData}
          title="รีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้น"
          className="text-xs px-2.5 py-2 bg-white border border-[#e6ebe6] hover:bg-[#f5f7f3] rounded-xl text-[#778178] transition-colors"
        >
          🔄 รีเซ็ต
        </button>

        <div
          className="w-10 h-10 rounded-full bg-[#ffd86b] text-base font-extrabold grid place-items-center text-[#18231c] shadow-xs cursor-pointer select-none"
          title="โปรไฟล์ผู้ใช้ MEETANG"
        >
          S
        </div>
      </div>
    </header>
  );
};
