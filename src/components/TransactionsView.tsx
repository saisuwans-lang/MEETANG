import React, { useState, useMemo } from 'react';
import { Transaction, CategoryInfo } from '../types';
import { formatMoney, getCategoryIcon } from '../data/initialData';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: CategoryInfo[];
  onDeleteTx: (id: number) => void;
  onOpenAddModal: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  categories,
  onDeleteTx,
  onOpenAddModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount-desc' | 'amount-asc'>('date');

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchesType = typeFilter === 'all' || tx.type === typeFilter;
        const matchesCat = categoryFilter === 'all' || tx.cat === categoryFilter;
        const matchesSearch =
          searchTerm.trim() === '' ||
          (tx.name + ' ' + tx.cat + ' ' + (tx.note || '')).toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesCat && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return b.id - a.id; // default newest first
      });
  }, [transactions, searchTerm, typeFilter, categoryFilter, sortBy]);

  const totalFilteredAmount = filteredTransactions.reduce(
    (acc, tx) => (tx.type === 'income' ? acc + tx.amount : acc - tx.amount),
    0
  );

  const handleExportCSV = () => {
    const headers = ['ID', 'ชื่อรายการ', 'หมวดหมู่', 'ประเภท', 'จำนวนเงิน', 'วันที่'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      `"${t.name.replace(/"/g, '""')}"`,
      `"${t.cat}"`,
      t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      t.amount,
      `"${t.date}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MEETANG_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#778178]">
              🔎
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหารายการ, หมวดหมู่..."
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#e6ebe6] rounded-xl text-xs sm:text-sm text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2.5 bg-white border border-[#e6ebe6] rounded-xl text-xs sm:text-sm text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
          >
            <option value="all">ทั้งหมด (รายรับ-จ่าย)</option>
            <option value="income">เฉพาะ รายรับ</option>
            <option value="expense">เฉพาะ รายจ่าย</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 bg-white border border-[#e6ebe6] rounded-xl text-xs sm:text-sm text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
          >
            <option value="all">ทุกหมวดหมู่</option>
            {categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2.5 bg-white border border-[#e6ebe6] rounded-xl text-xs sm:text-sm text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
          >
            <option value="date">เรียง: ล่าสุดก่อน</option>
            <option value="amount-desc">จำนวน: มากไปน้อย</option>
            <option value="amount-asc">จำนวน: น้อยไปมาก</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            title="ดาวน์โหลดไฟล์ CSV"
            className="px-3 py-2.5 bg-white hover:bg-[#f5f7f3] border border-[#e6ebe6] text-[#69736b] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-2.5 bg-[#18231c] hover:bg-[#25382c] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <span>＋</span>
            <span>เพิ่มรายการ</span>
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/70 border border-[#e6ebe6] rounded-xl text-xs text-[#778178]">
        <span>
          พบทั้งหมด <strong className="text-[#17211b]">{filteredTransactions.length}</strong> รายการ
        </span>
        <span>
          ผลรวมตามตัวกรอง:{' '}
          <strong className={totalFilteredAmount >= 0 ? 'text-[#3b9660]' : 'text-[#d76d6d]'}>
            {totalFilteredAmount >= 0 ? '+' : ''}
            {formatMoney(totalFilteredAmount)}
          </strong>
        </span>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-[#e6ebe6] rounded-[20px] overflow-hidden shadow-xs">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-5 py-3.5 bg-[#f8faf8] text-xs font-semibold text-[#778178] border-b border-[#e6ebe6]">
          <span className="col-span-5 sm:col-span-4">รายการ</span>
          <span className="col-span-3 sm:col-span-3">หมวดหมู่</span>
          <span className="hidden sm:block sm:col-span-2">วันที่</span>
          <span className="col-span-3 sm:col-span-2 text-right">จำนวน</span>
          <span className="col-span-1 text-right"></span>
        </div>

        {/* Table Body */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 text-[#778178]">
            <div className="text-3xl mb-2">🔍</div>
            <div className="font-semibold text-sm">ไม่พบรายการที่ค้นหา</div>
            <div className="text-xs text-[#9bb09f] mt-1">ลองเปลี่ยนคำค้นหรือตัวกรอง</div>
          </div>
        ) : (
          <div className="divide-y divide-[#e6ebe6]">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  className="grid grid-cols-12 gap-2 px-5 py-3.5 items-center hover:bg-[#fafbfa] transition-colors text-xs sm:text-[13px]"
                >
                  {/* Name + Icon */}
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#f1f5f1] grid place-items-center text-base shrink-0">
                      {getCategoryIcon(tx.cat, categories)}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-[#17211b] truncate">{tx.name}</div>
                      <div className="sm:hidden text-[10px] text-[#778178]">{tx.date}</div>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="col-span-3 sm:col-span-3">
                    <span className="inline-flex items-center gap-1 bg-[#f1f5f1] px-2 py-0.5 rounded-full text-[11px] font-medium text-[#4b5563]">
                      {tx.cat}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="hidden sm:block sm:col-span-2 text-[#778178] text-xs">
                    {tx.date}
                  </div>

                  {/* Amount */}
                  <div
                    className={`col-span-3 sm:col-span-2 text-right font-extrabold ${
                      isIncome ? 'text-[#3b9660]' : 'text-[#d76d6d]'
                    }`}
                  >
                    {isIncome ? '+' : '−'} {formatMoney(tx.amount)}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 text-right">
                    <button
                      onClick={() => {
                        if (window.confirm(`ยืนยันการลบรายการ "${tx.name}"?`)) {
                          onDeleteTx(tx.id);
                        }
                      }}
                      title="ลบรายการ"
                      className="p-1.5 text-xs text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
