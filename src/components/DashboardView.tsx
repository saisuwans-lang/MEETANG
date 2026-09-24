import React from 'react';
import { Transaction, Goal, BudgetMap, CategoryInfo, PageId } from '../types';
import { formatMoney, getCategoryIcon } from '../data/initialData';

interface DashboardViewProps {
  transactions: Transaction[];
  goals: Goal[];
  budgets: BudgetMap;
  categories: CategoryInfo[];
  onNavigate: (page: PageId) => void;
  onOpenTxModal: () => void;
  onOpenGoalModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  goals,
  budgets,
  categories,
  onNavigate,
  onOpenTxModal,
  onOpenGoalModal,
}) => {
  // Calculations
  const income = transactions
    .filter((x) => x.type === 'income')
    .reduce((sum, x) => sum + x.amount, 0);

  const expense = transactions
    .filter((x) => x.type === 'expense')
    .reduce((sum, x) => sum + x.amount, 0);

  const balance = income - expense;

  // Category expenses
  const catTotals: Record<string, number> = {};
  transactions
    .filter((x) => x.type === 'expense')
    .forEach((x) => {
      catTotals[x.cat] = (catTotals[x.cat] || 0) + x.amount;
    });

  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const topCatName = sortedCats[0]?.[0] || 'อาหาร';
  const topCatAmount = sortedCats[0]?.[1] || 0;
  const topCatPercent = expense > 0 ? Math.round((topCatAmount / expense) * 100) : 0;

  const primaryGoal = goals[0] || {
    id: 1,
    name: 'ซื้อหูฟังใหม่',
    target: 3000,
    saved: 2400,
    icon: '🎧',
  };
  const goalPercent = Math.min(100, Math.round((primaryGoal.saved / primaryGoal.target) * 100));
  const goalRemaining = Math.max(0, primaryGoal.target - primaryGoal.saved);

  const recentTransactions = transactions.slice().reverse().slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px]">
      {/* 1. Main Balance Card */}
      <div className="bg-linear-to-br from-[#dff3e3] via-[#eaf7ee] to-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs flex flex-col justify-between min-h-[220px]">
        <div>
          <div className="text-xs font-bold text-[#556959] uppercase tracking-wider">
            💰 เงินคงเหลือ
          </div>
          <div className="text-[38px] sm:text-[42px] font-black text-[#17211b] tracking-tight my-2">
            {formatMoney(balance)}
          </div>
        </div>

        <div className="flex gap-2.5 mt-2">
          <div className="flex-1 bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-white/60 shadow-2xs">
            <span className="text-xs text-[#778178] block font-medium">รายรับ</span>
            <b className="text-sm sm:text-base text-[#2f855a] block mt-0.5">
              + {formatMoney(income)}
            </b>
          </div>
          <div className="flex-1 bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-white/60 shadow-2xs">
            <span className="text-xs text-[#778178] block font-medium">รายจ่าย</span>
            <b className="text-sm sm:text-base text-[#d76d6d] block mt-0.5">
              − {formatMoney(expense)}
            </b>
          </div>
        </div>
      </div>

      {/* 2. Monthly Income Stat Card */}
      <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="text-xs font-bold text-[#778178] uppercase tracking-wider">
            📈 รายรับเดือนนี้
          </div>
          <div className="text-[28px] sm:text-[32px] font-extrabold text-[#17211b] tracking-tight my-2">
            {formatMoney(income)}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-[#778178] mt-2">
          <span>จาก {transactions.filter((x) => x.type === 'income').length} รายการ</span>
          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
            กระแสเงินสดเข้า
          </span>
        </div>
      </div>

      {/* 3. Monthly Expense Stat Card */}
      <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="text-xs font-bold text-[#778178] uppercase tracking-wider">
            📉 รายจ่ายเดือนนี้
          </div>
          <div className="text-[28px] sm:text-[32px] font-extrabold text-[#d76d6d] tracking-tight my-2">
            {formatMoney(expense)}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-[#778178] mt-2">
          <span>จาก {transactions.filter((x) => x.type === 'expense').length} รายการ</span>
          <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full font-medium">
            คุมรายจ่ายอยู่
          </span>
        </div>
      </div>

      {/* 4. Budget Usage / Spending this month (Wide: spans 2 cols on lg) */}
      <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs lg:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-[#17211b]">การใช้เงินเดือนนี้</h3>
          <button
            onClick={() => onNavigate('budget')}
            className="text-xs text-[#778178] hover:text-[#25502e] font-medium transition-colors"
          >
            ปรับแต่งงบประมาณ →
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {sortedCats.slice(0, 4).map(([cat, spent]) => {
            const budget = budgets[cat] || 2000;
            const percent = Math.round((spent / budget) * 100);
            const isOver = percent > 100;
            const isWarning = percent >= 80 && percent <= 100;

            return (
              <div key={cat} className="text-xs">
                <div className="flex justify-between items-center text-[13px] mb-1.5 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span>{getCategoryIcon(cat, categories)}</span>
                    <span className="text-[#17211b] font-semibold">{cat}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#17211b]">{formatMoney(spent)}</span>
                    <span className="text-[#778178] text-[11px]">/ {formatMoney(budget)}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-[#edf1ed] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? 'bg-[#e98181]'
                        : isWarning
                        ? 'bg-[#ffd86b]'
                        : 'bg-[#8fd19d]'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-[#778178] mt-1">
                  <span className={isOver ? 'text-red-500 font-semibold' : ''}>
                    {percent}% ของงบ
                  </span>
                  <span>
                    {isOver
                      ? `เกินงบ ${formatMoney(spent - budget)}`
                      : `เหลืองบ ${formatMoney(budget - spent)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Primary Goal Card */}
      <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-bold text-[#17211b]">🎯 เป้าหมายของฉัน</h3>
              <p className="text-xs text-[#778178] mt-0.5">{primaryGoal.name}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#fff4c8] grid place-items-center text-2xl shadow-2xs">
              {primaryGoal.icon || '🎧'}
            </div>
          </div>

          <div className="text-[26px] font-black text-[#17211b] mt-5 mb-2">
            {formatMoney(primaryGoal.saved)}{' '}
            <span className="text-sm text-[#778178] font-normal">
              / {formatMoney(primaryGoal.target)}
            </span>
          </div>

          <div className="h-2 w-full bg-[#edf1ed] rounded-full overflow-hidden my-3">
            <div
              className="h-full bg-[#8fd19d] rounded-full transition-all duration-500"
              style={{ width: `${goalPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-[#778178]">
            <span className="font-bold text-[#25502e]">{goalPercent}%</span>
            <span>เหลือ {formatMoney(goalRemaining)}</span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('goals')}
          className="mt-4 w-full py-2.5 bg-[#f5f9f5] hover:bg-[#eaf4eb] text-[#25502e] text-xs font-bold rounded-xl transition-colors text-center"
        >
          จัดการเป้าหมายทั้งหมด ({goals.length})
        </button>
      </div>

      {/* 6. MEETANG INSIGHT Card (Dark Forest Slate) */}
      <div className="bg-[#18231c] text-white border border-[#2a382e] rounded-[22px] p-6 shadow-md flex flex-col justify-between">
        <div>
          <div className="text-xs font-bold text-[#b7c8bb] tracking-wider uppercase flex items-center gap-1.5">
            <span>🤖</span> MEETANG INSIGHT
          </div>

          <p className="text-[13px] leading-relaxed text-[#e5ebe6] mt-3">
            เดือนนี้คุณใช้เงินกับ{' '}
            <strong className="text-[#dff3e3] font-bold underline decoration-[#8fd19d]">
              {topCatName}
            </strong>{' '}
            มากที่สุด คิดเป็น <strong>{topCatPercent}%</strong> ของรายจ่ายทั้งหมด
          </p>

          <p className="text-xs text-[#9bb09f] leading-relaxed mt-2.5">
            💡 ลองตั้งงบให้แต่ละหมวด แล้ว MEETANG จะช่วยเตือนเมื่อใกล้ถึงขีดจำกัด
          </p>
        </div>

        <button
          onClick={() => onNavigate('ai')}
          className="mt-4 py-2.5 px-3.5 bg-[#26372b] hover:bg-[#324939] text-[#dff3e3] text-xs font-semibold rounded-xl border border-[#3b5240] transition-colors flex items-center justify-between"
        >
          <span>ถามคำแนะนำจาก AI</span>
          <span>→</span>
        </button>
      </div>

      {/* 7. Recent Transactions (Wide: spans 2 cols on lg) */}
      <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs lg:col-span-2">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-[#17211b]">รายการล่าสุด</h3>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs text-[#778178] hover:text-[#25502e] font-medium transition-colors"
          >
            ดูได้ที่เมนูรายรับ-รายจ่าย →
          </button>
        </div>

        <div className="divide-y divide-[#e6ebe6]">
          {recentTransactions.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <div key={tx.id} className="flex justify-between items-center py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f1f5f1] grid place-items-center text-lg shrink-0">
                    {getCategoryIcon(tx.cat, categories)}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-[#17211b]">{tx.name}</div>
                    <div className="text-[11px] text-[#778178]">
                      {tx.date} · {tx.cat}
                    </div>
                  </div>
                </div>

                <div
                  className={`text-sm font-bold ${
                    isIncome ? 'text-[#3b9660]' : 'text-[#d76d6d]'
                  }`}
                >
                  {isIncome ? '+' : '−'} {formatMoney(tx.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
