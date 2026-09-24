import React, { useState } from 'react';
import { Goal } from '../types';
import { formatMoney } from '../data/initialData';

interface GoalsViewProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onDeposit: (goalId: number, amount: number) => void;
  onDeleteGoal: (goalId: number) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onAddGoal,
  onDeposit,
  onDeleteGoal,
}) => {
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [deleteConfirmGoal, setDeleteConfirmGoal] = useState<Goal | null>(null);

  // Add Goal Form
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [targetDays, setTargetDays] = useState<number>(30);
  const [customDays, setCustomDays] = useState<string>('');

  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.saved, 0);
  const overallPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = Number(target);
    const s = Number(saved) || 0;
    if (!name.trim() || isNaN(t) || t <= 0) return;

    const days = targetDays === 0 ? Number(customDays) || 30 : targetDays;
    const deadlineText = `${days} วัน`;

    onAddGoal({
      name: name.trim(),
      target: t,
      saved: Math.min(t, s),
      icon: icon.trim() || '🎯',
      deadline: deadlineText,
      targetDays: days,
    });

    setName('');
    setTarget('');
    setSaved('');
    setIcon('🎯');
    setTargetDays(30);
    setCustomDays('');
    setIsAddModalOpen(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoal) return;
    const amt = Number(depositAmount);
    if (!isNaN(amt) && amt > 0) {
      onDeposit(depositGoal.id, amt);
    }
    setDepositGoal(null);
    setDepositAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Overview Top Card */}
      <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <h2 className="text-xl sm:text-2xl font-black text-[#17211b]">เป้าหมายการเงิน</h2>
          </div>
          <p className="text-xs sm:text-[13px] text-[#778178] mt-1">
            เปลี่ยนสิ่งที่อยากได้ให้กลายเป็นแผนออมจริง พร้อมคำนวณเงินออมต่อวันเพื่อพิชิตเป้าหมาย
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <span className="text-xs text-[#778178] block">สะสมรวมทุกเป้าหมาย</span>
            <span className="text-lg sm:text-xl font-black text-[#25502e]">
              {formatMoney(totalSaved)} / {formatMoney(totalTarget)}
            </span>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-[#18231c] hover:bg-[#26372b] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>＋</span>
            <span>สร้างเป้าหมายใหม่</span>
          </button>
        </div>
      </div>

      {/* Progress across all goals */}
      <div className="bg-[#f5f9f5] border border-[#dff3e3] rounded-[20px] p-4 flex items-center justify-between text-xs font-semibold text-[#25502e]">
        <span>ภาพรวมความสำเร็จของเป้าหมายทั้งหมด: {overallPercent}%</span>
        <span>มีทั้งหมด {goals.length} เป้าหมาย</span>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px]">
        {goals.map((g) => {
          const percent = Math.min(100, Math.round((g.saved / g.target) * 100));
          const remaining = Math.max(0, g.target - g.saved);
          const isCompleted = percent >= 100;

          // Days & Daily savings calculation (Section 7)
          const days = g.targetDays || 30;
          const dailySavings = remaining > 0 ? Math.ceil(remaining / days) : 0;

          return (
            <div
              key={g.id}
              className={`bg-white border rounded-[22px] p-5 shadow-xs flex flex-col justify-between transition-all ${
                isCompleted ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-[#e6ebe6]'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#fff4c8] grid place-items-center text-2xl shadow-2xs">
                    {g.icon}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-[#dff3e3] text-[#25502e]'
                      }`}
                    >
                      {isCompleted ? 'สำเร็จแล้ว 🎉' : `${percent}%`}
                    </span>
                    <button
                      onClick={() => setDeleteConfirmGoal(g)}
                      className="text-gray-400 hover:text-rose-500 p-1 text-sm rounded-lg transition-colors cursor-pointer"
                      title="ลบเป้าหมาย"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-base font-bold text-[#17211b] mb-1">{g.name}</h3>

                {/* Numbers */}
                <div className="text-2xl font-black text-[#17211b] my-2">
                  {formatMoney(g.saved)}{' '}
                  <span className="text-xs text-[#778178] font-normal">
                    / {formatMoney(g.target)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-[#edf1ed] rounded-full overflow-hidden my-2.5">
                  <div
                    className="h-full bg-[#8fd19d] rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Remaining & Target */}
                <div className="flex justify-between text-xs text-[#778178] mb-3">
                  <span>เหลืออีก {formatMoney(remaining)}</span>
                  <span>กำหนด: {g.deadline || `${days} วัน`}</span>
                </div>

                {/* Smart Daily Savings Box (Section 7) */}
                {!isCompleted ? (
                  <div className="p-3 bg-[#f5f9f5] border border-[#dff3e3] rounded-xl text-xs text-[#25502e] mb-3">
                    <div className="font-bold flex items-center gap-1 mb-0.5">
                      <span>💡</span> แนะนำการเก็บเงินต่อวัน
                    </div>
                    <div>
                      ถ้าต้องการถึงเป้าหมายใน <b>{days} วัน</b> ควรเก็บประมาณ{' '}
                      <b className="text-emerald-700 underline underline-offset-2">
                        {formatMoney(dailySavings)}/วัน
                      </b>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold text-center mb-3">
                    ยินดีด้วย! คุณสะสมเงินครบตามเป้าหมายแล้ว
                  </div>
                )}
              </div>

              {/* Deposit button */}
              <button
                disabled={isCompleted}
                onClick={() => {
                  setDepositGoal(g);
                  setDepositAmount('');
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  isCompleted
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#dff3e3] hover:bg-[#cce9d2] text-[#25502e] cursor-pointer'
                }`}
              >
                ＋ หยอดกระปุกเงินออม
              </button>
            </div>
          );
        })}
      </div>

      {/* ================= MODAL: ADD GOAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#e6ebe6] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-[#17211b]">ตั้งเป้าหมายใหม่ 🎯</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg w-8 h-8 rounded-lg grid place-items-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#17211b] block mb-1.5">
                  ชื่อเป้าหมาย
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="เช่น ซื้อโน้ตบุ๊กใหม่, ทริปญี่ปุ่น, กองทุนสำรอง"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-sm font-semibold text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#17211b] block mb-1.5">
                    เป้าหมาย (บาท)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="เช่น 5000"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-sm font-semibold text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#17211b] block mb-1.5">
                    เก็บได้แล้ว (บาท)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={saved}
                    onChange={(e) => setSaved(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-sm font-semibold text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
                  />
                </div>
              </div>

              {/* Target Duration (Section 7) */}
              <div>
                <label className="text-xs font-bold text-[#17211b] block mb-1.5">
                  ระยะเวลาที่ต้องการบรรลุเป้าหมาย
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                  {[30, 60, 90, 0].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setTargetDays(d)}
                      className={`py-2 rounded-xl transition-all ${
                        targetDays === d
                          ? 'bg-[#18231c] text-white shadow-xs'
                          : 'bg-[#f1f5f1] text-[#4b5563] hover:bg-[#e4ece4]'
                      }`}
                    >
                      {d === 0 ? 'กำหนดเอง' : `${d} วัน`}
                    </button>
                  ))}
                </div>
                {targetDays === 0 && (
                  <input
                    type="number"
                    min="1"
                    placeholder="จำนวนวัน เช่น 45, 120"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="mt-2 w-full px-3.5 py-2 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
                  />
                )}
              </div>

              {/* Icon Emoji Picker */}
              <div>
                <label className="text-xs font-bold text-[#17211b] block mb-1.5">
                  เลือกไอคอน Emoji
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {['🎧', '🛡️', '✈️', '💻', '🚗', '🏠', '📱', '💍', '🎓', '🏖️'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setIcon(em)}
                      className={`w-10 h-10 rounded-xl grid place-items-center text-lg shrink-0 transition-all ${
                        icon === em ? 'bg-[#dff3e3] border-2 border-[#8fd19d]' : 'bg-[#f1f5f1]'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-[#edf3ee] text-[#4b5563] text-xs font-semibold rounded-xl cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#18231c] hover:bg-[#25392b] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  สร้างเป้าหมาย
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DEPOSIT ================= */}
      {depositGoal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl border border-[#e6ebe6] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-[#17211b] mb-1">
              {depositGoal.icon} หยอดกระปุก: {depositGoal.name}
            </h3>
            <p className="text-xs text-[#778178] mb-4">
              สะสมแล้ว {formatMoney(depositGoal.saved)} / {formatMoney(depositGoal.target)}
            </p>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#17211b] block mb-1.5">
                  จำนวนเงินที่ต้องการหยอดเพิ่ม (บาท)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  autoFocus
                  placeholder="เช่น 100, 500"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-base font-bold text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
                />
              </div>

              {/* Quick addition chips */}
              <div className="flex gap-2">
                {[100, 200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(String(amt))}
                    className="flex-1 py-1.5 bg-[#f1f5f1] hover:bg-[#e4ece4] text-[#17211b] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    +{amt}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setDepositGoal(null)}
                  className="px-4 py-2 bg-[#edf3ee] text-[#4b5563] text-xs font-semibold rounded-xl cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#25502e] hover:bg-[#1e4225] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  หยอดกระปุก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE GOAL CONFIRMATION ================= */}
      {deleteConfirmGoal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 grid place-items-center text-xl mb-3">
              🗑️
            </div>
            <h3 className="text-base font-black text-[#17211b] mb-1">
              ยืนยันการลบเป้าหมาย "{deleteConfirmGoal.name}"?
            </h3>
            <p className="text-xs text-[#778178] mb-4">
              เป้าหมายนี้จะถูกลบออกจากระบบและไม่สามารถกู้คืนได้
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirmGoal(null)}
                className="px-4 py-2 bg-[#edf3ee] text-[#4b5563] text-xs font-semibold rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  onDeleteGoal(deleteConfirmGoal.id);
                  setDeleteConfirmGoal(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                ลบเป้าหมาย
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
