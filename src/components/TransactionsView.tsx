import React, { useState, useMemo } from 'react';
import { Transaction, CategoryInfo, TxType } from '../types';
import { formatMoney, getCategoryIcon } from '../data/initialData';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: CategoryInfo[];
  onOpenAddModal: () => void;
  onDeleteTransaction: (id: number) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  categories,
  onOpenAddModal,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterTime, setFilterTime] = useState<'all' | 'today' | '7d' | '30d' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // In-app Delete Confirmation Modal (ZERO window.confirm)
  const [deleteConfirmTx, setDeleteConfirmTx] = useState<Transaction | null>(null);

  // Filter & Search Logic (Section 9)
  const filteredList = useMemo(() => {
    const now = new Date();
    const todayIso = now.toISOString().slice(0, 10);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const sevenDaysIso = sevenDaysAgo.toISOString().slice(0, 10);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const thirtyDaysIso = thirtyDaysAgo.toISOString().slice(0, 10);

    return transactions.filter((tx) => {
      // 1. Search (Name, Cat, Note, Amount)
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = tx.name.toLowerCase().includes(q);
        const matchCat = tx.cat.toLowerCase().includes(q);
        const matchNote = tx.note?.toLowerCase().includes(q);
        const matchAmt = String(tx.amount).includes(q);
        if (!matchName && !matchCat && !matchNote && !matchAmt) {
          return false;
        }
      }

      // 2. Type Filter (all / income / expense)
      if (filterType !== 'all' && tx.type !== filterType) {
        return false;
      }

      // 3. Category Filter
      if (filterCat !== 'all' && tx.cat !== filterCat) {
        return false;
      }

      // 4. Time Filter (all / today / 7d / 30d / custom)
      if (filterTime === 'today') {
        const isToday = tx.date === 'วันนี้' || tx.rawDate === todayIso;
        if (!isToday) return false;
      } else if (filterTime === '7d') {
        if (tx.rawDate && tx.rawDate < sevenDaysIso) return false;
      } else if (filterTime === '30d') {
        if (tx.rawDate && tx.rawDate < thirtyDaysIso) return false;
      } else if (filterTime === 'custom') {
        if (customStartDate && tx.rawDate && tx.rawDate < customStartDate) return false;
        if (customEndDate && tx.rawDate && tx.rawDate > customEndDate) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return b.id - a.id;
      if (sortBy === 'oldest') return a.id - b.id;
      if (sortBy === 'highest') return b.amount - a.amount;
      if (sortBy === 'lowest') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, searchTerm, filterType, filterCat, filterTime, customStartDate, customEndDate, sortBy]);

  // Aggregates for filtered result
  const filteredIncome = filteredList
    .filter((x) => x.type === 'income')
    .reduce((s, x) => s + x.amount, 0);

  const filteredExpense = filteredList
    .filter((x) => x.type === 'expense')
    .reduce((s, x) => s + x.amount, 0);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID,ชื่อรายการ,ประเภท,หมวดหมู่,จำนวนเงิน,วันที่,บันทึกย่อ'];
    const rows = filteredList.map(
      (t) =>
        `${t.id},"${t.name}",${t.type === 'income' ? 'รายรับ' : 'รายจ่าย'},"${t.cat}",${t.amount},"${t.date}","${t.note || ''}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `meetang_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💸</span>
            <h2 className="text-xl sm:text-2xl font-black text-[#17211b]">
              รายการรายรับ-รายจ่าย
            </h2>
          </div>
          <p className="text-xs sm:text-[13px] text-[#778178] mt-1">
            ค้นหา กรอง และจัดการทุกรายการทางการเงินของคุณได้อย่างละเอียด
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-[#f5f9f5] hover:bg-[#eaf4eb] text-[#25502e] border border-[#dff3e3] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            title="ส่งออกไฟล์ CSV"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex-1 md:flex-none px-4 py-2.5 bg-[#18231c] hover:bg-[#28392d] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>＋</span>
            <span>บันทึกรายการ</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (Section 9) */}
      <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-5 shadow-xs space-y-3.5">
        {/* Search input */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="ค้นหาชื่อรายการ, หมวดหมู่, บันทึกย่อ หรือจำนวนเงิน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-xs sm:text-sm text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              ✕ ล้าง
            </button>
          )}
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Type Filter */}
          <div className="flex bg-[#f1f5f1] p-1 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 font-bold rounded-lg transition-all ${
                filterType === 'all' ? 'bg-white text-[#17211b] shadow-xs' : 'text-[#778178]'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1 font-bold rounded-lg transition-all ${
                filterType === 'income' ? 'bg-white text-[#25502e] shadow-xs' : 'text-[#778178]'
              }`}
            >
              รายรับ
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1 font-bold rounded-lg transition-all ${
                filterType === 'expense' ? 'bg-white text-[#d76d6d] shadow-xs' : 'text-[#778178]'
              }`}
            >
              รายจ่าย
            </button>
          </div>

          {/* Time Filter (All / Today / 7d / 30d / Custom) */}
          <div className="flex bg-[#f1f5f1] p-1 rounded-xl">
            <button
              onClick={() => setFilterTime('all')}
              className={`px-2.5 py-1 font-bold rounded-lg transition-all ${
                filterTime === 'all' ? 'bg-white text-[#17211b] shadow-xs' : 'text-[#778178]'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilterTime('today')}
              className={`px-2.5 py-1 font-bold rounded-lg transition-all ${
                filterTime === 'today' ? 'bg-white text-[#17211b] shadow-xs' : 'text-[#778178]'
              }`}
            >
              วันนี้
            </button>
            <button
              onClick={() => setFilterTime('7d')}
              className={`px-2.5 py-1 font-bold rounded-lg transition-all ${
                filterTime === '7d' ? 'bg-white text-[#17211b] shadow-xs' : 'text-[#778178]'
              }`}
            >
              7 วัน
            </button>
            <button
              onClick={() => setFilterTime('30d')}
              className={`px-2.5 py-1 font-bold rounded-lg transition-all ${
                filterTime === '30d' ? 'bg-white text-[#17211b] shadow-xs' : 'text-[#778178]'
              }`}
            >
              30 วัน
            </button>
            <button
              onClick={() => setFilterTime('custom')}
              className={`px-2.5 py-1 font-bold rounded-lg transition-all ${
                filterTime === 'custom' ? 'bg-white text-[#17211b] shadow-xs' : 'text-[#778178]'
              }`}
            >
              กำหนดเอง
            </button>
          </div>

          {/* Category Dropdown Filter */}
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="px-2.5 py-1.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-[#17211b] font-medium"
          >
            <option value="all">ทุกหมวดหมู่</option>
            <option value="รายรับ">💼 รายรับ</option>
            {categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-[#17211b] font-medium ml-auto"
          >
            <option value="newest">ล่าสุดก่อน</option>
            <option value="oldest">เก่าสุดก่อน</option>
            <option value="highest">จำนวนเงิน: มาก → น้อย</option>
            <option value="lowest">จำนวนเงิน: น้อย → มาก</option>
          </select>
        </div>

        {/* Custom date range picker if custom selected */}
        {filterTime === 'custom' && (
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="text-[#778178]">ตั้งแต่วันที่:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl"
            />
            <span className="text-[#778178]">ถึง:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl"
            />
          </div>
        )}

        {/* Summary badge of filtered query */}
        <div className="flex justify-between items-center text-xs text-[#778178] pt-2 border-t border-[#f0f4f0]">
          <span>พบ {filteredList.length} รายการ</span>
          <div className="flex gap-3">
            <span className="text-[#25502e] font-semibold">
              รับ: +{formatMoney(filteredIncome)}
            </span>
            <span className="text-[#d76d6d] font-semibold">
              จ่าย: −{formatMoney(filteredExpense)}
            </span>
            <span className="font-bold text-[#17211b]">
              สุทธิ: {formatMoney(filteredIncome - filteredExpense)}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-5 sm:p-6 shadow-xs">
        {filteredList.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">🔍</div>
            <div className="text-sm font-bold text-[#17211b]">ไม่พบรายการที่ตรงกับเงื่อนไข</div>
            <p className="text-xs text-[#778178] mt-1">
              ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองช่วงเวลาอื่น
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#e6ebe6]">
            {filteredList.map((tx) => {
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3.5 px-2 hover:bg-[#fafcfa] rounded-xl transition-colors group"
                >
                  {/* Left: Icon & Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-[#f1f5f1] grid place-items-center text-xl shrink-0 shadow-2xs">
                      {getCategoryIcon(tx.cat, categories)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#17211b] truncate">{tx.name}</span>
                        {tx.note && (
                          <span
                            className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md truncate max-w-[120px]"
                            title={tx.note}
                          >
                            💬 {tx.note}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#778178] flex items-center gap-2 mt-0.5">
                        <span>{tx.date}</span>
                        <span>·</span>
                        <span className="bg-[#f0f4f0] px-2 py-0.5 rounded-full text-[11px] font-medium text-[#25502e]">
                          {tx.cat}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Delete Button */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div
                      className={`text-base font-extrabold ${
                        isIncome ? 'text-[#3b9660]' : 'text-[#d76d6d]'
                      }`}
                    >
                      {isIncome ? '+' : '−'} {formatMoney(tx.amount)}
                    </div>

                    <button
                      onClick={() => setDeleteConfirmTx(tx)}
                      className="opacity-60 group-hover:opacity-100 text-gray-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-all cursor-pointer"
                      title="ลบรายการนี้"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= IN-APP DELETE MODAL (ZERO window.confirm) ================= */}
      {deleteConfirmTx && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 grid place-items-center text-xl mb-3">
              🗑️
            </div>
            <h3 className="text-base font-black text-[#17211b] mb-1">ยืนยันการลบรายการ?</h3>
            <p className="text-xs text-[#778178] mb-4">
              คุณต้องการลบรายการ "{deleteConfirmTx.name}" ({formatMoney(deleteConfirmTx.amount)}) ใช่หรือไม่?
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirmTx(null)}
                className="px-4 py-2 bg-[#edf3ee] text-[#4b5563] text-xs font-semibold rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  onDeleteTransaction(deleteConfirmTx.id);
                  setDeleteConfirmTx(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                ลบรายการ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
