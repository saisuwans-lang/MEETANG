import { GoogleGenAI } from '@google/genai';
import { Transaction, Goal, BudgetMap, CategoryInfo } from '../types';
import { formatMoney } from '../data/initialData';

export async function askFinancialAdvisor(
  question: string,
  data: {
    income: number;
    expense: number;
    balance: number;
    catTotals: Record<string, number>;
    budgets: BudgetMap;
    goals: Goal[];
    recentTxs: Transaction[];
    categories: CategoryInfo[];
  }
): Promise<string> {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  // Sort categories by expenditure
  const sortedCats = Object.entries(data.catTotals).sort((a, b) => b[1] - a[1]);
  const topCat = sortedCats[0] ? `${sortedCats[0][0]} (${formatMoney(sortedCats[0][1])})` : 'ไม่มี';
  const savingRate = data.income > 0 ? Math.round(((data.income - data.expense) / data.income) * 100) : 0;

  // Identify over budget and near budget categories
  const overBudgetCats = Object.entries(data.budgets).filter(([cat, limit]) => {
    const spent = data.catTotals[cat] || 0;
    return spent > limit;
  });

  const nearBudgetCats = Object.entries(data.budgets).filter(([cat, limit]) => {
    const spent = data.catTotals[cat] || 0;
    const pct = limit > 0 ? (spent / limit) * 100 : 0;
    return pct >= 80 && pct <= 100;
  });

  const contextPrompt = `
คุณคือ "MEETANG AI" (มีตังค์ เอไอ) ผู้ช่วยที่ปรึกษาด้านการเงินส่วนบุคคลสำหรับคนรุ่นใหม่และนักศึกษา พูดจาเป็นกันเอง สุภาพ มีกำลังใจ และชาญฉลาด

ข้อมูลการเงินจริงของผู้ใช้ในปัจจุบัน:
- รายรับเดือนนี้: ${formatMoney(data.income)}
- รายจ่ายเดือนนี้: ${formatMoney(data.expense)}
- เงินคงเหลือสุทธิ: ${formatMoney(data.balance)}
- อัตราการออม: ${savingRate}%
- หมวดที่ใช้เงินเยอะที่สุด: ${topCat}
- หมวดที่เกินงบประมาณ: ${overBudgetCats.length > 0 ? overBudgetCats.map(([c, limit]) => `${c} (ใช้ ${formatMoney(data.catTotals[c] || 0)} เกินงบ ${formatMoney((data.catTotals[c] || 0) - limit)})`).join(', ') : 'ไม่มี ทุกหมวดคุมงบได้ดี'}
- หมวดที่ใกล้เต็มงบ (80-99%): ${nearBudgetCats.length > 0 ? nearBudgetCats.map(([c, limit]) => `${c} (ใช้ ${formatMoney(data.catTotals[c] || 0)} / งบ ${formatMoney(limit)})`).join(', ') : 'ไม่มี'}
- รายจ่ายทุกหมวด:
${sortedCats.map(([cat, amt]) => `  • ${cat}: ${formatMoney(amt)} (งบ: ${formatMoney(data.budgets[cat] || 0)})`).join('\n')}
- เป้าหมายการออม:
${data.goals.map((g) => `  • ${g.name}: สะสมได้ ${formatMoney(g.saved)} / ${formatMoney(g.target)} (${Math.round((g.saved / g.target) * 100)}%) เหลืออีก ${formatMoney(g.target - g.saved)}`).join('\n')}
- 5 รายการล่าสุด:
${data.recentTxs.slice(0, 5).map((t) => `  • ${t.date}: ${t.name} (${t.type === 'income' ? '+' : '-'}${formatMoney(t.amount)}, หมวด ${t.cat})`).join('\n')}

คำถามของผู้ใช้: "${question}"

คำแนะนำในการตอบ:
1. ตอบเป็นภาษาไทยที่กระชับ อบอุ่น มี bullet อ่านง่าย
2. **ต้องอ้างอิงตัวเลขและข้อมูลจริงข้างต้นอย่างแม่นยำเสมอ**
3. ให้แนวทางปฏิบัติจริงที่เป็นไปได้ (Actionable advice)
4. จัดย่อหน้าให้อ่านง่าย ไม่ยาวเกินไป
`;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contextPrompt,
      });

      if (response.text) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local advisor:', err);
    }
  }

  // Local Rule-based Financial Engine matching exact requirements
  return generateLocalFinancialAdvice(question, data, sortedCats, savingRate, overBudgetCats, nearBudgetCats);
}

function generateLocalFinancialAdvice(
  q: string,
  data: {
    income: number;
    expense: number;
    balance: number;
    catTotals: Record<string, number>;
    budgets: BudgetMap;
    goals: Goal[];
    categories: CategoryInfo[];
  },
  sortedCats: [string, number][],
  savingRate: number,
  overBudgetCats: [string, number][],
  nearBudgetCats: [string, number][]
): string {
  const topCatName = sortedCats[0]?.[0] || 'อาหาร';
  const topCatAmt = sortedCats[0]?.[1] || 0;
  const topCatPercent = data.expense > 0 ? Math.round((topCatAmt / data.expense) * 100) : 0;

  // 1. "เดือนนี้ฉันใช้เงินกับอะไรเยอะที่สุด?"
  if (q.includes('เยอะที่สุด') || q.includes('มากที่สุด')) {
    return `🍜 **สรุปหมวดหมู่ที่คุณใช้เงินเยอะที่สุดเดือนนี้**\n\nหมวดหมู่ที่คุณใช้เงินไปมากที่สุดคือ **${topCatName}** รวมเป็นเงินทั้งสิ้น **${formatMoney(topCatAmt)}**\n• คิดเป็นสัดส่วน **${topCatPercent}%** ของรายจ่ายทั้งหมดในเดือนนี้\n• งบประมาณที่คุณตั้งไว้คือ **${formatMoney(data.budgets[topCatName] || 0)}** (${(data.budgets[topCatName] || 0) > 0 ? `${Math.round((topCatAmt / (data.budgets[topCatName] || 1)) * 100)}% ของงบ` : 'ยังไม่ได้ตั้งงบ'})\n\n💡 *คำแนะนำ:* หากต้องการเพิ่มเงินออม ลองตั้งเป้าลดค่าใช้จ่ายในหมวด ${topCatName} ลงเพียง 10% จะช่วยให้คุณมีเงินเก็บเพิ่มขึ้นถึง **${formatMoney(topCatAmt * 0.1)}** ต่อเดือนเลยครับ!`;
  }

  // 2. "ฉันใช้เงินเกินงบตรงไหน?"
  if (q.includes('เกินงบ') || q.includes('เกิน')) {
    if (overBudgetCats.length > 0) {
      const details = overBudgetCats
        .map(([c, limit]) => {
          const spent = data.catTotals[c] || 0;
          return `• 🔴 **หมวด ${c}:** ใช้ไป ${formatMoney(spent)} จากงบ ${formatMoney(limit)} (เกินงบไป **${formatMoney(spent - limit)}**)`;
        })
        .join('\n');
      return `⚠️ **รายงานหมวดหมู่ที่ใช้เงินเกินงบประมาณ**\n\nพบว่ามี **${overBudgetCats.length} หมวดหมู่** ที่ใช้เงินเกินขีดจำกัดที่คุณตั้งไว้:\n\n${details}\n\n💡 *วิธีแก้ไขด่วน:* ในช่วงวันที่เหลือของเดือนนี้ ลองชะลอการใช้จ่ายในหมวดเหล่านี้ หรือหากเป็นหมวดที่มีความจำเป็นจริง ๆ แนะนำให้ปรับงบประมาณในหน้า "วางแผน" ให้สอดคล้องกับพฤติกรรมจริงครับ`;
    } else {
      const nearDetails = nearBudgetCats.length > 0
        ? `\n\nอย่างไรก็ตาม มีหมวดที่ **ใกล้เต็มงบ (เกิน 80%)** ที่ควรระวัง:\n${nearBudgetCats.map(([c, limit]) => `• ⚠️ **หมวด ${c}:** ใช้ไป ${formatMoney(data.catTotals[c] || 0)} / ${formatMoney(limit)}`).join('\n')}`
        : '';
      return `🎉 **ข่าวดี! เดือนนี้คุณยังไม่มีหมวดหมู่ไหนที่ใช้เงินเกินงบเลยครับ**\n\nการควบคุมงบประมาณของคุณทำได้ยอดเยี่ยมมาก!${nearDetails}\n\n💡 รักษาเกณฑ์นี้ไว้จนถึงสิ้นเดือนเพื่อเก็บเงินส่วนเกินเข้ากองทุนเป้าหมายได้เลยครับ`;
    }
  }

  // 3. "ฉันควรระวังค่าใช้จ่ายหมวดไหน?"
  if (q.includes('ระวัง') || q.includes('อันตราย') || q.includes('เตือน')) {
    const watchList: string[] = [];
    if (overBudgetCats.length > 0) {
      overBudgetCats.forEach(([c]) => watchList.push(`🔴 **หมวด ${c}** (เกินงบแล้ว) `));
    }
    if (nearBudgetCats.length > 0) {
      nearBudgetCats.forEach(([c]) => watchList.push(`⚠️ **หมวด ${c}** (ใช้ไปมากกว่า 80% ของงบ) `));
    }
    if (watchList.length === 0) {
      watchList.push(`📌 **หมวด ${topCatName}** (แม้ยังไม่เกินงบ แต่มีสัดส่วนเงินสูงสุด ${formatMoney(topCatAmt)}) `);
    }

    return `🛡️ **หมวดหมู่ค่าใช้จ่ายที่คุณควรจับตาเป็นพิเศษ**\n\n${watchList.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}\n\n💡 **ข้อแนะนำจาก MEETANG:**\n• ก่อนชำระเงินทุกครั้ง ให้ถามตัวเองว่า "จำเป็นต้องซื้อทันทีไหม หรือรอได้ 24 ชม.?"\n• แบ่งงบออกเป็นรายสัปดาห์ เช่น สัปดาห์ละ ฿500 เพื่อไม่ให้เงินหมดก่อนสิ้นเดือน`;
  }

  // 4. "ถ้าฉันอยากเก็บเงิน ฿10,000 ต้องเก็บเดือนละเท่าไร?"
  if (q.includes('10,000') || q.includes('10000') || q.includes('เก็บเดือนละเท่าไร')) {
    return `🎯 **แผนจัดสรรเงินออมเป้าหมาย ฿10,000**\n\nขึ้นอยู่กับระยะเวลาที่คุณต้องการบรรลุเป้าหมาย:\n\n• **ภายใน 3 เดือน:** ต้องเก็บเดือนละ **฿3,334** (ประมาณ ฿111/วัน)\n• **ภายใน 6 เดือน:** ต้องเก็บเดือนละ **฿1,667** (ประมาณ ฿56/วัน)\n• **ภายใน 1 ปี (12 เดือน):** ต้องเก็บเดือนละ **฿834** (ประมาณ ฿28/วัน)\n\n📊 *เปรียบเทียบกับสถานะปัจจุบันของคุณ:*\nปัจจุบันคุณมีเงินคงเหลือสุทธิเดือนนี้ **${formatMoney(data.balance)}** และอัตราการออมอยู่ที่ **${savingRate}%** ซึ่งมีศักยภาพเพียงพอที่จะเก็บเป้าหมาย ฿10,000 ได้ภายใน **3–6 เดือน** สบาย ๆ เลยครับ!`;
  }

  // 5. "เดือนนี้ฉันประหยัดกว่าที่แล้วหรือไม่?"
  if (q.includes('ประหยัดกว่า') || q.includes('เดือนที่แล้ว') || q.includes('เปรียบเทียบ')) {
    const status = savingRate >= 20 ? 'ประหยัดและควบคุมค่าใช้จ่ายได้ดีขึ้น' : 'มีแนวโน้มใช้จ่ายใกล้เคียงเดิม';
    return `📈 **การเปรียบเทียบพฤติกรรมการใช้จ่าย**\n\nจากการวิเคราะห์กระแสเงินสดเดือนนี้:\n• **รายรับรวม:** ${formatMoney(data.income)}\n• **รายจ่ายรวม:** ${formatMoney(data.expense)}\n• **เงินคงเหลือออมสุทธิ:** ${formatMoney(data.balance)} (**${savingRate}%** ของรายรับ)\n\nสรุป: เดือนนี้คุณ **${status}** โดยเฉพาะอัตราการออม ${savingRate}% ซึ่งอยู่ในเกณฑ์ที่น่าพอใจ หากต้องการให้ประหยัดกว่านี้อย่างก้าวกระโดด ให้ลองจำกัดค่าใช้จ่ายหมวด ${topCatName} (${formatMoney(topCatAmt)}) จะเห็นผลเงินเก็บส่วนเกินชัดเจนที่สุดครับ!`;
  }

  // General fallback
  return `✨ **คำแนะนำการเงินจาก MEETANG AI**\n\n• **ภาพรวมปัจจุบัน:** รายรับ ${formatMoney(data.income)} | รายจ่าย ${formatMoney(data.expense)} | เงินคงเหลือ ${formatMoney(data.balance)}\n• **อัตราการออม:** ${savingRate}%\n• **เป้าหมายหลัก:** ${data.goals[0] ? `${data.goals[0].name} (${formatMoney(data.goals[0].saved)} / ${formatMoney(data.goals[0].target)})` : 'ยังไม่ได้ตั้งเป้าหมาย'}\n\nคุณสามารถกดปุ่มคำถามแนะนำด้านบน หรือพิมพ์สอบถามเรื่องวางแผนงบประมาณ การออม และการลดรายจ่ายได้ตลอดเวลาครับ!`;
}
