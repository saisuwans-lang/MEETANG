import React from 'react';
import { Transaction, CategoryInfo, Goal } from '../types';
import { formatMoney, getCategoryIcon } from '../data/initialData';

interface AnalysisViewProps {
  transactions: Transaction[];
  categories: CategoryInfo[];
  goals: Goal[];
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  transactions,
  categories,
  goals,
}) => {
  const income = transactions
    .filter((x) => x.type === 'income')
    .reduce((a, b) => a + b.amount, 0);

  const expenses = transactions.filter((x) => x.type === 'expense');
  const totalExpense = expenses.reduce((a, b) => a + b.amount, 0);
  const balance = income - totalExpense;

  const savingRate = income > 0 ? Math.max(0, Math.round((balance / income) * 100)) : 0;

  // Category totals
  const catTotals: Record<string, number> = {};
  expenses.forEach((x) => {
    catTotals[x.cat] = (catTotals[x.cat] || 0) + x.amount;
  });

  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const topCat = sortedCats[0];
  const topCatName = topCat ? topCat[0] : 'ไม่มี';
  const topCatAmt = topCat ? topCat[1] : 0;

  const avgExpense = expenses.length > 0 ? Math.round(totalExpense / expenses.length) : 0;

  // Financial Health Status
  let healthGrade = 'ดีเยี่ยม';
  let healthColor = 'text-emerald-700 bg-emerald-50';
  if (savingRate < 10 && balance >= 0) {
    healthGrade = 'ควรระวัง (ออมน้อย)';
    healthColor = 'text-amber-700 bg-amber-50';
  } else if (balance < 0) {
    healthGrade = 'ติดลบ (รายจ่ายเกินรับ)';
    healthColor = 'text-rose-700 bg-rose-50';
  } else if (savingRate >= 20) {
    healthGrade = 'ยอดเยี่ยม (ออมเกิน 20%)';
    healthColor = 'text-emerald-700 bg-emerald-50';
  }

  return (
    <div className="space-y-5">
      {/* 3 Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[17px]">
        {/* Saving Rate */}
        <div className="bg-white border border-[#e6ebe6] rounded-[21px] p-6 shadow-xs">
          <div className="text-xs font-bold text-[#778178] uppercase tracking-wider">
            📊 อัตราการออม
          </div>
          <div className="text-[36px] font-black text-[#17211b] tracking-tight my-2">
            {savingRate}%
          </div>
          <div className="text-xs text-[#778178]">จากรายรับเดือนนี้ ({formatMoney(income)})</div>
        </div>

        {/* Top Spending Category */}
        <div className="bg-white border border-[#e6ebe6] rounded-[21px] p-6 shadow-xs">
          <div className="text-xs font-bold text-[#778178] uppercase tracking-wider">
            🏆 หมวดที่ใช้มากที่สุด
          </div>
          <div className="text-[26px] font-black text-[#17211b] tracking-tight my-2 flex items-center gap-2">
            <span>{getCategoryIcon(topCatName, categories)}</span>
            <span className="truncate">{topCatName}</span>
          </div>
          <div className="text-xs text-[#778178]">
            รวม {formatMoney(topCatAmt)}{' '}
            {totalExpense > 0 && `(${Math.round((topCatAmt / totalExpense) * 100)}% ของรายจ่าย)`}
          </div>
        </div>

        {/* Average Expense */}
        <div className="bg-white border border-[#e6ebe6] rounded-[21px] p-6 shadow-xs">
          <div className="text-xs font-bold text-[#778178] uppercase tracking-wider">
            💸 ค่าใช้จ่ายเฉลี่ย
          </div>
          <div className="text-[26px] font-black text-[#17211b] tracking-tight my-2">
            {formatMoney(avgExpense)}
          </div>
          <div className="text-xs text-[#778178]">ต่อรายการ ({expenses.length} รายการ)</div>
        </div>
      </div>

      {/* Visual Category Distribution */}
      <div className="bg-white border border-[#e6ebe6] rounded-[21px] p-6 shadow-xs">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-bold text-[#17211b]">สัดส่วนการใช้จ่ายแยกตามหมวดหมู่</h3>
          <span className="text-xs text-[#778178]">รายจ่ายรวม {formatMoney(totalExpense)}</span>
        </div>

        <div className="space-y-3.5">
          {sortedCats.map(([cat, amt]) => {
            const share = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
            return (
              <div key={cat}>
                <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{getCategoryIcon(cat, categories)}</span>
                    <span className="font-semibold text-[#17211b]">{cat}</span>
                    <span className="text-[#778178] text-[11px]">({share}%)</span>
                  </div>
                  <span className="font-bold text-[#17211b]">{formatMoney(amt)}</span>
                </div>
                <div className="h-2.5 w-full bg-[#edf1ed] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#8fd19d] rounded-full transition-all duration-500"
                    style={{ width: `${share}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Analysis & Insights */}
      <div className="bg-white border border-[#e6ebe6] rounded-[21px] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#17211b]">สรุปพฤติกรรมการเงิน</h3>
          <span className={`text-xs px-3 py-1 rounded-full font-bold ${healthColor}`}>
            ระดับสุขภาพการเงิน: {healthGrade}
          </span>
        </div>

        <div className="text-xs sm:text-[13px] leading-relaxed text-[#2c3e32] space-y-3">
          <p>
            จากข้อมูลปัจจุบัน รายจ่ายหมวด <b>{topCatName}</b> มีสัดส่วนสูงสุดที่{' '}
            <b>{formatMoney(topCatAmt)}</b> และเงินคงเหลือสุทธิอยู่ที่{' '}
            <b className={balance >= 0 ? 'text-[#3b9660]' : 'text-[#d76d6d]'}>
              {formatMoney(balance)}
            </b>
            {balance >= 0
              ? ` โดยมีอัตราการออม ${savingRate}% ซึ่งเป็นสัญญาณที่ดีสำหรับความมั่นคงทางการเงิน`
              : ' ซึ่งขณะนี้รายจ่ายสูงกว่ารายรับ แนะนำให้ตรวจสอบรายการไม่จำเป็น'}
          </p>

          <div className="bg-[#f5f9f5] border border-[#dff3e3] rounded-xl p-4 space-y-2">
            <div className="font-bold text-[#25502e] flex items-center gap-1.5">
              <span>💡</span> ข้อสังเกตและคำแนะนำเชิงปฏิบัติการ:
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-[#556959]">
              <li>
                ควรจัดสรรเงินออมส่วนเกิน{' '}
                <b>{formatMoney(Math.max(0, Math.round(balance * 0.4)))}</b> เข้าเป้าหมาย{' '}
                <b>{goals[0]?.name || 'เงินออมเพื่ออนาคต'}</b> ก่อนนำไปใช้จ่ายอย่างอื่น
              </li>
              <li>
                การกระจายรายจ่ายในหมวดจำเป็น (อาหาร, เดินทาง) คิดเป็น{' '}
                <b>
                  {Math.round(
                    (((catTotals['อาหาร'] || 0) + (catTotals['เดินทาง'] || 0)) /
                      Math.max(1, totalExpense)) *
                      100
                  )}
                  %
                </b>{' '}
                ของรายจ่ายทั้งหมด ถือเป็นสัดส่วนที่สมดุล
              </li>
              <li>หมั่นอัปเดตบันทึกทุกวันเพื่อการวิเคราะห์แนวโน้มที่แม่นยำยิ่งขึ้น</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
