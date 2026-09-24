import React, { useState } from 'react';
import { Transaction, BudgetMap, CategoryInfo } from '../types';
import { formatMoney, getCategoryIcon } from '../data/initialData';

interface SmartDashboardViewProps {
  transactions: Transaction[];
  budgets: BudgetMap;
  categories: CategoryInfo[];
  onAddCategory: (name: string, icon: string) => void;
  onDeleteCategory: (name: string) => void;
}

export const SmartDashboardView: React.FC<SmartDashboardViewProps> = ({
  transactions,
  budgets,
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🏷️');

  // Emoji choices for quick picker
  const emojiOptions = ['🏷️', '🍜', '🚗', '🛍️', '📚', '🎮', '💊', '🏠', '✈️', '☕', '🐱', '💻', '🎁', '⚡', '🏋️', '📦'];

  // Calculations
  const income = transactions
    .filter((x) => x.type === 'income')
    .reduce((a, b) => a + b.amount, 0);

  const expenses = transactions.filter((x) => x.type === 'expense');
  const totalExpense = expenses.reduce((a, b) => a + b.amount, 0);
  const remain = income - totalExpense;
  const savingRate = income > 0 ? Math.max(0, Math.round((remain / income) * 100)) : 0;

  const catTotals: Record<string, number> = {};
  expenses.forEach((x) => {
    catTotals[x.cat] = (catTotals[x.cat] || 0) + x.amount;
  });

  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const topCatName = sortedCats[0]?.[0] || '—';

  // Budget Alerts
  const alerts: { type: 'danger' | 'warning' | 'ok'; message: string }[] = [];
  Object.entries(budgets).forEach(([cat, limit]) => {
    const spent = catTotals[cat] || 0;
    const percent = limit > 0 ? (spent / limit) * 100 : 0;
    if (percent >= 100) {
      alerts.push({
        type: 'danger',
        message: `🔴 ${cat}: เกินงบแล้ว ${formatMoney(spent - limit)} (ใช้ไป ${Math.round(percent)}%)`,
      });
    } else if (percent >= 80) {
      alerts.push({
        type: 'warning',
        message: `🟡 ${cat}: ใช้ไปแล้ว ${Math.round(percent)}% ของงบ (เหลือ ${formatMoney(limit - spent)})`,
      });
    }
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('หมวดหมู่นี้มีอยู่แล้ว');
      return;
    }
    onAddCategory(trimmed, newCatIcon);
    setNewCatName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#17211b]">
            ✨ MEETANG V5 Smart Dashboard
          </h2>
          <p className="text-xs sm:text-[13px] text-[#778178] mt-0.5">
            ดูข้อมูลการเงินแบบเข้าใจง่าย พร้อมระบบแจ้งเตือนงบ และจัดการหมวดหมู่ที่คุณกำหนดเอง
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-[#dff3e3] hover:bg-[#cee9d3] text-[#25502e] text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
          >
            <span>＋</span>
            <span>เพิ่มหมวดหมู่</span>
          </button>
          <button
            onClick={() => setShowManageModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-[#f5f7f3] border border-[#e6ebe6] text-[#4b5563] text-xs font-semibold rounded-xl transition-colors"
          >
            จัดการหมวดหมู่
          </button>
        </div>
      </div>

      {/* 3 Smart Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[17px]">
        {/* Smart Insight */}
        <div className="bg-white border border-[#e6ebe6] rounded-[21px] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-[#778178] uppercase tracking-wider">
              🧠 SMART INSIGHT
            </div>
            <div className="text-xs sm:text-[13px] leading-relaxed text-[#26372b] mt-3 space-y-2">
              <p>
                <b>ภาพรวมสถานะการเงิน:</b>
              </p>
              <p>
                {remain >= 0 ? 'คุณยังมีเงินคงเหลือสุทธิ' : 'รายจ่ายเดือนนี้สูงกว่ารายรับ'}{' '}
                <strong className={remain >= 0 ? 'text-[#3b9660] font-black' : 'text-[#d76d6d] font-black'}>
                  {formatMoney(Math.abs(remain))}
                </strong>
              </p>
              <p>
                หมวดหมู่สูงสุดคือ <strong className="text-[#17211b]">{topCatName}</strong> · อัตราการออมประมาณ{' '}
                <strong className="text-[#25502e]">{savingRate}%</strong>
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f0f4f0] text-[11px] text-[#778178]">
            💡 คำนวณแบบเรียลไทม์ตามพฤติกรรมการบันทึก
          </div>
        </div>

        {/* Budget Alerts */}
        <div className="bg-white border border-[#e6ebe6] rounded-[21px] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-[#778178] uppercase tracking-wider mb-3">
              🔔 BUDGET ALERTS
            </div>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <div className="p-3 bg-[#e9f7ed] text-[#25502e] rounded-xl text-xs font-medium flex items-center gap-2">
                  <span>🟢</span>
                  <span>งบประมาณทุกหมวดหมู่ของคุณยังอยู่ในระดับปกติ</span>
                </div>
              ) : (
                alerts.map((al, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl text-xs font-medium leading-tight ${
                      al.type === 'danger'
                        ? 'bg-rose-50 text-rose-800 border border-rose-100'
                        : 'bg-amber-50 text-amber-800 border border-amber-100'
                    }`}
                  >
                    {al.message}
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="text-[11px] text-[#778178] mt-3">
            การแจ้งเตือนอัตโนมัติเมื่อแตะ 80% หรือเกิน 100%
          </div>
        </div>

        {/* Category Chips */}
        <div className="bg-white border border-[#e6ebe6] rounded-[21px] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="text-xs font-bold text-[#778178] uppercase tracking-wider">
                🏷️ หมวดหมู่ของฉัน
              </div>
              <span className="text-[11px] text-[#778178]">{categories.length} หมวด</span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto">
              {categories.map((cat) => (
                <span
                  key={cat.name}
                  className="bg-[#f1f5f1] hover:bg-[#e4ede4] text-[#17211b] px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="mt-3 text-xs text-[#25502e] font-bold hover:underline text-left"
          >
            ＋ เพิ่มหมวดหมู่ใหม่
          </button>
        </div>
      </div>

      {/* Visual Horizontal Comparison Chart */}
      <div className="bg-white border border-[#e6ebe6] rounded-[21px] p-6 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-[#17211b]">📊 ค่าใช้จ่ายตามหมวดหมู่ (สูงสุด 6 อันดับ)</h3>
          <span className="text-xs text-[#778178]">เดือนนี้</span>
        </div>

        {sortedCats.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#778178]">ยังไม่มีข้อมูลค่าใช้จ่าย</div>
        ) : (
          <div className="space-y-3.5">
            {sortedCats.slice(0, 6).map(([cat, amt]) => {
              const maxVal = sortedCats[0]?.[1] || 1;
              const barPercent = Math.min(100, Math.round((amt / maxVal) * 100));

              return (
                <div
                  key={cat}
                  className="grid grid-cols-12 gap-3 items-center text-xs sm:text-[13px]"
                >
                  <div className="col-span-4 sm:col-span-3 font-semibold text-[#17211b] flex items-center gap-1.5 truncate">
                    <span>{getCategoryIcon(cat, categories)}</span>
                    <span className="truncate">{cat}</span>
                  </div>

                  <div className="col-span-5 sm:col-span-6">
                    <div className="h-3 w-full bg-[#edf1ed] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#8fd19d] rounded-full transition-all duration-500"
                        style={{ width: `${barPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="col-span-3 text-right font-black text-[#17211b]">
                    {formatMoney(amt)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Add Category */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] p-6 max-w-sm w-full shadow-xl border border-[#e6ebe6]">
            <h3 className="text-lg font-bold text-[#17211b] mb-1">＋ เพิ่มหมวดหมู่ใหม่</h3>
            <p className="text-xs text-[#778178] mb-4">
              เพิ่มหมวดหมู่เฉพาะของคุณเพื่อจัดกลุ่มรายรับและรายจ่าย
            </p>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#17211b] block mb-1">
                  เลือกไอคอน Emoji
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#f9fbf9] border border-[#e6ebe6] rounded-xl">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewCatIcon(emoji)}
                      className={`w-8 h-8 rounded-lg grid place-items-center text-lg transition-all ${
                        newCatIcon === emoji ? 'bg-[#dff3e3] scale-110 shadow-xs' : 'hover:bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#17211b] block mb-1">
                  ชื่อหมวดหมู่
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="เช่น ค่ากาแฟ, ค่าสัตว์เลี้ยง"
                  className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-sm font-medium text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#edf3ee] text-[#4b5563] text-xs font-semibold rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#18231c] text-white text-xs font-bold rounded-xl"
                >
                  บันทึกหมวดหมู่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Manage Categories */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] p-6 max-w-md w-full shadow-xl border border-[#e6ebe6]">
            <h3 className="text-lg font-bold text-[#17211b] mb-1">จัดการหมวดหมู่</h3>
            <p className="text-xs text-[#778178] mb-4">
              หมวดหมู่เริ่มต้นไม่สามารถลบได้ คุณสามารถลบหมวดหมู่ที่สร้างขึ้นเองได้ที่นี่
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  className="flex justify-between items-center p-2.5 rounded-xl border border-[#edf1ed] bg-[#fbfdfb]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-xs font-semibold text-[#17211b]">{cat.name}</span>
                    {cat.isDefault && (
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        หมวดเริ่มต้น
                      </span>
                    )}
                  </div>

                  {!cat.isDefault ? (
                    <button
                      onClick={() => {
                        if (window.confirm(`ต้องการลบหมวดหมู่ "${cat.name}" หรือไม่?`)) {
                          onDeleteCategory(cat.name);
                        }
                      }}
                      className="text-xs text-rose-500 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors"
                    >
                      ลบ
                    </button>
                  ) : (
                    <span className="text-[11px] text-gray-300">ล็อก</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="px-4 py-2 bg-[#18231c] text-white text-xs font-bold rounded-xl"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
