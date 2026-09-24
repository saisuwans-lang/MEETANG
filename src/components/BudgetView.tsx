import React, { useState } from 'react';
import { Transaction, BudgetMap, CategoryInfo } from '../types';
import { formatMoney, getCategoryIcon } from '../data/initialData';

interface BudgetViewProps {
  transactions: Transaction[];
  budgets: BudgetMap;
  categories: CategoryInfo[];
  onUpdateBudget: (category: string, amount: number) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  transactions,
  budgets,
  categories,
  onUpdateBudget,
}) => {
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState<string>('');

  const catExpenses: Record<string, number> = {};
  transactions
    .filter((x) => x.type === 'expense')
    .forEach((x) => {
      catExpenses[x.cat] = (catExpenses[x.cat] || 0) + x.amount;
    });

  const totalBudget = Object.values(budgets).reduce((sum, val) => sum + val, 0);
  const totalSpent = Object.keys(budgets).reduce((sum, cat) => sum + (catExpenses[cat] || 0), 0);
  const totalRemaining = totalBudget - totalSpent;

  const handleEditClick = (cat: string, currentBudget: number) => {
    setEditingCat(cat);
    setEditingAmount(String(currentBudget));
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;
    const amt = Number(editingAmount);
    if (!isNaN(amt) && amt >= 0) {
      onUpdateBudget(editingCat, amt);
    }
    setEditingCat(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Overview */}
      <div className="bg-white border border-[#e6ebe6] rounded-[21px] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#17211b]">📅 วางแผนงบประมาณ</h2>
            <p className="text-xs sm:text-[13px] text-[#778178] mt-0.5">
              กำหนดขีดจำกัดการใช้เงินในแต่ละหมวด ช่วยป้องกันการใช้เงินเกินตัว
            </p>
          </div>
          <div className="text-left md:text-right">
            <div className="text-xs font-bold text-[#778178] uppercase">งบประมาณรวมทั้งเดือน</div>
            <div className="text-2xl sm:text-3xl font-black text-[#17211b] mt-0.5">
              {formatMoney(totalBudget)}
            </div>
            <div className="text-xs text-[#778178] mt-1">
              ใช้ไปแล้ว {formatMoney(totalSpent)} ·{' '}
              <span className={totalRemaining >= 0 ? 'text-[#3b9660] font-bold' : 'text-[#d76d6d] font-bold'}>
                {totalRemaining >= 0 ? `เหลือ ${formatMoney(totalRemaining)}` : `เกินงบ ${formatMoney(Math.abs(totalRemaining))}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Budgets Grid / List */}
      <div className="bg-white border border-[#e6ebe6] rounded-[21px] p-6 shadow-xs">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-bold text-[#17211b]">งบประมาณรายหมวดหมู่</h3>
          <span className="text-xs text-[#778178]">คลิก "แก้ไข" เพื่อเปลี่ยนขีดจำกัดงบ</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Object.entries(budgets).map(([cat, budgetAmount]) => {
            const spent = catExpenses[cat] || 0;
            const percent = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;
            const isOver = spent > budgetAmount;
            const isWarning = percent >= 80 && percent <= 100;
            const remaining = budgetAmount - spent;

            return (
              <div
                key={cat}
                className={`p-4 rounded-2xl border transition-all ${
                  isOver
                    ? 'border-rose-200 bg-rose-50/30'
                    : isWarning
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-[#edf1ed] bg-[#fafcfa]'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getCategoryIcon(cat, categories)}</span>
                    <span className="font-bold text-[#17211b] text-sm">{cat}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#17211b]">
                      {formatMoney(spent)}
                    </span>
                    <span className="text-xs text-[#778178]">/ {formatMoney(budgetAmount)}</span>
                    <button
                      onClick={() => handleEditClick(cat, budgetAmount)}
                      title="แก้ไขงบ"
                      className="ml-1 text-xs px-2 py-1 bg-white hover:bg-gray-100 border border-[#e6ebe6] rounded-lg text-[#556959] transition-colors"
                    >
                      ✏️ แก้ไข
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-[#e6ebe6] rounded-full overflow-hidden my-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-[#e98181]' : isWarning ? 'bg-[#ffd86b]' : 'bg-[#8fd19d]'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-[#778178] mt-1">
                  <span className={isOver ? 'text-red-500 font-bold' : isWarning ? 'text-amber-700 font-semibold' : ''}>
                    {percent}% ของงบ
                  </span>
                  <span className={isOver ? 'text-red-500 font-bold' : 'text-[#4b5563]'}>
                    {isOver ? `🔴 เกินงบ ${formatMoney(spent - budgetAmount)}` : `เหลืองบ ${formatMoney(remaining)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Budget Modal */}
      {editingCat && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] p-6 max-w-sm w-full shadow-xl border border-[#e6ebe6]">
            <h3 className="text-lg font-bold text-[#17211b] mb-1">
              {getCategoryIcon(editingCat, categories)} แก้ไขงบประมาณ: {editingCat}
            </h3>
            <p className="text-xs text-[#778178] mb-4">
              กำหนดขีดจำกัดค่าใช้จ่ายต่อเดือนสำหรับหมวดหมู่นี้
            </p>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#17211b] block mb-1.5">
                  จำนวนเงินงบประมาณ (บาท)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={editingAmount}
                  onChange={(e) => setEditingAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-sm font-semibold text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="px-4 py-2 bg-[#edf3ee] text-[#4b5563] text-xs font-semibold rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#18231c] text-white text-xs font-bold rounded-xl"
                >
                  บันทึกงบประมาณ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
