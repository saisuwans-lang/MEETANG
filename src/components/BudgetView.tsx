import React, { useState } from 'react';
import { Transaction, BudgetMap, CategoryInfo } from '../types';
import { formatMoney, getCategoryIcon } from '../data/initialData';

interface BudgetViewProps {
  transactions: Transaction[];
  budgets: BudgetMap;
  categories: CategoryInfo[];
  onUpdateBudget: (category: string, amount: number) => void;
  onApplyAllRecommendations: (newBudgets: BudgetMap) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  transactions,
  budgets,
  categories,
  onUpdateBudget,
  onApplyAllRecommendations,
}) => {
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'warning' | 'danger' | 'ok'>('all');

  // Calculate actual spending per category
  const catExpenses: Record<string, number> = {};
  transactions
    .filter((x) => x.type === 'expense')
    .forEach((x) => {
      catExpenses[x.cat] = (catExpenses[x.cat] || 0) + x.amount;
    });

  const totalBudget = Object.values(budgets).reduce((sum, val) => sum + val, 0);
  const totalSpent = Object.keys(budgets).reduce((sum, cat) => sum + (catExpenses[cat] || 0), 0);
  const totalRemaining = totalBudget - totalSpent;

  // Real-time Budget Alerts (Section 5)
  interface AlertItem {
    cat: string;
    level: 'ok' | 'warning' | 'caution' | 'danger';
    percent: number;
    message: string;
    diff: number;
  }

  const alertItems: AlertItem[] = categories.map((c) => {
    const limit = budgets[c.name] || 0;
    const spent = catExpenses[c.name] || 0;
    const percent = limit > 0 ? (spent / limit) * 100 : 0;

    if (limit === 0) {
      return {
        cat: c.name,
        level: 'ok',
        percent: 0,
        message: 'ยังไม่ได้กำหนดงบ',
        diff: 0,
      };
    }

    if (percent >= 100) {
      return {
        cat: c.name,
        level: 'danger',
        percent,
        message: `🔴 หมวด${c.name}เกินงบ ${formatMoney(spent - limit)}`,
        diff: spent - limit,
      };
    } else if (percent >= 90) {
      return {
        cat: c.name,
        level: 'caution',
        percent,
        message: `🟠 หมวด${c.name}ใกล้เต็มงบ (ใช้ไป ${Math.round(percent)}% แล้ว เหลือเพียง ${formatMoney(limit - spent)})`,
        diff: limit - spent,
      };
    } else if (percent >= 80) {
      return {
        cat: c.name,
        level: 'warning',
        percent,
        message: `⚠️ หมวด${c.name}ใช้ไป ${Math.round(percent)}% ของงบแล้ว`,
        diff: limit - spent,
      };
    } else {
      return {
        cat: c.name,
        level: 'ok',
        percent,
        message: `หมวด${c.name}ยังอยู่ในงบ (ใช้ไป ${Math.round(percent)}%)`,
        diff: limit - spent,
      };
    }
  });

  const dangerAlerts = alertItems.filter((a) => a.level === 'danger');
  const warningAlerts = alertItems.filter((a) => a.level === 'warning' || a.level === 'caution');

  // Smart Budget Recommendations (Section 6)
  const recommendations: { cat: string; avgSpent: number; recommendedMin: number; recommendedMax: number; note: string }[] = categories.map((c) => {
    const spent = catExpenses[c.name] || 0;
    const avg = spent > 0 ? spent : 1200;
    // rounded to neat 50s
    const minRec = Math.max(300, Math.round((avg * 0.95) / 50) * 50);
    const maxRec = Math.max(500, Math.round((avg * 1.1) / 50) * 50);
    return {
      cat: c.name,
      avgSpent: avg,
      recommendedMin: minRec,
      recommendedMax: maxRec,
      note: `ประวัติการใช้เดือนนี้อยู่ที่ ${formatMoney(spent)} แนะนำช่วงงบ ${formatMoney(minRec)}–${formatMoney(maxRec)}`,
    };
  });

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

  const handleApplySingleRec = (cat: string, val: number) => {
    onUpdateBudget(cat, val);
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Banner Overview */}
      <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <h2 className="text-xl sm:text-2xl font-black text-[#17211b]">วางแผนงบประมาณ</h2>
            </div>
            <p className="text-xs sm:text-[13px] text-[#778178] mt-1">
              กำหนดขีดจำกัดการใช้เงินในแต่ละหมวด ช่วยป้องกันการใช้เงินเกินตัวและแจ้งเตือนอัตโนมัติ
            </p>
          </div>
          <div className="text-left md:text-right bg-[#fafcfa] p-4 rounded-2xl border border-[#edf1ed]">
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

      {/* 2. Real-time Smart Budget Alerts Feed (Section 5) */}
      {(dangerAlerts.length > 0 || warningAlerts.length > 0) && (
        <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm sm:text-base font-bold text-[#17211b] flex items-center gap-2">
              <span>🔔</span> การแจ้งเตือนงบประมาณแบบ Real-Time
            </h3>
            <span className="text-xs text-[#778178]">
              {dangerAlerts.length + warningAlerts.length} รายการที่ต้องระวัง
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {dangerAlerts.map((al) => (
              <div
                key={al.cat}
                className="flex items-center justify-between p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800"
              >
                <span>{al.message}</span>
                <span className="bg-rose-600 text-white px-2 py-0.5 rounded-full text-[10px]">
                  100%+
                </span>
              </div>
            ))}
            {warningAlerts.map((al) => (
              <div
                key={al.cat}
                className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold ${
                  al.level === 'caution'
                    ? 'bg-orange-50 border border-orange-200 text-orange-800'
                    : 'bg-amber-50 border border-amber-200 text-amber-800'
                }`}
              >
                <span>{al.message}</span>
                <span className="bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full text-[10px]">
                  {Math.round(al.percent)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Category Budgets Grid */}
      <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-[#17211b]">งบประมาณรายหมวดหมู่</h3>
            <p className="text-xs text-[#778178] mt-0.5">
              สถานะ: 0–79% ปกติ · 80–89% ⚠️ ใกล้ถึงงบ · 90–99% 🟠 ใกล้เต็มงบ · 100%+ 🔴 เกินงบ
            </p>
          </div>

          <div className="flex bg-[#f1f5f1] p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 font-bold rounded-lg transition-all ${
                filterStatus === 'all' ? 'bg-white text-[#17211b] shadow-xs' : 'text-[#778178]'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilterStatus('danger')}
              className={`px-3 py-1 font-bold rounded-lg transition-all ${
                filterStatus === 'danger' ? 'bg-white text-rose-600 shadow-xs' : 'text-[#778178]'
              }`}
            >
              เกินงบ ({dangerAlerts.length})
            </button>
            <button
              onClick={() => setFilterStatus('warning')}
              className={`px-3 py-1 font-bold rounded-lg transition-all ${
                filterStatus === 'warning' ? 'bg-white text-amber-700 shadow-xs' : 'text-[#778178]'
              }`}
            >
              ใกล้ถึงงบ ({warningAlerts.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories
            .filter((c) => {
              const spent = catExpenses[c.name] || 0;
              const budgetAmount = budgets[c.name] || 0;
              const percent = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
              if (filterStatus === 'danger') return percent >= 100;
              if (filterStatus === 'warning') return percent >= 80 && percent < 100;
              return true;
            })
            .map((catObj) => {
              const cat = catObj.name;
              const budgetAmount = budgets[cat] || 0;
              const spent = catExpenses[cat] || 0;
              const percent = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;
              const isOver = percent >= 100;
              const isCaution = percent >= 90 && percent < 100;
              const isWarning = percent >= 80 && percent < 90;
              const remaining = budgetAmount - spent;

              return (
                <div
                  key={cat}
                  className={`p-4 rounded-2xl border transition-all ${
                    isOver
                      ? 'border-rose-200 bg-rose-50/30'
                      : isCaution
                      ? 'border-orange-200 bg-orange-50/20'
                      : isWarning
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-[#edf1ed] bg-[#fafcfa]'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{catObj.icon}</span>
                      <span className="font-bold text-[#17211b] text-sm">{cat}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#17211b]">
                        {formatMoney(spent)}
                      </span>
                      <span className="text-xs text-[#778178]">
                        / {budgetAmount > 0 ? formatMoney(budgetAmount) : 'ไม่มีงบ'}
                      </span>
                      <button
                        onClick={() => handleEditClick(cat, budgetAmount)}
                        className="ml-1 text-xs px-2.5 py-1 bg-white hover:bg-gray-100 border border-[#e6ebe6] rounded-lg text-[#25502e] font-semibold transition-colors cursor-pointer"
                      >
                        ✏️ ตั้งงบ
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2.5 w-full bg-[#e6ebe6] rounded-full overflow-hidden my-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? 'bg-[#e98181]'
                          : isCaution
                          ? 'bg-[#f97316]'
                          : isWarning
                          ? 'bg-[#ffd86b]'
                          : 'bg-[#8fd19d]'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-[#778178] mt-1 font-medium">
                    <span
                      className={
                        isOver
                          ? 'text-rose-600 font-bold'
                          : isCaution
                          ? 'text-orange-600 font-bold'
                          : isWarning
                          ? 'text-amber-700 font-semibold'
                          : ''
                      }
                    >
                      {isOver
                        ? `🔴 เกินงบ ${percent}%`
                        : isCaution
                        ? `🟠 ใกล้เต็มงบ ${percent}%`
                        : isWarning
                        ? `⚠️ ใกล้ถึงงบ ${percent}%`
                        : `${percent}% ปกติ`}
                    </span>
                    <span className={isOver ? 'text-rose-600 font-bold' : 'text-[#4b5563]'}>
                      {isOver
                        ? `เกิน ${formatMoney(spent - budgetAmount)}`
                        : `เหลือ ${formatMoney(remaining)}`}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 4. Smart Budget Recommendation (Section 6) */}
      <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              <h3 className="text-base font-bold text-[#17211b]">
                ระบบแนะนำงบประมาณอัจฉริยะ (Smart Budget Recommendation)
              </h3>
            </div>
            <p className="text-xs text-[#778178] mt-0.5">
              คำนวณจากประวัติการใช้จ่ายจริงเพื่อช่วยปรับงบให้สอดคล้องกับพฤติกรรมจริง
            </p>
          </div>

          <span className="text-[11px] text-[#556959] bg-[#f5f9f5] border border-[#dff3e3] px-3 py-1 rounded-full font-semibold">
            📌 คำแนะนำจากข้อมูลย้อนหลัง ไม่ใช่ข้อเท็จจริงตายตัว
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {recommendations.slice(0, 6).map((rec) => {
            const current = budgets[rec.cat] || 0;
            return (
              <div
                key={rec.cat}
                className="p-3.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 font-bold text-xs text-[#17211b] mb-1">
                    <span>{getCategoryIcon(rec.cat, categories)}</span>
                    <span>หมวด {rec.cat}</span>
                  </div>
                  <div className="text-xs text-[#556959] mb-2 leading-relaxed">
                    งบที่เหมาะสมสำหรับเดือนหน้าอาจอยู่ที่ประมาณ{' '}
                    <b>{formatMoney(rec.recommendedMin)} – {formatMoney(rec.recommendedMax)}</b>
                  </div>
                  <div className="text-[11px] text-[#778178]">
                    ปัจจุบันตั้งไว้: {current > 0 ? formatMoney(current) : 'ยังไม่ตั้ง'}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#f0f4f0] flex justify-end">
                  <button
                    onClick={() => handleApplySingleRec(rec.cat, rec.recommendedMax)}
                    className="text-xs px-2.5 py-1 bg-[#dff3e3] hover:bg-[#cbebd1] text-[#25502e] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    ปรับเป็น {formatMoney(rec.recommendedMax)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Budget Modal */}
      {editingCat && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl border border-[#e6ebe6] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-[#17211b] mb-1">
              {getCategoryIcon(editingCat, categories)} กำหนดงบประมาณ: {editingCat}
            </h3>
            <p className="text-xs text-[#778178] mb-4">
              กำหนดขีดจำกัดค่าใช้จ่ายต่อเดือนสำหรับหมวดหมู่นี้
            </p>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#17211b] block mb-1.5">
                  จำนวนเงินงบประมาณ (บาท)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  autoFocus
                  value={editingAmount}
                  onChange={(e) => setEditingAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-base font-bold text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="px-4 py-2 bg-[#edf3ee] text-[#4b5563] text-xs font-semibold rounded-xl cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#18231c] text-white text-xs font-bold rounded-xl cursor-pointer"
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
