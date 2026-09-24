import React, { useState } from 'react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: {
    name: string;
    target: number;
    saved: number;
    icon: string;
    deadline?: string;
  }) => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('0');
  const [icon, setIcon] = useState('🎯');
  const [deadline, setDeadline] = useState('');

  const icons = ['🎯', '🎧', '📷', '💻', '✈️', '🚗', '🏡', '🛡️', '🎓', '⌚', '📱', '🚲', '💍', '👶'];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const numTarget = Number(target);
    const numSaved = Number(saved) || 0;

    if (!trimmedName || isNaN(numTarget) || numTarget <= 0) {
      alert('กรุณากรอกชื่อเป้าหมายและจำนวนเงินเป้าหมายให้ถูกต้อง');
      return;
    }

    onSave({
      name: trimmedName,
      target: numTarget,
      saved: numSaved,
      icon,
      deadline: deadline || undefined,
    });

    setName('');
    setTarget('');
    setSaved('0');
    setDeadline('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] p-6 sm:p-7 max-w-[430px] w-full shadow-2xl border border-[#e6ebe6] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#17211b]">เพิ่มเป้าหมาย 🎯</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg w-8 h-8 rounded-lg grid place-items-center"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Icon Picker */}
          <div>
            <label className="text-xs font-semibold text-[#17211b] block mb-1.5">
              เลือกไอคอน
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-[#f9fbf9] border border-[#e6ebe6] rounded-xl">
              {icons.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-8 h-8 rounded-lg grid place-items-center text-lg transition-all ${
                    icon === ic ? 'bg-[#dff3e3] scale-110 shadow-xs' : 'hover:bg-gray-100'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="text-xs font-semibold text-[#17211b] block mb-1.5">
              ชื่อเป้าหมาย
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ซื้อกล้อง, เที่ยวญี่ปุ่น, เงินสำรองฉุกเฉิน"
              className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-sm font-medium text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="text-xs font-semibold text-[#17211b] block mb-1.5">
              จำนวนเงินเป้าหมาย (บาท)
            </label>
            <input
              type="number"
              min="1"
              step="any"
              required
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="25000"
              className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-base font-bold text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
            />
          </div>

          {/* Saved So Far */}
          <div>
            <label className="text-xs font-semibold text-[#17211b] block mb-1.5">
              เงินที่มีแล้ว (บาท)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={saved}
              onChange={(e) => setSaved(e.target.value)}
              placeholder="0"
              className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-sm font-medium text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="text-xs font-semibold text-[#17211b] block mb-1.5">
              เป้าหมายเวลา (ไม่บังคับ)
            </label>
            <input
              type="text"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="เช่น ธ.ค. 2569 หรือ ภายใน 6 เดือน"
              className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-sm font-medium text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#edf3ee] hover:bg-[#e1e9e2] text-[#4b5563] text-xs font-semibold rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#18231c] hover:bg-[#28382c] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
