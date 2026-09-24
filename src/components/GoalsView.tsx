import React, { useState } from 'react';
import { Goal } from '../types';
import { formatMoney } from '../data/initialData';

interface GoalsViewProps {
  goals: Goal[];
  onOpenAddGoal: () => void;
  onUpdateGoalSavings: (goalId: number, additionalAmount: number) => void;
  onDeleteGoal: (goalId: number) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onOpenAddGoal,
  onUpdateGoalSavings,
  onDeleteGoal,
}) => {
  const [depositModalGoal, setDepositModalGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('500');

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoal) return;
    const amt = Number(depositAmount);
    if (!amt || amt <= 0) return;
    onUpdateGoalSavings(depositModalGoal.id, amt);
    setDepositModalGoal(null);
    setDepositAmount('500');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#17211b]">🎯 เป้าหมายการเงิน</h2>
          <p className="text-xs sm:text-[13px] text-[#778178] mt-0.5">
            เปลี่ยนสิ่งที่อยากได้ให้กลายเป็นแผนที่ทำได้จริง ติดตามความคืบหน้าง่ายๆ
          </p>
        </div>
        <button
          onClick={onOpenAddGoal}
          className="px-4 py-2.5 bg-[#18231c] hover:bg-[#28382c] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
        >
          <span>＋</span>
          <span>เพิ่มเป้าหมาย</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[17px]">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.saved / goal.target) * 100));
          const remaining = Math.max(0, goal.target - goal.saved);
          const isCompleted = goal.saved >= goal.target;

          return (
            <div
              key={goal.id}
              className={`bg-white border rounded-[22px] p-6 shadow-xs flex flex-col justify-between min-h-[220px] transition-all relative ${
                isCompleted ? 'border-[#8fd19d] ring-2 ring-[#8fd19d]/30' : 'border-[#e6ebe6]'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#fff4c8] grid place-items-center text-2xl shrink-0 shadow-2xs">
                      {goal.icon || '🎯'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#17211b] leading-tight">
                        {goal.name}
                      </h3>
                      {goal.deadline && (
                        <div className="text-[11px] text-[#778178] mt-0.5">
                          เป้าหมายภายใน: {goal.deadline}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`ลบเป้าหมาย "${goal.name}"?`)) {
                        onDeleteGoal(goal.id);
                      }
                    }}
                    title="ลบเป้าหมาย"
                    className="text-gray-300 hover:text-rose-500 text-xs p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-5 mb-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl sm:text-2xl font-black text-[#17211b]">
                      {formatMoney(goal.saved)}
                    </span>
                    <span className="text-xs text-[#778178]">
                      / {formatMoney(goal.target)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 w-full bg-[#edf1ed] rounded-full overflow-hidden my-2.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-[#3b9660]' : 'bg-[#8fd19d]'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-[#778178]">
                  <span className={`font-bold ${isCompleted ? 'text-emerald-700' : 'text-[#25502e]'}`}>
                    {percent}% {isCompleted && '🎉 สำเร็จแล้ว!'}
                  </span>
                  <span>{isCompleted ? 'บรรลุเป้าหมาย' : `เหลืออีก ${formatMoney(remaining)}`}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-[#f0f4f0] flex gap-2">
                <button
                  onClick={() => setDepositModalGoal(goal)}
                  className="flex-1 py-2 bg-[#dff3e3] hover:bg-[#cbebd1] text-[#25502e] text-xs font-bold rounded-xl transition-colors text-center"
                >
                  ＋ ฝากเงินเข้าเป้าหมาย
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deposit Savings Modal */}
      {depositModalGoal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] p-6 max-w-sm w-full shadow-xl border border-[#e6ebe6]">
            <h3 className="text-lg font-bold text-[#17211b] mb-1">
              {depositModalGoal.icon} ฝากเงินเข้าเป้าหมาย
            </h3>
            <p className="text-xs text-[#778178] mb-4">
              เพิ่มเงินออมให้ <b>{depositModalGoal.name}</b> (ปัจจุบัน{' '}
              {formatMoney(depositModalGoal.saved)} / {formatMoney(depositModalGoal.target)})
            </p>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#17211b] block mb-1.5">
                  จำนวนเงินที่จะฝาก (บาท)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-sm font-semibold text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="px-4 py-2 bg-[#edf3ee] text-[#4b5563] text-xs font-semibold rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#18231c] text-white text-xs font-bold rounded-xl"
                >
                  ยืนยันการฝากเงิน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
