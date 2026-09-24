import React from 'react';
import { PageId } from '../types';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  onOpenTxModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  onOpenTxModal,
}) => {
  // Navigation strictly matching Section 13
  const navItems: { id: PageId; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'transactions', label: 'รายรับ-รายจ่าย', icon: '💸' },
    { id: 'analysis', label: 'วิเคราะห์', icon: '📊' },
    { id: 'goals', label: 'เป้าหมาย', icon: '🎯' },
    { id: 'budget', label: 'วางแผน', icon: '📅' },
    { id: 'categories', label: 'หมวดหมู่ของฉัน', icon: '🏷️' },
    { id: 'ai', label: 'MEETANG AI', icon: '🤖' },
    { id: 'settings', label: 'ตั้งค่า', icon: '⚙️' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 w-[240px] h-screen bg-white border-r border-[#e6ebe6] p-5 z-20 justify-between">
        <div>
          {/* Brand header */}
          <div className="mb-6 cursor-pointer" onClick={() => onSelectPage('dashboard')}>
            <div className="text-[28px] font-black tracking-tight text-[#17211b] leading-tight">
              MEETANG
            </div>
            <div className="text-xs text-[#778178] font-medium mt-0.5">
              มีเงิน ไม่งงเรื่องเงิน
            </div>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={onOpenTxModal}
            className="w-full mb-4 py-2.5 px-3 bg-[#18231c] hover:bg-[#28382c] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>＋</span>
            <span>บันทึกรายการ</span>
          </button>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectPage(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#dff3e3] text-[#25502e] font-bold shadow-2xs'
                      : 'text-[#69736b] hover:bg-[#f5f9f5] hover:text-[#17211b]'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Tip Card */}
        <div className="p-3 bg-[#f5f9f5] rounded-2xl text-xs text-[#778178] leading-relaxed border border-[#e6ebe6]/50">
          <div className="font-bold text-[#25502e] flex items-center gap-1 mb-1">
            <span>💡</span> Meetang Tip
          </div>
          บันทึกทันทีหลังจ่าย ช่วยสร้างวินัยทางการเงินที่ยั่งยืน
        </div>
      </aside>

      {/* Mobile Top Bar + Horizontal Scrollable Navigation */}
      <div className="md:hidden bg-white border-b border-[#e6ebe6] sticky top-0 z-30 px-4 py-2.5">
        <div className="flex items-center justify-between mb-2">
          <div
            className="flex items-baseline gap-2 cursor-pointer"
            onClick={() => onSelectPage('dashboard')}
          >
            <span className="text-xl font-black text-[#17211b]">MEETANG</span>
            <span className="text-[11px] text-[#778178]">มีเงิน ไม่งงเรื่องเงิน</span>
          </div>
          <button
            onClick={onOpenTxModal}
            className="px-2.5 py-1 bg-[#18231c] text-white text-xs font-bold rounded-lg"
          >
            ＋ บันทึก
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#dff3e3] text-[#25502e] font-bold'
                    : 'bg-[#f5f7f3] text-[#69736b]'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
