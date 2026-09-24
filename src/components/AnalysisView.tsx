import React from 'react';
import { Transaction, Goal, BudgetMap, CategoryInfo } from '../types';
import { formatMoney, getCategoryIcon } from '../data/initialData';
import {
  IncomeVsExpenseChart,
  CategoryDoughnutChart,
  SpendingTrendBarChart,
} from './InteractiveCharts';

interface AnalysisViewProps {
  transactions: Transaction[];
  goals: Goal[];
  budgets: BudgetMap;
  categories: CategoryInfo[];
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  transactions,
  goals,
  budgets,
  categories,
}) => {
  const income = transactions
    .filter((x) => x.type === 'income')
    .reduce((sum, x) => sum + x.amount, 0);

  const expenses = transactions.filter((x) => x.type === 'expense');
  const totalExpense = expenses.reduce((sum, x) => sum + x.amount, 0);
  const netSavings = income - totalExpense;
  const savingRate = income > 0 ? Math.round((netSavings / income) * 100) : 0;
  const avgPerDay = Math.round(totalExpense / 30);

  // Group by category
  const catTotals: Record<string, number> = {};
  expenses.forEach((x) => {
    catTotals[x.cat] = (catTotals[x.cat] || 0) + x.amount;
  });

  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const topCat = sortedCats[0];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">📊</span>
          <h2 className="text-xl sm:text-2xl font-black text-[#17211b]">วิเคราะห์การเงิน</h2>
        </div>
        <p className="text-xs sm:text-[13px] text-[#778178]">
          มองเห็นพฤติกรรมการใช้เงินและการออมของคุณผ่านกราฟและตัวชี้วัดเชิงลึก
        </p>

        {/* 4 Health Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div className="p-3.5 bg-[#fafcfa] border border-[#edf1ed] rounded-2xl">
            <span className="text-xs text-[#778178] block">อัตราการออม</span>
            <span className="text-2xl font-black text-[#25502e] block mt-1">{savingRate}%</span>
            <span className="text-[11px] text-[#556959]">
              {savingRate >= 20 ? '✅ เกินเกณฑ์มาตรฐาน 20%' : '⚠️ ต่ำกว่าเกณฑ์ 20%'}
            </span>
          </div>

          <div className="p-3.5 bg-[#fafcfa] border border-[#edf1ed] rounded-2xl">
            <span className="text-xs text-[#778178] block">รายจ่ายเฉลี่ยต่อวัน</span>
            <span className="text-2xl font-black text-[#17211b] block mt-1">
              {formatMoney(avgPerDay)}
            </span>
            <span className="text-[11px] text-[#778178]">คำนวณฐาน 30 วัน</span>
          </div>

          <div className="p-3.5 bg-[#fafcfa] border border-[#edf1ed] rounded-2xl">
            <span className="text-xs text-[#778178] block">หมวดที่จ่ายสูงสุด</span>
            <span className="text-2xl font-black text-[#17211b] block mt-1 truncate">
              {topCat ? topCat[0] : '-'}
            </span>
            <span className="text-[11px] text-[#d76d6d] font-semibold">
              {topCat ? formatMoney(topCat[1]) : '฿0'}
            </span>
          </div>

          <div className="p-3.5 bg-[#fafcfa] border border-[#edf1ed] rounded-2xl">
            <span className="text-xs text-[#778178] block">เงินคงเหลือสุทธิ</span>
            <span
              className={`text-2xl font-black block mt-1 ${
                netSavings >= 0 ? 'text-[#3b9660]' : 'text-[#d76d6d]'
              }`}
            >
              {formatMoney(netSavings)}
            </span>
            <span className="text-[11px] text-[#778178]">
              {netSavings >= 0 ? 'สภาพคล่องเพียงพอ' : 'ติดลบ'}
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Charts (Chart 1 & Chart 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px]">
        <IncomeVsExpenseChart transactions={transactions} />
        <CategoryDoughnutChart transactions={transactions} categories={categories} />
      </div>

      {/* Row 3: Chart 3 (Bar Chart) & Deep Category Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px]">
        <SpendingTrendBarChart transactions={transactions} />

        {/* Detailed Category Table */}
        <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#17211b] mb-1">รายละเอียดรายจ่ายตามหมวด</h3>
            <p className="text-xs text-[#778178] mb-4">
              เรียงลำดับจากหมวดที่ใช้จ่ายเงินมากที่สุดไปหาน้อยที่สุด
            </p>

            <div className="divide-y divide-[#edf1ed] max-h-[260px] overflow-y-auto pr-1">
              {sortedCats.map(([cat, amt]) => {
                const limit = budgets[cat] || 0;
                const pctOfTotal = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
                const pctOfBudget = limit > 0 ? Math.round((amt / limit) * 100) : 0;

                return (
                  <div key={cat} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{getCategoryIcon(cat, categories)}</span>
                      <div>
                        <div className="font-bold text-[#17211b]">{cat}</div>
                        <div className="text-[10px] text-[#778178]">
                          {pctOfTotal}% ของรายจ่ายทั้งหมด
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-[#17211b]">{formatMoney(amt)}</div>
                      <div className="text-[10px] text-[#778178]">
                        {limit > 0 ? (
                          <span
                            className={
                              pctOfBudget > 100
                                ? 'text-rose-600 font-bold'
                                : pctOfBudget >= 80
                                ? 'text-amber-600 font-semibold'
                                : 'text-[#556959]'
                            }
                          >
                            งบ: {pctOfBudget}% ({formatMoney(limit)})
                          </span>
                        ) : (
                          'ไม่ได้ตั้งงบ'
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#edf1ed] text-xs text-[#778178] flex justify-between">
            <span>รวม {sortedCats.length} หมวดหมู่ที่มีการใช้จ่าย</span>
            <span className="font-bold text-[#17211b]">รวม {formatMoney(totalExpense)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
