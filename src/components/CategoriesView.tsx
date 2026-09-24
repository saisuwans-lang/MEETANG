import React, { useState } from 'react';
import { CategoryInfo, Transaction, BudgetMap } from '../types';
import { AVAILABLE_EMOJIS, formatMoney } from '../data/initialData';

interface CategoriesViewProps {
  categories: CategoryInfo[];
  transactions: Transaction[];
  budgets: BudgetMap;
  onAddCategory: (name: string, icon: string) => void;
  onEditCategory: (oldName: string, newName: string, icon: string) => void;
  onDeleteCategoryWithOption: (name: string, migrateToOther: boolean) => void;
  onOpenBudgetForCategory: (catName: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  transactions,
  budgets,
  onAddCategory,
  onEditCategory,
  onDeleteCategoryWithOption,
  onOpenBudgetForCategory,
}) => {
  // Modal states (Strictly in-app modals, ZERO prompt())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModalCategory, setEditModalCategory] = useState<CategoryInfo | null>(null);
  const [deleteWarningCategory, setDeleteWarningCategory] = useState<{
    cat: CategoryInfo;
    txCount: number;
  } | null>(null);

  // Form states for Add Modal
  const [addName, setAddName] = useState('');
  const [addIcon, setAddIcon] = useState('🍜');
  const [addError, setAddError] = useState('');

  // Form states for Edit Modal
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editError, setEditError] = useState('');

  // Compute spent amount per category
  const catExpenses: Record<string, number> = {};
  transactions
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      catExpenses[tx.cat] = (catExpenses[tx.cat] || 0) + tx.amount;
    });

  // Handle Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = addName.trim();
    if (!trimmed) {
      setAddError('กรุณากรอกชื่อหมวดหมู่');
      return;
    }
    const exists = categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setAddError(`หมวดหมู่ "${trimmed}" มีอยู่ในระบบแล้ว`);
      return;
    }

    onAddCategory(trimmed, addIcon);
    setAddName('');
    setAddIcon('🍜');
    setAddError('');
    setIsAddModalOpen(false);
  };

  // Open Edit Modal
  const openEditModal = (cat: CategoryInfo) => {
    setEditModalCategory(cat);
    setEditName(cat.name);
    setEditIcon(cat.icon);
    setEditError('');
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalCategory) return;
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditError('กรุณากรอกชื่อหมวดหมู่');
      return;
    }
    if (
      trimmed.toLowerCase() !== editModalCategory.name.toLowerCase() &&
      categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      setEditError(`หมวดหมู่ "${trimmed}" มีอยู่ในระบบแล้ว`);
      return;
    }

    onEditCategory(editModalCategory.name, trimmed, editIcon);
    setEditModalCategory(null);
  };

  // Open Delete Modal or Trigger Warning
  const initiateDelete = (cat: CategoryInfo) => {
    // Count transactions in this category
    const count = transactions.filter((t) => t.cat === cat.name).length;
    setDeleteWarningCategory({ cat, txCount: count });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏷️</span>
            <h2 className="text-xl sm:text-2xl font-black text-[#17211b]">หมวดหมู่ของฉัน</h2>
          </div>
          <p className="text-xs sm:text-[13px] text-[#778178] mt-1">
            ปรับแต่งหมวดหมู่ให้เข้ากับไลฟ์สไตล์ของคุณ หมวดที่สร้างใหม่จะนำไปใช้บันทึกรายรับ-รายจ่ายได้ทันที
          </p>
          <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 bg-[#f5f9f5] border border-[#dff3e3] rounded-full text-xs font-bold text-[#25502e]">
            หมวดหมู่ทั้งหมด: {categories.length} หมวด
          </div>
        </div>

        <button
          onClick={() => {
            setAddName('');
            setAddIcon('🍜');
            setAddError('');
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 bg-[#18231c] hover:bg-[#25392b] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <span className="text-base">＋</span>
          <span>เพิ่มหมวดหมู่</span>
        </button>
      </div>

      {/* Category Cards Grid (Requirement 14) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[18px]">
        {categories.map((cat) => {
          const spent = catExpenses[cat.name] || 0;
          const budget = budgets[cat.name] || 0;
          const percent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
          const isOver = percent > 100;
          const isWarning = percent >= 80 && percent <= 100;

          return (
            <div
              key={cat.name}
              className={`bg-white border rounded-[22px] p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                isOver ? 'border-rose-300 ring-1 ring-rose-200' : 'border-[#e6ebe6]'
              }`}
            >
              <div>
                {/* Category Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#f1f5f1] grid place-items-center text-2xl shadow-2xs">
                    {cat.icon}
                  </div>
                  {budget > 0 ? (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        isOver
                          ? 'bg-rose-100 text-rose-800'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#dff3e3] text-[#25502e]'
                      }`}
                    >
                      {isOver ? 'เกินงบ' : `${percent}%`}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      ยังไม่ตั้งงบ
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-base font-bold text-[#17211b] truncate mb-2">
                  {cat.name}
                </h3>

                {/* Spending & Budget details */}
                <div className="space-y-1.5 text-xs text-[#778178] bg-[#fafcfa] p-3 rounded-xl border border-[#f0f4f0]">
                  <div className="flex justify-between">
                    <span>ใช้ไปแล้ว:</span>
                    <strong className="text-[#17211b] font-bold">{formatMoney(spent)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>งบประมาณ:</span>
                    <span className="font-semibold text-[#17211b]">
                      {budget > 0 ? formatMoney(budget) : 'ไม่ได้กำหนด'}
                    </span>
                  </div>
                  {budget > 0 && (
                    <div className="h-1.5 w-full bg-[#edf1ed] rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          isOver ? 'bg-[#e98181]' : isWarning ? 'bg-[#ffd86b]' : 'bg-[#8fd19d]'
                        }`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: [แก้ไข] [ลบ] */}
              <div className="mt-4 pt-3 border-t border-[#f0f4f0] flex items-center gap-2">
                <button
                  onClick={() => openEditModal(cat)}
                  className="flex-1 py-1.5 px-2.5 bg-[#f5f9f5] hover:bg-[#eaf4eb] text-[#25502e] text-xs font-bold rounded-xl transition-colors text-center"
                >
                  ✏️ แก้ไข
                </button>
                <button
                  onClick={() => initiateDelete(cat)}
                  className="py-1.5 px-3 bg-white hover:bg-rose-50 text-rose-500 border border-rose-200 text-xs font-semibold rounded-xl transition-colors text-center"
                  title="ลบหมวดหมู่นี้"
                >
                  🗑️ ลบ
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= MODAL 1: ADD CATEGORY ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 sm:p-7 max-w-[420px] w-full shadow-2xl border border-[#e6ebe6] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-[#17211b]">เพิ่มหมวดหมู่ 🏷️</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg w-8 h-8 rounded-lg grid place-items-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="text-xs font-bold text-[#17211b] block mb-1.5">
                  ชื่อหมวดหมู่
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={addName}
                  onChange={(e) => {
                    setAddName(e.target.value);
                    setAddError('');
                  }}
                  placeholder="เช่น ค่ากาแฟ, ค่าฟิตเนส, ของใช้ในบ้าน"
                  className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-sm font-semibold text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
                />
                {addError && <div className="text-xs text-rose-500 mt-1 font-medium">{addError}</div>}
              </div>

              {/* Icon Selector Grid */}
              <div>
                <label className="text-xs font-bold text-[#17211b] block mb-1.5">
                  เลือกไอคอน Emoji
                </label>
                <div className="grid grid-cols-6 gap-2 p-2.5 bg-[#f9fbf9] border border-[#e6ebe6] rounded-xl max-h-[160px] overflow-y-auto">
                  {AVAILABLE_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAddIcon(emoji)}
                      className={`h-10 rounded-xl grid place-items-center text-xl transition-all ${
                        addIcon === emoji
                          ? 'bg-[#dff3e3] border-2 border-[#8fd19d] scale-105 shadow-2xs'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-2 p-2.5 bg-[#f5f9f5] rounded-xl border border-[#dff3e3] text-xs text-[#25502e]">
                <span className="text-xl">{addIcon}</span>
                <span>
                  ตัวอย่าง: <b>{addName || 'ชื่อหมวดหมู่'}</b>
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-[#edf3ee] hover:bg-[#e1e9e2] text-[#4b5563] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#18231c] hover:bg-[#28382c] text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  เพิ่มหมวดหมู่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: EDIT CATEGORY ================= */}
      {editModalCategory && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 sm:p-7 max-w-[420px] w-full shadow-2xl border border-[#e6ebe6] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-[#17211b]">แก้ไขหมวดหมู่ ✏️</h3>
              <button
                onClick={() => setEditModalCategory(null)}
                className="text-gray-400 hover:text-gray-600 text-lg w-8 h-8 rounded-lg grid place-items-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#17211b] block mb-1.5">
                  ชื่อหมวดหมู่
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    setEditError('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-sm font-semibold text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
                />
                {editError && <div className="text-xs text-rose-500 mt-1 font-medium">{editError}</div>}
              </div>

              <div>
                <label className="text-xs font-bold text-[#17211b] block mb-1.5">
                  เลือกไอคอน Emoji
                </label>
                <div className="grid grid-cols-6 gap-2 p-2.5 bg-[#f9fbf9] border border-[#e6ebe6] rounded-xl max-h-[160px] overflow-y-auto">
                  {AVAILABLE_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setEditIcon(emoji)}
                      className={`h-10 rounded-xl grid place-items-center text-xl transition-all ${
                        editIcon === emoji
                          ? 'bg-[#dff3e3] border-2 border-[#8fd19d] scale-105 shadow-2xs'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setEditModalCategory(null)}
                  className="px-4 py-2.5 bg-[#edf3ee] hover:bg-[#e1e9e2] text-[#4b5563] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#18231c] hover:bg-[#28382c] text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: DELETE WARNING MODAL (NO prompt/confirm) ================= */}
      {deleteWarningCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 sm:p-7 max-w-[440px] w-full shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 text-2xl grid place-items-center mb-3">
              ⚠️
            </div>
            <h3 className="text-lg font-black text-[#17211b] mb-1">
              ยืนยันการลบหมวดหมู่ "{deleteWarningCategory.cat.icon} {deleteWarningCategory.cat.name}"
            </h3>

            {deleteWarningCategory.txCount > 0 ? (
              <div className="text-xs sm:text-[13px] text-[#4b5563] space-y-2.5 my-3">
                <p>
                  หมวดหมู่นี้มีรายการธุรกรรมอยู่ทั้งหมด{' '}
                  <b className="text-rose-600">{deleteWarningCategory.txCount} รายการ</b>
                </p>
                <p className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-800 text-xs">
                  คุณต้องการย้ายรายการธุรกรรมเหล่านี้ไปยังหมวด <b>"อื่น ๆ"</b> หรือไม่ เพื่อป้องกันข้อมูลสูญหาย
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#778178] my-3">
                หมวดหมู่นี้ไม่มีรายการธุรกรรมค้างอยู่ คุณสามารถลบออกได้อย่างปลอดภัย
              </p>
            )}

            <div className="flex flex-col gap-2 pt-2">
              {deleteWarningCategory.txCount > 0 ? (
                <>
                  <button
                    onClick={() => {
                      onDeleteCategoryWithOption(deleteWarningCategory.cat.name, true);
                      setDeleteWarningCategory(null);
                    }}
                    className="w-full py-2.5 bg-[#18231c] hover:bg-[#28382c] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    📦 ย้าย {deleteWarningCategory.txCount} รายการไปหมวด "อื่น ๆ" แล้วลบ
                  </button>
                  <button
                    onClick={() => {
                      onDeleteCategoryWithOption(deleteWarningCategory.cat.name, false);
                      setDeleteWarningCategory(null);
                    }}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    🗑️ ลบหมวดหมู่พร้อมลบ {deleteWarningCategory.txCount} รายการ
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onDeleteCategoryWithOption(deleteWarningCategory.cat.name, false);
                    setDeleteWarningCategory(null);
                  }}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  ยืนยันการลบ
                </button>
              )}

              <button
                onClick={() => setDeleteWarningCategory(null)}
                className="w-full py-2.5 bg-[#edf3ee] hover:bg-[#e1e9e2] text-[#4b5563] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
