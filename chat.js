// نقطة الاتصال الخاصة بـ "مساعد توفيق الذكي" (أعلى الصفحة)
// التطبيق بيبعت: { message, mode, subject, app }
// وبيستنى يرجعله: { answer }
// هنا بنكلم Google Gemini (مجاني تمامًا، من غير كارت)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'الخادم غير مُعد: لا يوجد GEMINI_API_KEY في إعدادات Vercel.' });
    }

    const { message, mode, subject } = req.body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'اكتب سؤالك أولاً.' });
    }

    const modePrompts = {
      explain: 'اشرح الموضوع التالي بطريقة مبسطة وواضحة لطالب ثانوية عامة، بالعربية، مع مثال أو اتنين.',
      summary: 'لخّص المحتوى التالي في نقاط مرتبة وواضحة، بالعربية، بدون حشو.',
      quiz: 'اكتب أسئلة تدريبية متنوعة (اختيار من متعدد وصح/خطأ) على المحتوى التالي، وحط الإجابات الصحيحة في الآخر.',
      plan: 'اقترح خطة مذاكرة عملية مقسمة لجلسات قصيرة بفواصل راحة، بناءً على الطلب التالي.',
      solve: 'حل السؤال التالي خطوة بخطوة بالتفصيل وبطريقة سهلة الفهم، بالعربية.'
    };

    const systemPrompt =
      'أنت "مساعد توفيق"، مساعد دراسي ذكي يتكلم بالعربية بأسلوب ودود ومشجع لطلاب الثانوية العامة المصرية (نظام البكالوريا). ' +
      (modePrompts[mode] || 'جاوب على طلب الطالب بوضوح وبالعربية.') +
      ' المادة: ' + (subject || 'عام') + '.';

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent';

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: message }] }]
      })
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return res.status(502).json({ error: 'خطأ من Gemini: ' + errText });
    }

    const data = await geminiRes.json();
    const answer = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('').trim();
    if (!answer) return res.status(502).json({ error: 'الرد من النموذج جه فاضي.' });

    return res.status(200).json({ answer });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'خطأ غير متوقع في الخادم.' });
  }
}
