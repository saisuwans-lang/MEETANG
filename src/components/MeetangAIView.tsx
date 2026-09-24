import React, { useState, useRef, useEffect } from 'react';
import { Transaction, Goal, BudgetMap, CategoryInfo, ChatMessage } from '../types';
import { askFinancialAdvisor } from '../services/geminiService';
import { formatMoney } from '../data/initialData';

interface MeetangAIViewProps {
  transactions: Transaction[];
  goals: Goal[];
  budgets: BudgetMap;
  categories: CategoryInfo[];
}

export const MeetangAIView: React.FC<MeetangAIViewProps> = ({
  transactions,
  goals,
  budgets,
  categories,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content:
        'สวัสดีครับ! ผมคือ **MEETANG AI** ผู้ช่วยวิเคราะห์การเงินและวางแผนงบประมาณส่วนตัวของคุณ 🤖✨\n\nผมพร้อมตอบคำถามเกี่ยวกับรายรับ-รายจ่าย วิเคราะห์งบประมาณ หรือแนะนำวิธีออมเงินให้ถึงเป้าหมายได้ทันที คุณสามารถคลิกคำถามด่วนด้านล่าง หรือพิมพ์คำถามที่สงสัยได้เลยครับ!',
      timestamp: 'เมื่อสักครู่',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Exact 5 auto questions required by Section 10
  const autoQuestions = [
    'เดือนนี้ฉันใช้เงินกับอะไรเยอะที่สุด?',
    'ฉันใช้เงินเกินงบตรงไหน?',
    'ฉันควรระวังค่าใช้จ่ายหมวดไหน?',
    'ถ้าฉันอยากเก็บเงิน ฿10,000 ต้องเก็บเดือนละเท่าไร?',
    'เดือนนี้ฉันประหยัดกว่าที่แล้วหรือไม่?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Calculate real-time financial stats
    const income = transactions
      .filter((x) => x.type === 'income')
      .reduce((sum, x) => sum + x.amount, 0);

    const expense = transactions
      .filter((x) => x.type === 'expense')
      .reduce((sum, x) => sum + x.amount, 0);

    const catTotals: Record<string, number> = {};
    transactions
      .filter((x) => x.type === 'expense')
      .forEach((x) => {
        catTotals[x.cat] = (catTotals[x.cat] || 0) + x.amount;
      });

    try {
      const response = await askFinancialAdvisor(q, {
        income,
        expense,
        balance: income - expense,
        catTotals,
        budgets,
        goals,
        recentTxs: transactions.slice().reverse(),
        categories,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: 'ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผลข้อมูล กรุณาลองใหม่อีกครั้งครับ',
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h2 className="text-xl sm:text-2xl font-black text-[#17211b]">MEETANG AI</h2>
            <span className="bg-[#dff3e3] text-[#25502e] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              อัจฉริยะ & อ้างอิงข้อมูลจริง
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-[#778178] mt-1">
            ปรึกษาปัญหาการเงิน ตรวจสอบงบประมาณ และรับคำแนะนำการออมที่ปรับให้เข้ากับพฤติกรรมของคุณโดยเฉพาะ
          </p>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'init-1',
                role: 'assistant',
                content:
                  'สวัสดีครับ! ผมคือ **MEETANG AI** ผู้ช่วยวิเคราะห์การเงินและวางแผนงบประมาณส่วนตัวของคุณ 🤖✨\n\nพร้อมตอบคำถามเกี่ยวกับรายรับ-รายจ่ายของคุณครับ!',
                timestamp: 'เมื่อสักครู่',
              },
            ])
          }
          className="text-xs px-3 py-1.5 bg-[#f5f9f5] hover:bg-[#eaf4eb] text-[#778178] hover:text-[#25502e] rounded-xl border border-[#e6ebe6] transition-colors cursor-pointer"
        >
          🔄 ล้างประวัติแชท
        </button>
      </div>

      {/* Auto Canned Questions (Section 10) */}
      <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-4 sm:p-5 shadow-xs">
        <div className="text-xs font-bold text-[#17211b] mb-2.5 flex items-center gap-1.5">
          <span>⚡</span> คำถามด่วนยอดนิยม (คลิกเพื่อถามทันที):
        </div>
        <div className="flex flex-wrap gap-2">
          {autoQuestions.map((q, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSend(q)}
              className="text-xs font-semibold px-3 py-2 bg-[#f5f9f5] hover:bg-[#eaf4eb] text-[#25502e] border border-[#dff3e3] rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-left"
            >
              💬 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Conversation Box */}
      <div className="bg-white border border-[#e6ebe6] rounded-[22px] p-5 sm:p-6 shadow-xs flex flex-col h-[520px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#18231c] text-white grid place-items-center text-sm shrink-0 shadow-2xs">
                    🤖
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-[#18231c] text-white rounded-tr-xs'
                      : 'bg-[#f7faf7] border border-[#e6ebe6] text-[#17211b] rounded-tl-xs'
                  }`}
                >
                  <div>{msg.content}</div>
                  <div
                    className={`text-[10px] mt-2 ${
                      isUser ? 'text-[#a3b8a6] text-right' : 'text-[#778178]'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#ffd86b] text-[#18231c] font-bold grid place-items-center text-sm shrink-0 shadow-2xs">
                    S
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-[#18231c] text-white grid place-items-center text-sm">
                🤖
              </div>
              <div className="bg-[#f7faf7] border border-[#e6ebe6] p-3.5 rounded-2xl rounded-tl-xs text-xs text-[#778178] flex items-center gap-2">
                <span className="animate-spin text-base">⏳</span>
                <span>MEETANG AI กำลังวิเคราะห์ข้อมูลการเงินของคุณ...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="mt-4 pt-3 border-t border-[#edf1ed] flex gap-2"
        >
          <input
            type="text"
            placeholder="พิมพ์คำถามเกี่ยวกับการเงินของคุณ เช่น ขอคำแนะนำลดรายจ่าย, วางแผนออมเงิน..."
            value={input}
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-[#fbfdfb] border border-[#e6ebe6] rounded-xl text-xs sm:text-sm text-[#17211b] focus:outline-none focus:ring-2 focus:ring-[#8fd19d]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 bg-[#18231c] hover:bg-[#28392d] disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>ส่ง</span>
            <span>➤</span>
          </button>
        </form>
      </div>
    </div>
  );
};
