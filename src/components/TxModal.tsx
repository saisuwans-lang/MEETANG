import React, { useState } from 'react';
import { TxType, CategoryInfo, Transaction } from '../types';

interface TxModalProps {
  categories: CategoryInfo[];
  onClose: () => void;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
}

export const TxModal: React.FC<TxModalProps> = ({
  categories,
  onClose,
  onAddTransaction,
}) => {
  const [type, setType] = useState<TxType>('expense');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState(categories[0]?.name || 'อาหาร');
  const [dateType, setDateType] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (!name.trim() || isNaN(num) || num <= 0) return;

    let displayDate = 'วันนี้';
    let rawIsoDate = new Date().toISOString().slice(0, 10);

    if (dateType === 'yesterday') {
      displayDate = 'เมื่อวาน';
      const d = new Date();
      d.setDate(d.getDate() - 1);
      rawIsoDate = d.toISOString().slice(0, 10);
    } else if (dateType === 'custom') {
      const parts = customDate.split('-');
      if (parts.length === 3) {
        displayDate = `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}`;
      } else {
        displayDate = customDate;
      }
      rawIsoDate = customDate;
    }

    onAddTransaction({
      name: name.trim(),
      amount: num,
      type,
      cat: type === 'income' ? 'รายรับ' : cat,
      date: displayDate,
      rawDate: rawIsoDate,
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#e6ebe6] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black text-[#17211b]">บันทึกรายการ 💸</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg w-8 h-8 rounded-lg grid place-items-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Type Toggle: Expense vs Income */}
        <div className="grid grid-cols-2 p-1 bg-[#f1f5f1] rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-white text-[#d76d6d] shadow-xs'
                : 'text-[#778178] hover:text-[#17211b]'
            }`}
          >
            📉 รายจ่าย
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-white text-[#25502e] shadow-xs'
                : 'text-[#778178] hover:text-[#17211b]'
            }`}
          >
            📈 รายรับ
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Item Name */}
          <div>
            <label className="text-xs font-bold text-[#17211b] block mb-1">
              ชื่อรายการ
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder={type === 'expense' ? 'เช่น กาแฟลาเต้, ข้าวกะเพรา' : 'เช่น เงินเดือน, ค่าจ้างสอนพิเศษ'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-sm font-semibold text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-bold text-[#17211b] block mb-1">
              จำนวนเงิน (บาท)
            </label>
            <input
              type="number"
              min="0.5"
              step="any"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-lg font-black text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
            />
          </div>

          {/* Category Dropdown (Populated from dynamic Custom Categories!) */}
          {type === 'expense' && (
            <div>
              <label className="text-xs font-bold text-[#17211b] block mb-1">
                หมวดหมู่ (ดึงข้อมูลอัตโนมัติจากหมวดหมู่ของคุณ)
              </label>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-sm font-semibold text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
              >
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="text-xs font-bold text-[#17211b] block mb-1">
              วันที่
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setDateType('today')}
                className={`py-2 rounded-xl transition-all ${
                  dateType === 'today'
                    ? 'bg-[#18231c] text-white shadow-xs'
                    : 'bg-[#f1f5f1] text-[#4b5563]'
                }`}
              >
                วันนี้
              </button>
              <button
                type="button"
                onClick={() => setDateType('yesterday')}
                className={`py-2 rounded-xl transition-all ${
                  dateType === 'yesterday'
                    ? 'bg-[#18231c] text-white shadow-xs'
                    : 'bg-[#f1f5f1] text-[#4b5563]'
                }`}
              >
                เมื่อวาน
              </button>
              <button
                type="button"
                onClick={() => setDateType('custom')}
                className={`py-2 rounded-xl transition-all ${
                  dateType === 'custom'
                    ? 'bg-[#18231c] text-white shadow-xs'
                    : 'bg-[#f1f5f1] text-[#4b5563]'
                }`}
              >
                เลือกวันที่
              </button>
            </div>

            {dateType === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="mt-2 w-full px-3.5 py-2 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
              />
            )}
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-bold text-[#17211b] block mb-1">
              บันทึกย่อ (ไม่บังคับ)
            </label>
            <input
              type="text"
              placeholder="เช่น ร้านลุงหนวด, หารกับเพื่อน 3 คน"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-xs font-medium text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
            />
          </div>

          {/* Action buttons: Cancel / Save */}
          <div className="flex gap-2 justify-end pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#edf3ee] hover:bg-[#e1e9e2] text-[#4b5563] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#18231c] hover:bg-[#28382c] text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              บันทึกรายการ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
