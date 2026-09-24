import React from 'react';
import { PageId } from '../types';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onSelectPage }) => {
  const navItems: { id: PageId; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'transactions', label: 'รายรับ-รายจ่าย', icon: '💸' },
    { id: 'analysis', label: 'วิเคราะห์', icon: '📊' },
    { id: 'goals', label: 'เป้าหมาย', icon: '🎯' },
    { id: 'budget', label: 'วางแผน', icon: '📅' },
    { id: 'v5', label: 'Smart Dashboard', icon: '✨' },
    { id: 'ai', label: 'MEETANG AI', icon: '🤖' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 w-[240px] h-screen bg-white border-r border-[#e6ebe6] p-5 z-20">
        <div className="mb-6">
          <div className="text-[28px] font-black tracking-tight text-[#17211b]">MEETANG</div>
          <div className="text-xs text-[#778178] font-medium mt-0.5">มีเงิน ไม่งงเรื่องเงิน</div>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-[#dff3e3] text-[#25502e] font-bold shadow-xs'
                    : 'text-[#69736b] hover:bg-[#f5f9f5] hover:text-[#17211b]'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3.5 bg-[#f5f9f5] rounded-2xl text-xs text-[#778178] leading-relaxed border border-[#e6ebe6]/50">
          <div className="font-bold text-[#25502e] flex items-center gap-1 mb-1">
            <span>💡</span> Tip ประจำวัน
          </div>
          บันทึกรายจ่ายทุกวัน เพื่อให้ MEETANG ช่วยมองเห็นพฤติกรรมการใช้เงินและออมเงินของคุณ
        </div>
      </aside>

      {/* Mobile Top Bar + Scrollable Navigation */}
      <div className="md:hidden bg-white border-b border-[#e6ebe6] sticky top-0 z-30 px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#17211b]">MEETANG</span>
            <span className="text-[11px] text-[#778178]">มีเงิน ไม่งงเรื่องเงิน</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#ffd86b] text-sm font-bold grid place-items-center text-[#18231c]">
            S
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
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
