import React from 'react';
import { Transaction, Goal, BudgetMap } from '../types';

interface MeetangScoreCardProps {
  transactions: Transaction[];
  goals: Goal[];
  budgets: BudgetMap;
}

export const MeetangScoreCard: React.FC<MeetangScoreCardProps> = ({
  transactions,
  goals,
  budgets,
}) => {
  const income = transactions
    .filter((x) => x.type === 'income')
    .reduce((sum, x) => sum + x.amount, 0);

  const expenses = transactions.filter((x) => x.type === 'expense');
  const totalExpense = expenses.reduce((sum, x) => sum + x.amount, 0);
  const netSavings = Math.max(0, income - totalExpense);

  // 1. Savings Score (Max 25 pts)
  const savingRate = income > 0 ? (netSavings / income) * 100 : 0;
  const savingsScore = Math.min(25, Math.round((savingRate / 20) * 25)); // 20% savings gives full 25

  // 2. Budget Control Score (Max 25 pts)
  const catTotals: Record<string, number> = {};
  expenses.forEach((x) => {
    catTotals[x.cat] = (catTotals[x.cat] || 0) + x.amount;
  });
  const budgetEntries = Object.entries(budgets);
  const underBudgetCnt = budgetEntries.filter(([cat, limit]) => {
    const spent = catTotals[cat] || 0;
    return spent <= limit;
  }).length;
  const budgetScore = budgetEntries.length > 0
    ? Math.round((underBudgetCnt / budgetEntries.length) * 25)
    : 20;

  // 3. Goal Progress Score (Max 25 pts)
  const totalGoalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalGoalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const goalProgressRate = totalGoalTarget > 0 ? totalGoalSaved / totalGoalTarget : 0.6;
  const goalScore = Math.min(25, Math.round(goalProgressRate * 25));

  // 4. Tracking Consistency Score (Max 25 pts)
  const txCount = transactions.length;
  const consistencyScore = Math.min(25, Math.max(10, Math.round(txCount * 1.8)));

  const totalScore = Math.min(100, savingsScore + budgetScore + goalScore + consistencyScore);

  // Level description
  let badgeText = 'พฤติกรรมดีเยี่ยม';
  let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (totalScore < 50) {
    badgeText = 'เพิ่งเริ่มต้นสร้างวินัย';
    badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
  } else if (totalScore < 75) {
    badgeText = 'มีวินัยทางการเงินที่ดี';
    badgeColor = 'bg-[#dff3e3] text-[#25502e] border-[#bfe5c7]';
  }

  return (
    <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs font-bold text-[#778178] uppercase tracking-wider flex items-center gap-1.5">
              <span>⭐</span> MEETANG SCORE
            </div>
            <div className="text-[34px] sm:text-[38px] font-black text-[#17211b] tracking-tight mt-1">
              {totalScore}{' '}
              <span className="text-sm font-semibold text-[#778178]">/ 100</span>
            </div>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-bold border ${badgeColor}`}>
            {badgeText}
          </span>
        </div>

        <p className="text-xs text-[#778178] mt-1.5">
          คะแนนประเมินเพื่อติดตามพฤติกรรมทางการเงินของคุณเอง ไม่ใช่การตัดสิน
        </p>

        {/* 4 Dimension Bars */}
        <div className="space-y-3 mt-4">
          {/* Savings */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-[#17211b]">💰 การออม ({savingRate.toFixed(0)}%)</span>
              <span className="text-[#778178]">{savingsScore} / 25</span>
            </div>
            <div className="h-1.5 w-full bg-[#edf1ed] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3b9660] rounded-full transition-all duration-500"
                style={{ width: `${(savingsScore / 25) * 100}%` }}
              />
            </div>
          </div>

          {/* Budget Control */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-[#17211b]">📊 การควบคุมงบ ({underBudgetCnt}/{budgetEntries.length} หมวด)</span>
              <span className="text-[#778178]">{budgetScore} / 25</span>
            </div>
            <div className="h-1.5 w-full bg-[#edf1ed] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8fd19d] rounded-full transition-all duration-500"
                style={{ width: `${(budgetScore / 25) * 100}%` }}
              />
            </div>
          </div>

          {/* Goal Progress */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-[#17211b]">🎯 ความคืบหน้าเป้าหมาย</span>
              <span className="text-[#778178]">{goalScore} / 25</span>
            </div>
            <div className="h-1.5 w-full bg-[#edf1ed] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ffd86b] rounded-full transition-all duration-500"
                style={{ width: `${(goalScore / 25) * 100}%` }}
              />
            </div>
          </div>

          {/* Tracking Consistency */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-[#17211b]">📝 ความสม่ำเสมอในการบันทึก</span>
              <span className="text-[#778178]">{consistencyScore} / 25</span>
            </div>
            <div className="h-1.5 w-full bg-[#edf1ed] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#06b6d4] rounded-full transition-all duration-500"
                style={{ width: `${(consistencyScore / 25) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#f0f4f0] text-[11px] text-[#556959] flex items-center justify-between">
        <span>💡 บันทึกต่อเนื่องเพื่อเพิ่มคะแนนความสม่ำเสมอ</span>
        <span className="font-bold">ระดับ V5</span>
      </div>
    </div>
  );
};
