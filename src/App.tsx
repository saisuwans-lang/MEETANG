import React, { useState, useEffect } from 'react';
import { PageId, Transaction, Goal, BudgetMap, CategoryInfo, UserSettings } from './types';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_GOALS,
  INITIAL_BUDGETS,
  DEFAULT_CATEGORIES,
  INITIAL_SETTINGS,
  STORAGE_KEYS,
  loadData,
  saveData,
  resetAllData,
} from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { AnalysisView } from './components/AnalysisView';
import { GoalsView } from './components/GoalsView';
import { BudgetView } from './components/BudgetView';
import { CategoriesView } from './components/CategoriesView';
import { MeetangAIView } from './components/MeetangAIView';
import { SettingsView } from './components/SettingsView';
import { TxModal } from './components/TxModal';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>('กันยายน 2569');

  // 1. Transactions State with LocalStorage
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadData(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS)
  );

  // 2. Goals State with LocalStorage
  const [goals, setGoals] = useState<Goal[]>(() =>
    loadData(STORAGE_KEYS.GOALS, INITIAL_GOALS)
  );

  // 3. Budgets State with LocalStorage
  const [budgets, setBudgets] = useState<BudgetMap>(() =>
    loadData(STORAGE_KEYS.BUDGETS, INITIAL_BUDGETS)
  );

  // 4. Categories State with LocalStorage
  const [categories, setCategories] = useState<CategoryInfo[]>(() =>
    loadData(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES)
  );

  // 5. Settings State with LocalStorage
  const [settings, setSettings] = useState<UserSettings>(() =>
    loadData(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS)
  );

  // Modal & Toast states
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Sync state changes to LocalStorage
  useEffect(() => {
    saveData(STORAGE_KEYS.TRANSACTIONS, transactions);
  }, [transactions]);

  useEffect(() => {
    saveData(STORAGE_KEYS.GOALS, goals);
  }, [goals]);

  useEffect(() => {
    saveData(STORAGE_KEYS.BUDGETS, budgets);
  }, [budgets]);

  useEffect(() => {
    saveData(STORAGE_KEYS.CATEGORIES, categories);
  }, [categories]);

  useEffect(() => {
    saveData(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  // ================= TRANSACTION ACTIONS =================
  const handleAddTx = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      id: Date.now(),
      ...newTxData,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`บันทึก "${newTx.name}" (${newTx.amount.toLocaleString('th-TH')} บาท) เรียบร้อย`);
  };

  const handleDeleteTx = (id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('ลบรายการเรียบร้อยแล้ว');
  };

  // ================= GOAL ACTIONS =================
  const handleAddGoal = (goalData: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      id: Date.now(),
      ...goalData,
    };
    setGoals((prev) => [...prev, newGoal]);
    showToast(`สร้างเป้าหมาย "${newGoal.name}" สำเร็จ`);
  };

  const handleDepositGoal = (goalId: number, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, saved: g.saved + amount } : g))
    );
    showToast(`หยอดกระปุกสำเร็จ +฿${amount.toLocaleString('th-TH')}`);
  };

  const handleDeleteGoal = (goalId: number) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    showToast('ลบเป้าหมายเรียบร้อยแล้ว');
  };

  // ================= BUDGET ACTIONS =================
  const handleUpdateBudget = (category: string, amount: number) => {
    setBudgets((prev) => ({
      ...prev,
      [category]: amount,
    }));
    showToast(`ตั้งงบหมวด "${category}" เป็น ฿${amount.toLocaleString('th-TH')}`);
  };

  const handleApplyAllRecommendations = (newBudgets: BudgetMap) => {
    setBudgets(newBudgets);
    showToast('ปรับใช้งบประมาณแนะนำทั้งหมดเรียบร้อย');
  };

  // ================= CATEGORY ACTIONS (Section 1 & 14) =================
  const handleAddCategory = (name: string, icon: string) => {
    const newCat: CategoryInfo = { name, icon, isDefault: false };
    setCategories((prev) => [...prev, newCat]);
    if (!budgets[name]) {
      setBudgets((prev) => ({ ...prev, [name]: 1200 }));
    }
    showToast(`เพิ่มหมวดหมู่ "${icon} ${name}" สำเร็จแล้ว`);
  };

  const handleEditCategory = (oldName: string, newName: string, icon: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.name === oldName ? { ...c, name: newName, icon } : c))
    );

    // Update transactions with this category
    if (oldName !== newName) {
      setTransactions((prev) =>
        prev.map((tx) => (tx.cat === oldName ? { ...tx, cat: newName } : tx))
      );
      // Transfer budget
      setBudgets((prev) => {
        const next = { ...prev };
        if (next[oldName] !== undefined) {
          next[newName] = next[oldName];
          delete next[oldName];
        }
        return next;
      });
    }

    showToast(`แก้ไขหมวดหมู่ "${newName}" เรียบร้อยแล้ว`);
  };

  // Delete Category with warning option: migrate to "อื่น ๆ" or delete all transactions
  const handleDeleteCategoryWithOption = (name: string, migrateToOther: boolean) => {
    if (migrateToOther) {
      setTransactions((prev) =>
        prev.map((tx) => (tx.cat === name ? { ...tx, cat: 'อื่น ๆ' } : tx))
      );
    } else {
      setTransactions((prev) => prev.filter((tx) => tx.cat !== name));
    }

    // Remove category
    setCategories((prev) => prev.filter((c) => c.name !== name));

    // Remove category budget
    setBudgets((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });

    showToast(
      migrateToOther
        ? `ลบหมวด "${name}" และย้ายรายการไปหมวด "อื่น ๆ" เรียบร้อย`
        : `ลบหมวด "${name}" เรียบร้อยแล้ว`
    );
  };

  // ================= DATA & SETTINGS ACTIONS =================
  const handleResetData = () => {
    resetAllData();
    setTransactions(INITIAL_TRANSACTIONS);
    setGoals(INITIAL_GOALS);
    setBudgets(INITIAL_BUDGETS);
    setCategories(DEFAULT_CATEGORIES);
    setSettings(INITIAL_SETTINGS);
    showToast('รีเซ็ตข้อมูลตัวอย่างเป็นค่าเริ่มต้นเรียบร้อยแล้ว');
  };

  const handleClearAllData = () => {
    resetAllData();
    setTransactions([]);
    setGoals([]);
    setBudgets({});
    showToast('ล้างข้อมูลทั้งหมดในระบบเรียบร้อย');
  };

  const handleImportData = (data: {
    transactions: Transaction[];
    goals: Goal[];
    budgets: BudgetMap;
    categories: CategoryInfo[];
    settings: UserSettings;
  }) => {
    setTransactions(data.transactions);
    setGoals(data.goals);
    setBudgets(data.budgets);
    setCategories(data.categories);
    setSettings(data.settings);
    showToast('นำเข้าข้อมูลสำเร็จแล้ว');
  };

  return (
    <div className="min-h-screen bg-[#f5f7f3] text-[#17211b] flex flex-col md:flex-row relative selection:bg-[#8fd19d] selection:text-[#18231c]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        onOpenTxModal={() => setIsTxModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[240px] p-4 sm:p-7 md:p-8 max-w-[1440px] w-full min-h-screen pb-24 md:pb-8">
        <Header
          currentPage={currentPage}
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
          onResetData={handleResetData}
          userName={settings.userName}
          onNavigate={setCurrentPage}
        />

        {/* View Routing */}
        {currentPage === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            goals={goals}
            budgets={budgets}
            categories={categories}
            onNavigate={setCurrentPage}
            onOpenTxModal={() => setIsTxModalOpen(true)}
            onOpenGoalModal={() => setCurrentPage('goals')}
          />
        )}

        {currentPage === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            categories={categories}
            onOpenAddModal={() => setIsTxModalOpen(true)}
            onDeleteTransaction={handleDeleteTx}
          />
        )}

        {currentPage === 'analysis' && (
          <AnalysisView
            transactions={transactions}
            goals={goals}
            budgets={budgets}
            categories={categories}
          />
        )}

        {currentPage === 'goals' && (
          <GoalsView
            goals={goals}
            onAddGoal={handleAddGoal}
            onDeposit={handleDepositGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        )}

        {currentPage === 'budget' && (
          <BudgetView
            transactions={transactions}
            budgets={budgets}
            categories={categories}
            onUpdateBudget={handleUpdateBudget}
            onApplyAllRecommendations={handleApplyAllRecommendations}
          />
        )}

        {currentPage === 'categories' && (
          <CategoriesView
            categories={categories}
            transactions={transactions}
            budgets={budgets}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategoryWithOption={handleDeleteCategoryWithOption}
            onOpenBudgetForCategory={() => setCurrentPage('budget')}
          />
        )}

        {currentPage === 'ai' && (
          <MeetangAIView
            transactions={transactions}
            goals={goals}
            budgets={budgets}
            categories={categories}
          />
        )}

        {currentPage === 'settings' && (
          <SettingsView
            settings={settings}
            transactions={transactions}
            goals={goals}
            budgets={budgets}
            categories={categories}
            onUpdateSettings={setSettings}
            onResetData={handleResetData}
            onClearAllData={handleClearAllData}
            onImportData={handleImportData}
          />
        )}
      </main>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsTxModalOpen(true)}
        className="fixed right-6 bottom-6 md:right-8 md:bottom-8 bg-[#18231c] hover:bg-[#25392b] active:scale-95 text-white font-extrabold text-sm sm:text-base px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all z-40 flex items-center gap-2 cursor-pointer border border-[#2b3c2f]"
      >
        <span className="text-lg">＋</span>
        <span>เพิ่มรายการ</span>
      </button>

      {/* Global Transaction Modal */}
      {isTxModalOpen && (
        <TxModal
          categories={categories}
          onClose={() => setIsTxModalOpen(false)}
          onAddTransaction={handleAddTx}
        />
      )}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#18231c] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg z-50 flex items-center gap-2 border border-[#3b5240] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
