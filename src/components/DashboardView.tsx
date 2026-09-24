import React from 'react';
import { Transaction, Goal, BudgetMap, CategoryInfo, PageId } from '../types';
import { formatMoney, getCategoryIcon } from '../data/initialData';
import { IncomeVsExpenseChart, CategoryDoughnutChart } from './InteractiveCharts';
import { MeetangScoreCard } from './MeetangScoreCard';

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
}) => {
  // 1. Calculations (Section 3)
  const income = transactions
    .filter((x) => x.type === 'income')
    .reduce((sum, x) => sum + x.amount, 0);

  const expense = transactions
    .filter((x) => x.type === 'expense')
    .reduce((sum, x) => sum + x.amount, 0);

  const balance = income - expense;
  const savingRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
  const totalGoalSaved = goals.reduce((sum, g) => sum + g.saved, 0);

  // Category totals
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

  // Over budget items count
  const overBudgetCats = Object.entries(budgets).filter(([c, limit]) => (catTotals[c] || 0) > limit);
  const nearBudgetCats = Object.entries(budgets).filter(([c, limit]) => {
    const spent = catTotals[c] || 0;
    const pct = limit > 0 ? (spent / limit) * 100 : 0;
    return pct >= 80 && pct <= 100;
  });

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
    <div className="space-y-6">
      {/* 5 Core Financial Stat Cards (Section 3) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Net Balance */}
        <div className="col-span-2 sm:col-span-1 bg-linear-to-br from-[#dff3e3] via-[#eaf7ee] to-white border border-[#e6ebe6] rounded-[22px] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-[#556959] uppercase tracking-wider">
            💰 เงินคงเหลือสุทธิ
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#17211b] tracking-tight my-1">
            {formatMoney(balance)}
          </div>
          <div className="text-[11px] text-[#25502e] font-semibold">
            {balance >= 0 ? '🟢 กระแสเงินสดเป็นบวก' : '🔴 ควรระวังค่าใช้จ่าย'}
          </div>
        </div>

        {/* 2. Income */}
        <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-[#778178] uppercase tracking-wider">
            💵 รายรับเดือนนี้
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#2f855a] tracking-tight my-1">
            +{formatMoney(income)}
          </div>
          <div className="text-[11px] text-[#778178]">
            {transactions.filter((x) => x.type === 'income').length} รายการรับ
          </div>
        </div>

        {/* 3. Expense */}
        <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-[#778178] uppercase tracking-wider">
            💸 รายจ่ายเดือนนี้
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#d76d6d] tracking-tight my-1">
            −{formatMoney(expense)}
          </div>
          <div className="text-[11px] text-[#778178]">
            {transactions.filter((x) => x.type === 'expense').length} รายการจ่าย
          </div>
        </div>

        {/* 4. Active Savings in Goals */}
        <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-[#778178] uppercase tracking-wider">
            🎯 เงินที่กำลังเก็บ
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#17211b] tracking-tight my-1">
            {formatMoney(totalGoalSaved)}
          </div>
          <div className="text-[11px] text-[#778178]">
            จาก {goals.length} เป้าหมาย
          </div>
        </div>

        {/* 5. Saving Rate % */}
        <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-[#778178] uppercase tracking-wider">
            📊 อัตราการออม
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#25502e] tracking-tight my-1">
            {savingRate}%
          </div>
          <div className="text-[11px] text-[#778178]">
            {savingRate >= 20 ? '🎉 สูงกว่าเกณฑ์ 20%' : '💡 ลองเพิ่มเป็น 20%'}
          </div>
        </div>
      </div>

      {/* Row 2: MEETANG Smart Insight Card & MEETANG SCORE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[18px]">
        {/* MEETANG Smart Insight Card (Deep Forest Green) */}
        <div className="bg-[#18231c] text-white border border-[#2a382e] rounded-[22px] p-6 shadow-md flex flex-col justify-between lg:col-span-2">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-[#b7c8bb] tracking-wider uppercase flex items-center gap-1.5">
                <span>🤖</span> MEETANG SMART INSIGHT
              </div>
              <span className="text-[10px] bg-[#2a3d2e] text-[#bfe5c7] px-2.5 py-0.5 rounded-full font-bold">
                วิเคราะห์สดจากข้อมูลจริง
              </span>
            </div>

            <div className="space-y-2.5 text-sm text-[#e5ebe6] leading-relaxed">
              <p>
                เดือนนี้คุณใช้เงินกับ{' '}
                <strong className="text-[#8fd19d] underline decoration-[#8fd19d] decoration-2 underline-offset-4">
                  {topCatName}
                </strong>{' '}
                มากที่สุด รวม <b>{formatMoney(topCatAmount)}</b> หรือคิดเป็น{' '}
                <b className="text-white">{topCatPercent}%</b> ของรายจ่ายทั้งหมด
              </p>

              {overBudgetCats.length > 0 ? (
                <div className="p-3 bg-[#321c1f] border border-[#52292f] rounded-xl text-xs text-[#fca5a5] flex items-center gap-2">
                  <span>🔴</span>
                  <span>
                    มี <b>{overBudgetCats.length} หมวด</b> ที่เกินงบประมาณแล้ว:{' '}
                    {overBudgetCats.map(([c]) => c).join(', ')}
                  </span>
                </div>
              ) : nearBudgetCats.length > 0 ? (
                <div className="p-3 bg-[#312c1c] border border-[#544729] rounded-xl text-xs text-[#fde047] flex items-center gap-2">
                  <span>⚠️</span>
                  <span>
                    หมวด <b>{nearBudgetCats.map(([c]) => c).join(', ')}</b> มีการใช้เงินเกิน 80% ของงบแล้ว
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-[#1e2e22] border border-[#2b4431] rounded-xl text-xs text-[#8fd19d] flex items-center gap-2">
                  <span>✅</span>
                  <span>งบประมาณทุกหมวดหมู่อยู่ในเกณฑ์ควบคุมได้ดีมาก</span>
                </div>
              )}

              <p className="text-xs text-[#a3b8a6]">
                💡 อัตราการออมปัจจุบันของคุณอยู่ที่ <b>{savingRate}%</b> แนะนำให้นำส่วนเกินไปสมทบเป้าหมาย{' '}
                <span className="text-[#ffd86b] font-semibold">{primaryGoal.name}</span>
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#26372b] flex items-center justify-between">
            <button
              onClick={() => onNavigate('ai')}
              className="py-2 px-4 bg-[#26372b] hover:bg-[#344b3b] text-[#dff3e3] text-xs font-bold rounded-xl border border-[#3b5240] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>ถาม AI เพิ่มเติม</span>
              <span>→</span>
            </button>
            <button
              onClick={onOpenTxModal}
              className="py-2 px-4 bg-[#8fd19d] hover:bg-[#7bc28a] text-[#18231c] text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              ＋ เพิ่มรายการด่วน
            </button>
          </div>
        </div>

        {/* MEETANG SCORE (Section 11) */}
        <MeetangScoreCard
          transactions={transactions}
          goals={goals}
          budgets={budgets}
        />
      </div>

      {/* Row 3: Interactive Charts (Section 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[18px]">
        <div className="lg:col-span-2">
          <IncomeVsExpenseChart transactions={transactions} />
        </div>
        <div>
          <CategoryDoughnutChart transactions={transactions} categories={categories} />
        </div>
      </div>

      {/* Row 4: Budget status & Goal tracker & Recent Tx */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px]">
        {/* 1. Quick Budget Status Card */}
        <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-[#17211b]">การใช้เงินตามงบประมาณ</h3>
            <button
              onClick={() => onNavigate('budget')}
              className="text-xs text-[#778178] hover:text-[#25502e] font-semibold transition-colors cursor-pointer"
            >
              ดูทั้งหมด →
            </button>
          </div>

          <div className="space-y-3.5">
            {categories.slice(0, 4).map((c) => {
              const spent = catTotals[c.name] || 0;
              const limit = budgets[c.name] || 2000;
              const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
              const isOver = pct > 100;
              const isWarning = pct >= 80 && pct <= 100;

              return (
                <div key={c.name} className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-[#17211b] flex items-center gap-1.5">
                      <span>{c.icon}</span>
                      <span>{c.name}</span>
                    </span>
                    <span className="font-bold text-[#17211b]">
                      {formatMoney(spent)} / <span className="text-[#778178] font-normal">{formatMoney(limit)}</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#edf1ed] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isOver ? 'bg-[#e98181]' : isWarning ? 'bg-[#ffd86b]' : 'bg-[#8fd19d]'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Primary Goal Card */}
        <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-[#17211b]">🎯 เป้าหมายสำคัญ</h3>
                <p className="text-xs text-[#778178] mt-0.5">{primaryGoal.name}</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#fff4c8] grid place-items-center text-2xl shadow-2xs">
                {primaryGoal.icon || '🎧'}
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-[#17211b] mt-4 mb-2">
              {formatMoney(primaryGoal.saved)}{' '}
              <span className="text-sm text-[#778178] font-normal">
                / {formatMoney(primaryGoal.target)}
              </span>
            </div>

            <div className="h-2 w-full bg-[#edf1ed] rounded-full overflow-hidden my-2.5">
              <div
                className="h-full bg-[#8fd19d] rounded-full transition-all duration-500"
                style={{ width: `${goalPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-[#778178]">
              <span className="font-bold text-[#25502e]">{goalPercent}%</span>
              <span>เหลืออีก {formatMoney(goalRemaining)}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('goals')}
            className="mt-4 w-full py-2.5 bg-[#f5f9f5] hover:bg-[#eaf4eb] text-[#25502e] text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
          >
            จัดการเป้าหมายทั้งหมด ({goals.length})
          </button>
        </div>

        {/* 3. Recent Transactions */}
        <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-[#17211b]">รายการล่าสุด</h3>
              <button
                onClick={() => onNavigate('transactions')}
                className="text-xs text-[#778178] hover:text-[#25502e] font-semibold transition-colors cursor-pointer"
              >
                ดูทั้งหมด →
              </button>
            </div>

            <div className="divide-y divide-[#e6ebe6]">
              {recentTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <div key={tx.id} className="flex justify-between items-center py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#f1f5f1] grid place-items-center text-sm shrink-0">
                        {getCategoryIcon(tx.cat, categories)}
                      </div>
                      <div className="min-w-0 truncate">
                        <div className="text-xs font-bold text-[#17211b] truncate">{tx.name}</div>
                        <div className="text-[10px] text-[#778178]">{tx.date}</div>
                      </div>
                    </div>
                    <div
                      className={`text-xs font-extrabold shrink-0 ${
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

          <button
            onClick={() => onNavigate('categories')}
            className="mt-3 w-full py-2 bg-[#fafcfa] hover:bg-[#f1f5f1] text-[#4b5563] text-xs font-semibold rounded-xl border border-[#e6ebe6] transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🏷️</span>
            <span>จัดการหมวดหมู่ของฉัน</span>
          </button>
        </div>
      </div>
    </div>
  );
};
