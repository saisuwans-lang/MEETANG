import { GoogleGenAI } from '@google/genai';
import { Transaction, Goal, BudgetMap } from '../types';
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
  }
): Promise<string> {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  
  // Format summary context
  const sortedCats = Object.entries(data.catTotals).sort((a, b) => b[1] - a[1]);
  const topCat = sortedCats[0] ? `${sortedCats[0][0]} (${formatMoney(sortedCats[0][1])})` : 'ไม่มี';
  const savingRate = data.income > 0 ? Math.round(((data.income - data.expense) / data.income) * 100) : 0;

  const contextPrompt = `
คุณคือ "MEETANG AI" (มีตังค์ เอไอ) ผู้ช่วยที่ปรึกษาด้านการเงินส่วนบุคคลที่เป็นมิตร ฉลาด ให้คำแนะนำที่กระชับ นำไปปฏิบัติได้จริงเป็นภาษาไทย

ข้อมูลการเงินปัจจุบันของผู้ใช้:
- รายรับเดือนนี้: ${formatMoney(data.income)}
- รายจ่ายเดือนนี้: ${formatMoney(data.expense)}
- เงินคงเหลือสุทธิ: ${formatMoney(data.balance)}
- อัตราการออม: ${savingRate}%
- หมวดหมู่ที่มีรายจ่ายสูงสุด: ${topCat}
- รายจ่ายแยกตามหมวด:
${sortedCats.map(([cat, amt]) => `  • ${cat}: ${formatMoney(amt)} (งบที่ตั้งไว้: ${formatMoney(data.budgets[cat] || 0)})`).join('\n')}
- เป้าหมายการออม:
${data.goals.map((g) => `  • ${g.name}: สะสมได้ ${formatMoney(g.saved)} / ${formatMoney(g.target)} (${Math.round((g.saved / g.target) * 100)}%)`).join('\n')}
- รายการล่าสุด:
${data.recentTxs.slice(0, 5).map((t) => `  • ${t.date}: ${t.name} (${t.type === 'income' ? '+' : '-'}${formatMoney(t.amount)}, ${t.cat})`).join('\n')}

คำถามของผู้ใช้: "${question}"

คำสั่ง:
1. ตอบด้วยภาษาไทยที่สุภาพ เข้าใจง่าย กระชับ มีข้อคิดเห็นทางการเงินเชิงบวก
2. อ้างอิงตัวเลขจริงจากข้อมูลของผู้ใช้เสมอ
3. หากผู้ใช้ถามเรื่องลดค่าใช้จ่าย ให้ชี้เป้าหมวดที่ใช้เยอะที่สุดและแนะนำวิธีปรับ
4. จัดรูปแบบด้วย bullet หรือตัวหนาให้อ่านสบายตา ไม่ยาวเกิน 3-4 ย่อหน้า
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

  // Smart Local Rule-based Fallback
  return generateLocalFinancialAdvice(question, data, sortedCats, savingRate);
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
  },
  sortedCats: [string, number][],
  savingRate: number
): string {
  const topCatName = sortedCats[0]?.[0] || 'อาหาร';
  const topCatAmt = sortedCats[0]?.[1] || 0;
  const topCatPercent = data.expense > 0 ? Math.round((topCatAmt / data.expense) * 100) : 0;

  if (q.includes('เยอะที่สุด') || q.includes('มากที่สุด')) {
    return `📊 **สรุปค่าใช้จ่ายสูงสุดของคุณเดือนนี้**\n\nหมวดหมู่ที่คุณใช้เงินไปมากที่สุดคือ **${topCatName}** คิดเป็นจำนวน **${formatMoney(topCatAmt)}** หรือประมาณ **${topCatPercent}%** ของรายจ่ายทั้งหมด\n\n💡 *คำแนะนำจาก MEETANG:* ลองเปรียบเทียบกับงบที่ตั้งไว้ (${formatMoney(data.budgets[topCatName] || 0)}) หากใกล้เต็มแล้ว ลองจัดสรรงบย่อยเป็นรายสัปดาห์เพื่อควบคุมไม่ให้บานปลายครับ!`;
  }

  if (q.includes('ลด') || q.includes('ประหยัด')) {
    return `✂️ **แนวทางลดค่าใช้จ่ายที่เห็นผลเร็วที่สุด**\n\n1. **เจาะหมวด ${topCatName}:** เป็นหมวดที่กินสัดส่วนเงินสูงสุด (${formatMoney(topCatAmt)}) หากลดลงเพียง 10-15% จะประหยัดเงินเพิ่มได้ทันที **${formatMoney(topCatAmt * 0.12)}** ต่อเดือน\n2. **ตรวจสอบรายจ่ายฟุ่มเฟือย:** ลองเช็ครายการในหมวด 'ช้อปปิ้ง' หรือ 'ความบันเทิง' ก่อนชำระเงิน ให้ใช้กฎ "รอ 24 ชั่วโมงก่อนกดซื้อ"\n3. **เงินส่วนที่ประหยัดได้:** นำไปสมทบกับเป้าหมาย "${data.goals[0]?.name || 'เงินออมฉุกเฉิน'}" จะช่วยให้ถึงเป้าเร็วขึ้นมากครับ`;
  }

  if (q.includes('เหลือเท่าไหร่') || q.includes('คงเหลือ') || q.includes('สถานะ')) {
    const statusText = data.balance >= 0 ? '🟢 อยู่ในเกณฑ์บวก' : '🔴 ติดลบ';
    return `💰 **สรุปยอดเงินคงเหลือของคุณ**\n\n• **รายรับ:** ${formatMoney(data.income)}\n• **รายจ่าย:** ${formatMoney(data.expense)}\n• **คงเหลือสุทธิ:** **${formatMoney(data.balance)}** (${statusText})\n• **อัตราการออม:** **${savingRate}%** ของรายรับ\n\n${savingRate >= 20 ? '🎉 ยอดเยี่ยมมากครับ! อัตราการออมของคุณเกิน 20% ตามเกณฑ์มาตรฐานที่ดีเยี่ยม' : '💡 ลองตั้งเป้าเก็บเงินออมก่อนใช้อย่างน้อย 10-20% ในทุกครั้งที่ได้รับเงิน เพื่อสร้างเกราะคุ้มกันทางการเงินครับ'}`;
  }

  if (q.includes('เป้าหมาย') || q.includes('เก็บเงิน') || q.includes('ซื้อ')) {
    const g = data.goals[0];
    if (g) {
      const remaining = Math.max(0, g.target - g.saved);
      return `🎯 **วิเคราะห์แผนการออมเป้าหมาย: ${g.icon} ${g.name}**\n\n• เป้าหมาย: ${formatMoney(g.target)}\n• สะสมแล้ว: ${formatMoney(g.saved)} (${Math.round((g.saved / g.target) * 100)}%)\n• คงเหลืออีก: **${formatMoney(remaining)}**\n\nหากคุณเก็บเงินเพิ่มวันละ **${formatMoney(Math.ceil(remaining / 30))}** หรือเดือนละ **${formatMoney(Math.ceil(remaining / 3))}** จะบรรลุเป้าหมายได้อย่างสบายใจโดยไม่กระทบค่าใช้จ่ายประจำวันครับ!`;
    }
  }

  // General comprehensive health check
  return `✨ **บทวิเคราะห์สุขภาพการเงิน MEETANG**\n\n• **สภาพคล่องเดือนนี้:** มีเงินคงเหลือ ${formatMoney(data.balance)} จากรายรับทั้งหมด ${formatMoney(data.income)}\n• **จุดแข็ง:** หมวดที่คุมงบได้ดีช่วยให้รักษาอัตราการออมไว้ที่ ${savingRate}%\n• **ข้อควรระวัง:** หมวด ${topCatName} (${formatMoney(topCatAmt)}) มีสัดส่วนสูงที่สุด ควรหมั่นจดบันทึกทุกวันเพื่อไม่ให้เกินงบ\n\nคุณสามารถพิมพ์คำถามเจาะจง เช่น "ขอแผนเก็บเงิน 5,000 ใน 2 เดือน" หรือ "ควรจัดงบหมวดอาหารเท่าไหร่" ได้เลยครับ!`;
}
