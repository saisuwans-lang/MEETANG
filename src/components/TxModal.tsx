import React, { useState } from 'react';
import { TxType, CategoryInfo } from '../types';

interface TxModalProps {
  isOpen: boolean;
  categories: CategoryInfo[];
  onClose: () => void;
  onSave: (tx: {
    name: string;
    amount: number;
    type: TxType;
    cat: string;
    date: string;
    note?: string;
  }) => void;
  onNavigateToSmart: () => void;
}

export const TxModal: React.FC<TxModalProps> = ({
  isOpen,
  categories,
  onClose,
  onSave,
  onNavigateToSmart,
}) => {
  const [type, setType] = useState<TxType>('expense');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState(categories[0]?.name || 'อาหาร');
  const [dateType, setDateType] = useState('วันนี้');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const numAmount = Number(amount);

    if (!trimmedName || isNaN(numAmount) || numAmount <= 0) {
      alert('กรุณากรอกชื่อรายการและจำนวนเงินให้ถูกต้อง');
      return;
    }

    onSave({
      name: trimmedName,
      amount: numAmount,
      type,
      cat: type === 'income' ? 'รายรับ' : cat,
      date: dateType,
    });

    setName('');
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] p-6 sm:p-7 max-w-[430px] w-full shadow-2xl border border-[#e6ebe6] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#17211b]">เพิ่มรายการ 💸</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg w-8 h-8 rounded-lg grid place-items-center"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selector Tabs */}
          <div>
            <label className="text-xs font-semibold text-[#17211b] block mb-1.5">ประเภท</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#f5f7f3] rounded-xl border border-[#e6ebe6]">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  type === 'expense'
                    ? 'bg-white text-[#d76d6d] shadow-xs'
                    : 'text-[#69736b] hover:text-[#17211b]'
                }`}
              >
                📉 รายจ่าย
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  type === 'income'
                    ? 'bg-white text-[#3b9660] shadow-xs'
                    : 'text-[#69736b] hover:text-[#17211b]'
                }`}
              >
                📈 รายรับ
              </button>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="text-xs font-semibold text-[#17211b] block mb-1.5">
              ชื่อรายการ
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'expense' ? 'เช่น ค่าอาหาร, ค่าน้ำมัน' : 'เช่น เงินเดือน, ขายของ'}
              className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-sm font-medium text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
            />
          </div>

          {/* Amount Field */}
          <div>
            <label className="text-xs font-semibold text-[#17211b] block mb-1.5">
              จำนวนเงิน (บาท)
            </label>
            <input
              type="number"
              min="1"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="80"
              className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-base font-bold text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
            />
          </div>

          {/* Category Field (if expense) */}
          {type === 'expense' && (
            <div>
              <label className="text-xs font-semibold text-[#17211b] block mb-1.5">
                หมวดหมู่
              </label>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-sm text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
              >
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#778178]">
                <span>ต้องการหมวดใหม่?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToSmart();
                  }}
                  className="text-[#25502e] font-bold hover:underline"
                >
                  ไปที่ ✨ Smart Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Date Selector */}
          <div>
            <label className="text-xs font-semibold text-[#17211b] block mb-1.5">วันที่</label>
            <select
              value={dateType}
              onChange={(e) => setDateType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-sm text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
            >
              <option value="วันนี้">วันนี้</option>
              <option value="เมื่อวาน">เมื่อวาน</option>
              <option value="23 ก.ย.">23 ก.ย.</option>
              <option value="22 ก.ย.">22 ก.ย.</option>
              <option value="21 ก.ย.">21 ก.ย.</option>
              <option value="20 ก.ย.">20 ก.ย.</option>
            </select>
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
