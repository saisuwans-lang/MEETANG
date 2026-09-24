import React, { useState } from 'react';
import { Transaction, Goal, BudgetMap } from '../types';
import { askFinancialAdvisor } from '../services/geminiService';
import { formatMoney } from '../data/initialData';

interface MeetangAIViewProps {
  transactions: Transaction[];
  goals: Goal[];
  budgets: BudgetMap;
}

export const MeetangAIView: React.FC<MeetangAIViewProps> = ({
  transactions,
  goals,
  budgets,
}) => {
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; timestamp: string }[]
  >([
    {
      role: 'assistant',
      text: 'สวัสดีครับ! ผมคือ **MEETANG AI** ผู้ช่วยวิเคราะห์การเงินส่วนบุคคลของคุณ 🤖\n\nผมพร้อมช่วยวิเคราะห์รายรับ-รายจ่าย ตรวจสุขภาพการเงิน แนะนำจุดที่ควรประหยัด และช่วยวางแผนพิชิตเป้าหมายการออม ลองกดปุ่มคำถามสำเร็จรูปด้านบน หรือพิมพ์ถามเรื่องเงินได้เลยครับ!',
      timestamp: 'เมื่อสักครู่',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Financial aggregates
  const income = transactions
    .filter((x) => x.type === 'income')
    .reduce((a, b) => a + b.amount, 0);

  const expenses = transactions.filter((x) => x.type === 'expense');
  const totalExpense = expenses.reduce((a, b) => a + b.amount, 0);
  const balance = income - totalExpense;

  const catTotals: Record<string, number> = {};
  expenses.forEach((x) => {
    catTotals[x.cat] = (catTotals[x.cat] || 0) + x.amount;
  });

  const quickQuestions = [
    'เดือนนี้ฉันใช้เงินกับอะไรเยอะที่สุด?',
    'ฉันควรลดค่าใช้จ่ายตรงไหน?',
    'เงินเดือนนี้ฉันเหลือเท่าไหร่?',
    'ช่วยวางแผนเก็บเงินให้ถึงเป้าหมายหน่อย',
    'วิเคราะห์สุขภาพการเงินของฉันแบบเจาะลึก',
  ];

  const handleSend = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || loading) return;

    const userMsg = {
      role: 'user' as const,
      text: q,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const answer = await askFinancialAdvisor(q, {
        income,
        expense: totalExpense,
        balance,
        catTotals,
        budgets,
        goals,
        recentTxs: transactions.slice(-5).reverse(),
      });

      const aiMsg = {
        role: 'assistant' as const,
        text: answer,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผลคำแนะนำ โปรดลองอีกครั้ง',
          timestamp: 'เมื่อสักครู่',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-[#18231c] text-white border border-[#2c3d31] rounded-[24px] p-6 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🤖</span>
          <span className="text-xs font-bold text-[#8fd19d] tracking-wider uppercase">
            MEETANG AI ADVISOR
          </span>
        </div>
        <h2 className="text-2xl font-black text-white mb-2">ถามเรื่องเงินของคุณได้เลย</h2>
        <p className="text-xs sm:text-[13px] text-[#b7c8bb] leading-relaxed max-w-2xl">
          ระบบนำข้อมูลบันทึกจริงของคุณ ทั้งรายรับ รายจ่าย หมวดหมู่ และเป้าหมาย
          มาประมวลผลเป็นคำแนะนำทางการเงินที่เข้าใจง่ายและปรับใช้ได้ทันที
        </p>

        {/* Quick Question Chips */}
        <div className="mt-5">
          <div className="text-xs text-[#9eb0a1] mb-2 font-medium">💡 ตัวอย่างคำถามยอดนิยม:</div>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="px-3.5 py-2 bg-[#253629] hover:bg-[#344b3a] border border-[#3b5240] rounded-xl text-xs text-[#dff3e3] font-medium transition-all text-left disabled:opacity-50"
              >
                “{q}”
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-white border border-[#e6ebe6] rounded-[24px] p-5 sm:p-6 shadow-xs min-h-[380px] flex flex-col justify-between">
        <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto pr-2">
          {messages.map((msg, index) => {
            const isAI = msg.role === 'assistant';
            return (
              <div
                key={index}
                className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-[#18231c] text-[#8fd19d] grid place-items-center text-sm font-bold shrink-0 mt-0.5">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                    isAI
                      ? 'bg-[#f5f9f5] border border-[#e0ede2] text-[#17211b]'
                      : 'bg-[#18231c] text-white font-medium'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                  <div
                    className={`text-[10px] mt-2 text-right ${
                      isAI ? 'text-[#778178]' : 'text-gray-300'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-[#18231c] text-[#8fd19d] grid place-items-center text-sm font-bold shrink-0">
                🤖
              </div>
              <div className="bg-[#f5f9f5] border border-[#e0ede2] p-4 rounded-2xl text-xs text-[#556959] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8fd19d] animate-ping" />
                <span>MEETANG AI กำลังวิเคราะห์ข้อมูลการเงินของคุณ...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputQuery);
          }}
          className="flex gap-2 pt-3 border-t border-[#e6ebe6]"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={loading}
            placeholder="พิมพ์คำถาม เช่น 'อยากเก็บเงิน 10,000 บาทใน 3 เดือน ควรทำอย่างไร?'"
            className="flex-1 px-4 py-3 bg-[#fafcfa] border border-[#e6ebe6] rounded-xl text-xs sm:text-sm text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="px-5 py-3 bg-[#18231c] hover:bg-[#28382c] disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>ส่งคำถาม</span>
            <span>→</span>
          </button>
        </form>
      </div>
    </div>
  );
};
