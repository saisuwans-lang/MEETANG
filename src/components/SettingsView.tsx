import React, { useState } from 'react';
import { UserSettings, Transaction, Goal, BudgetMap, CategoryInfo } from '../types';
import { formatMoney } from '../data/initialData';

interface SettingsViewProps {
  settings: UserSettings;
  transactions: Transaction[];
  goals: Goal[];
  budgets: BudgetMap;
  categories: CategoryInfo[];
  onUpdateSettings: (settings: UserSettings) => void;
  onResetData: () => void;
  onClearAllData: () => void;
  onImportData: (data: {
    transactions: Transaction[];
    goals: Goal[];
    budgets: BudgetMap;
    categories: CategoryInfo[];
    settings: UserSettings;
  }) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  transactions,
  goals,
  budgets,
  categories,
  onUpdateSettings,
  onResetData,
  onClearAllData,
  onImportData,
}) => {
  const [userName, setUserName] = useState(settings.userName);
  const [savingsTarget, setSavingsTarget] = useState(String(settings.monthlySavingsTarget));
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modals for data management (ZERO prompt/window.confirm)
  const [showResetModal, setShowResetModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      userName: userName.trim() || 'MEETANG User',
      monthlySavingsTarget: Number(savingsTarget) || 5000,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const backupData = {
      version: 'MEETANG V5',
      exportDate: new Date().toISOString(),
      transactions,
      goals,
      budgets,
      categories,
      settings,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meetang_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import JSON Backup
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.transactions && parsed.categories && parsed.budgets && parsed.goals) {
          onImportData({
            transactions: parsed.transactions,
            goals: parsed.goals,
            budgets: parsed.budgets,
            categories: parsed.categories,
            settings: parsed.settings || settings,
          });
          alert('นำเข้าข้อมูลสำเร็จ!');
        } else {
          alert('รูปแบบไฟล์สำรองไม่ถูกต้อง');
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ JSON');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">⚙️</span>
          <h2 className="text-xl sm:text-2xl font-black text-[#17211b]">การตั้งค่า (Settings)</h2>
        </div>
        <p className="text-xs sm:text-[13px] text-[#778178]">
          จัดการโปรไฟล์ การสำรองข้อมูล และการรีเซ็ตระบบของ MEETANG
        </p>
      </div>

      {/* Profile & Financial Target */}
      <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs">
        <h3 className="text-base font-bold text-[#17211b] mb-4">ข้อมูลผู้ใช้และเป้าหมายเงินออม</h3>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-bold text-[#17211b] block mb-1.5">
              ชื่อผู้ใช้งาน
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-sm font-semibold text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#17211b] block mb-1.5">
              เป้าหมายเงินออมต่อเดือน (บาท)
            </label>
            <input
              type="number"
              min="0"
              step="100"
              value={savingsTarget}
              onChange={(e) => setSavingsTarget(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-sm font-semibold text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#18231c] hover:bg-[#28382c] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              บันทึกการตั้งค่า
            </button>
            {saveSuccess && (
              <span className="text-xs text-emerald-600 font-bold animate-in fade-in">
                ✓ บันทึกเรียบร้อย
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Data Management Section (Section 2 & 15) */}
      <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs">
        <h3 className="text-base font-bold text-[#17211b] mb-1">การจัดการข้อมูล (Data Management)</h3>
        <p className="text-xs text-[#778178] mb-5">
          ข้อมูลทั้งหมดจัดเก็บในเบราว์เซอร์ของคุณอย่างปลอดภัย คุณสามารถสำรองข้อมูลและรีเซ็ตได้ตลอดเวลา
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Backup / Export */}
          <div className="p-4 bg-[#fbfdfb] border border-[#edf1ed] rounded-2xl flex flex-col justify-between">
            <div>
              <div className="font-bold text-sm text-[#17211b] flex items-center gap-2 mb-1">
                <span>📦</span> สำรองข้อมูล (Export JSON)
              </div>
              <p className="text-xs text-[#778178]">
                ดาวน์โหลดไฟล์สำรองที่มีทั้งรายการ หมวดหมู่ งบประมาณ และเป้าหมายทั้งหมดของคุณ
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="mt-4 py-2 px-4 bg-[#f5f9f5] hover:bg-[#eaf4eb] text-[#25502e] border border-[#dff3e3] rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              ดาวน์โหลดไฟล์สำรอง JSON
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-4 bg-[#fbfdfb] border border-[#edf1ed] rounded-2xl flex flex-col justify-between">
            <div>
              <div className="font-bold text-sm text-[#17211b] flex items-center gap-2 mb-1">
                <span>📥</span> นำเข้าข้อมูล (Import JSON)
              </div>
              <p className="text-xs text-[#778178]">
                กู้คืนข้อมูลจากไฟล์ JSON สำรองที่เคยดาวน์โหลดไว้
              </p>
            </div>
            <label className="mt-4 py-2 px-4 bg-white hover:bg-gray-50 text-[#17211b] border border-[#e6ebe6] rounded-xl text-xs font-bold transition-colors text-center cursor-pointer">
              <span>เลือกไฟล์ JSON นำเข้า</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset Demo Data */}
          <div className="p-4 bg-[#fbfdfb] border border-[#edf1ed] rounded-2xl flex flex-col justify-between">
            <div>
              <div className="font-bold text-sm text-[#17211b] flex items-center gap-2 mb-1">
                <span>🔄</span> รีเซ็ตเป็นข้อมูลตัวอย่างเริ่มต้น
              </div>
              <p className="text-xs text-[#778178]">
                คืนค่าข้อมูลเป็นตัวอย่างเดือนกันยายน 2569 พร้อมหมวดหมู่และงบประมาณครบถ้วน
              </p>
            </div>
            <button
              onClick={() => setShowResetModal(true)}
              className="mt-4 py-2 px-4 bg-[#edf1ed] hover:bg-[#e2e8e3] text-[#4b5563] rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              รีเซ็ตข้อมูลตัวอย่าง
            </button>
          </div>

          {/* Clear All Data */}
          <div className="p-4 bg-rose-50/30 border border-rose-200 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="font-bold text-sm text-rose-700 flex items-center gap-2 mb-1">
                <span>🗑️</span> ล้างข้อมูลทั้งหมดในระบบ
              </div>
              <p className="text-xs text-[#778178]">
                ลบรายการธุรกรรมและเป้าหมายทั้งหมดเพื่อเริ่มต้นใช้งานใหม่แบบว่างเปล่า
              </p>
            </div>
            <button
              onClick={() => setShowClearModal(true)}
              className="mt-4 py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              ล้างข้อมูลทั้งหมด
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL: RESET DEMO DATA CONFIRMATION ================= */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl border border-[#e6ebe6] animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-[#f1f5f1] grid place-items-center text-xl mb-3">
              🔄
            </div>
            <h3 className="text-base font-black text-[#17211b] mb-1">
              ยืนยันการรีเซ็ตข้อมูลตัวอย่าง?
            </h3>
            <p className="text-xs text-[#778178] mb-4">
              ระบบจะรีเซ็ตรายการธุรกรรม หมวดหมู่ และงบประมาณกลับเป็นค่าเริ่มต้นของ MEETANG
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 bg-[#edf3ee] text-[#4b5563] text-xs font-semibold rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setShowResetModal(false);
                }}
                className="px-4 py-2 bg-[#18231c] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                ยืนยันการรีเซ็ต
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CLEAR ALL CONFIRMATION ================= */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 grid place-items-center text-xl mb-3">
              ⚠️
            </div>
            <h3 className="text-base font-black text-[#17211b] mb-1">
              ล้างข้อมูลทั้งหมดในระบบ?
            </h3>
            <p className="text-xs text-[#778178] mb-4">
              การกระทำนี้จะลบรายการและเป้าหมายทั้งหมดในเครื่องของคุณ ไม่สามารถกู้คืนได้
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 bg-[#edf3ee] text-[#4b5563] text-xs font-semibold rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  onClearAllData();
                  setShowClearModal(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                ล้างข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
