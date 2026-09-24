import React, { useState } from 'react';
import { PageId } from '../types';

interface HeaderProps {
  currentPage: PageId;
  selectedMonth: string;
  onSelectMonth: (m: string) => void;
  onResetData: () => void;
  userName?: string;
  onNavigate: (page: PageId) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  selectedMonth,
  onSelectMonth,
  onResetData,
  userName = 'MEETANG User',
  onNavigate,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const pageTitles: Record<PageId, [string, string]> = {
    dashboard: ['สวัสดี 👋 วันนี้เงินเป็นอย่างไรบ้าง?', `ภาพรวมการเงินของคุณ · ${selectedMonth}`],
    transactions: ['💸 รายรับ-รายจ่าย', 'ค้นหา กรอง และจัดการทุกรายการทางการเงิน'],
    analysis: ['📊 วิเคราะห์การเงิน', 'มองเห็นพฤติกรรมการใช้เงินและการออมของคุณผ่านกราฟ'],
    goals: ['🎯 เป้าหมายการเงิน', 'เปลี่ยนสิ่งที่อยากได้ให้กลายเป็นแผนออมจริง'],
    budget: ['📅 วางแผนงบประมาณ', 'กำหนดขีดจำกัดการใช้เงิน พร้อมการแจ้งเตือน Real-time'],
    categories: ['🏷️ หมวดหมู่ของฉัน', 'จัดการและเพิ่มหมวดหมู่ใหม่ตามไลฟ์สไตล์ของคุณ'],
    ai: ['🤖 MEETANG AI', 'ผู้ช่วยวิเคราะห์การเงินและวางแผนงบประมาณอัจฉริยะ'],
    settings: ['⚙️ การตั้งค่า', 'โปรไฟล์ ข้อมูลสำรอง และการจัดการระบบ'],
  };

  const [title, subtitle] = pageTitles[currentPage] || ['MEETANG', 'มีเงิน ไม่งงเรื่องเงิน'];

  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#17211b] mb-1">
            {title}
          </h1>
          <p className="text-xs sm:text-[13px] text-[#778178] font-normal">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Month selector */}
          <select
            value={selectedMonth}
            onChange={(e) => onSelectMonth(e.target.value)}
            className="text-xs sm:text-sm px-3 py-2 bg-white border border-[#e6ebe6] rounded-xl text-[#17211b] font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
          >
            <option value="กันยายน 2569">กันยายน 2569</option>
            <option value="สิงหาคม 2569">สิงหาคม 2569</option>
            <option value="กรกฎาคม 2569">กรกฎาคม 2569</option>
          </select>

          {/* Reset Demo button with in-app confirm */}
          <button
            onClick={() => setShowResetConfirm(true)}
            title="รีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้น"
            className="text-xs px-3 py-2 bg-white border border-[#e6ebe6] hover:bg-[#f5f9f5] rounded-xl text-[#778178] hover:text-[#17211b] transition-colors cursor-pointer"
          >
            🔄 รีเซ็ต
          </button>

          {/* Profile avatar - click navigates to settings */}
          <div
            onClick={() => onNavigate('settings')}
            className="w-10 h-10 rounded-full bg-[#ffd86b] text-sm font-extrabold grid place-items-center text-[#18231c] shadow-xs cursor-pointer select-none hover:ring-2 hover:ring-[#8fd19d] transition-all"
            title={`โปรไฟล์: ${userName} (คลิกเพื่อไปที่การตั้งค่า)`}
          >
            {userName.charAt(0).toUpperCase() || 'M'}
          </div>
        </div>
      </header>

      {/* Reset Confirmation Modal (NO window.confirm!) */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl border border-[#e6ebe6] animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-[#f1f5f1] grid place-items-center text-xl mb-3">
              🔄
            </div>
            <h3 className="text-base font-black text-[#17211b] mb-1">
              ยืนยันการรีเซ็ตข้อมูลตัวอย่าง?
            </h3>
            <p className="text-xs text-[#778178] mb-4">
              ระบบจะคืนค่ารายการธุรกรรม หมวดหมู่ และงบประมาณเป็นข้อมูลเริ่มต้นของ MEETANG
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-[#edf3ee] text-[#4b5563] text-xs font-semibold rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-[#18231c] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                ยืนยันรีเซ็ต
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
