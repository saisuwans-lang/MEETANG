import React, { useState, useEffect } from 'react';
import { PageId, Transaction, Goal, BudgetMap, CategoryInfo, TxType } from './types';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_GOALS,
  INITIAL_BUDGETS,
  DEFAULT_CATEGORIES,
} from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { AnalysisView } from './components/AnalysisView';
import { GoalsView } from './components/GoalsView';
import { BudgetView } from './components/BudgetView';
import { SmartDashboardView } from './components/SmartDashboardView';
import { MeetangAIView } from './components/MeetangAIView';
import { TxModal } from './components/TxModal';
import { GoalModal } from './components/GoalModal';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>('กันยายน 2569');

  // Transactions State with localStorage
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('meetang_txs');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  // Goals State with localStorage
  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const saved = localStorage.getItem('meetang_goals');
      return saved ? JSON.parse(saved) : INITIAL_GOALS;
    } catch {
      return INITIAL_GOALS;
    }
  });

  // Budgets State with localStorage
  const [budgets, setBudgets] = useState<BudgetMap>(() => {
    try {
      const saved = localStorage.getItem('meetang_budgets');
      return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
    } catch {
      return INITIAL_BUDGETS;
    }
  });

  // Categories State with localStorage
  const [categories, setCategories] = useState<CategoryInfo[]>(() => {
    try {
      const saved = localStorage.getItem('meetang_cats');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (typeof parsed[0] === 'string') {
            return parsed.map((name: string) => {
              const def = DEFAULT_CATEGORIES.find((c) => c.name === name);
              return def || { name, icon: '🏷️', isDefault: false };
            });
          }
          return parsed;
        }
      }
      return DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('meetang_txs', JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('meetang_goals', JSON.stringify(goals));
    } catch (e) {
      console.error(e);
    }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem('meetang_budgets', JSON.stringify(budgets));
    } catch (e) {
      console.error(e);
    }
  }, [budgets]);

  useEffect(() => {
    try {
      localStorage.setItem('meetang_cats', JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  // Transaction Handlers
  const handleAddTx = (newTxData: {
    name: string;
    amount: number;
    type: TxType;
    cat: string;
    date: string;
    note?: string;
  }) => {
    const newTx: Transaction = {
      id: Date.now(),
      ...newTxData,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`บันทึกรายการ "${newTx.name}" สำเร็จแล้ว`);
  };

  const handleDeleteTx = (id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('ลบรายการเรียบร้อยแล้ว');
  };

  // Goal Handlers
  const handleAddGoal = (goalData: {
    name: string;
    target: number;
    saved: number;
    icon: string;
    deadline?: string;
  }) => {
    const newGoal: Goal = {
      id: Date.now(),
      ...goalData,
    };
    setGoals((prev) => [...prev, newGoal]);
    showToast(`เพิ่มเป้าหมาย "${newGoal.name}" เรียบร้อยแล้ว`);
  };

  const handleUpdateGoalSavings = (goalId: number, additionalAmount: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, saved: g.saved + additionalAmount } : g))
    );
    showToast(`ฝากเงินเข้าเป้าหมายสำเร็จ +฿${additionalAmount.toLocaleString('th-TH')}`);
  };

  const handleDeleteGoal = (goalId: number) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    showToast('ลบเป้าหมายเรียบร้อยแล้ว');
  };

  // Budget Handlers
  const handleUpdateBudget = (category: string, amount: number) => {
    setBudgets((prev) => ({
      ...prev,
      [category]: amount,
    }));
    showToast(`ปรับงบประมาณหมวด "${category}" เป็น ฿${amount.toLocaleString('th-TH')} เรียบร้อย`);
  };

  // Category Handlers
  const handleAddCategory = (name: string, icon: string) => {
    const newCat: CategoryInfo = { name, icon, isDefault: false };
    setCategories((prev) => [...prev, newCat]);
    // Also init budget for this category
    if (!budgets[name]) {
      setBudgets((prev) => ({ ...prev, [name]: 1000 }));
    }
    showToast(`เพิ่มหมวดหมู่ "${name}" เรียบร้อยแล้ว`);
  };

  const handleDeleteCategory = (name: string) => {
    setCategories((prev) => prev.filter((c) => c.name !== name));
    showToast(`ลบหมวดหมู่ "${name}" เรียบร้อยแล้ว`);
  };

  // Reset to initial demo data
  const handleResetData = () => {
    if (window.confirm('ต้องการรีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้นหรือไม่?')) {
      setTransactions(INITIAL_TRANSACTIONS);
      setGoals(INITIAL_GOALS);
      setBudgets(INITIAL_BUDGETS);
      setCategories(DEFAULT_CATEGORIES);
      localStorage.clear();
      showToast('รีเซ็ตข้อมูลตัวอย่างสำเร็จแล้ว');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f3] text-[#17211b] flex flex-col md:flex-row relative selection:bg-[#8fd19d] selection:text-[#18231c]">
      {/* Sidebar Navigation */}
      <Sidebar currentPage={currentPage} onSelectPage={setCurrentPage} />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[240px] p-4 sm:p-7 md:p-8 max-w-[1440px] w-full min-h-screen pb-24 md:pb-8">
        <Header
          currentPage={currentPage}
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
          onResetData={handleResetData}
        />

        {/* View Pages */}
        {currentPage === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            goals={goals}
            budgets={budgets}
            categories={categories}
            onNavigate={setCurrentPage}
            onOpenTxModal={() => setIsTxModalOpen(true)}
            onOpenGoalModal={() => setIsGoalModalOpen(true)}
          />
        )}

        {currentPage === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            categories={categories}
            onDeleteTx={handleDeleteTx}
            onOpenAddModal={() => setIsTxModalOpen(true)}
          />
        )}

        {currentPage === 'analysis' && (
          <AnalysisView
            transactions={transactions}
            categories={categories}
            goals={goals}
          />
        )}

        {currentPage === 'goals' && (
          <GoalsView
            goals={goals}
            onOpenAddGoal={() => setIsGoalModalOpen(true)}
            onUpdateGoalSavings={handleUpdateGoalSavings}
            onDeleteGoal={handleDeleteGoal}
          />
        )}

        {currentPage === 'budget' && (
          <BudgetView
            transactions={transactions}
            budgets={budgets}
            categories={categories}
            onUpdateBudget={handleUpdateBudget}
          />
        )}

        {currentPage === 'v5' && (
          <SmartDashboardView
            transactions={transactions}
            budgets={budgets}
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {currentPage === 'ai' && (
          <MeetangAIView
            transactions={transactions}
            goals={goals}
            budgets={budgets}
          />
        )}
      </main>

      {/* Floating Action Button (FAB) matching prototype */}
      <button
        onClick={() => setIsTxModalOpen(true)}
        className="fixed right-6 bottom-6 md:right-8 md:bottom-8 bg-[#18231c] hover:bg-[#25392b] active:scale-95 text-white font-extrabold text-sm sm:text-base px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all z-40 flex items-center gap-2 cursor-pointer border border-[#2b3c2f]"
      >
        <span className="text-lg">＋</span>
        <span>เพิ่มรายการ</span>
      </button>

      {/* Modals */}
      <TxModal
        isOpen={isTxModalOpen}
        categories={categories}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleAddTx}
        onNavigateToSmart={() => setCurrentPage('v5')}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleAddGoal}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#18231c] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg z-50 flex items-center gap-2 border border-[#3b5240] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
