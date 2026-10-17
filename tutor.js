// نقطة الاتصال الخاصة بـ "مدرس توفيق الشخصي" (يدعم إرفاق صورة)
// التطبيق بيبعت: { message, subject, fileName, fileType, fileData, app }
// fileData بتبقى Data URL (base64) لو فيه ملف متبعت
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

    const { message, subject, fileName, fileType, fileData } = req.body || {};
    if ((!message || !message.trim()) && !fileData) {
      return res.status(400).json({ error: 'اكتب سؤالك أو ارفق ملف.' });
    }

    const systemPrompt =
      'أنت "مدرس توفيق"، معلم خصوصي ذكي يشرح بالعربية لطالب ثانوية عامة مصري في مادة: ' +
      (subject || 'عام') + '. اشرح بوضوح وبالتفصيل، وقدّم أمثلة كل ما أمكن.';

    const isImage = fileType && fileType.startsWith('image/');
    const parts = [];

    if (fileData && isImage) {
      const match = /^data:([^;]+);base64,(.+)$/.exec(fileData);
      if (!match) return res.status(400).json({ error: 'صيغة الصورة غير مفهومة.' });
      const [, mimeType, base64Data] = match;
      parts.push({ text: (message && message.trim()) ? message : 'اشرح/حلل محتوى الصورة المرفقة.' });
      parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
    } else if (fileData && !isImage) {
      parts.push({
        text: (message ? message + '\n\n' : '') +
          '(تم إرفاق ملف باسم "' + (fileName || 'ملف') + '" من نوع ' + (fileType || 'غير معروف') +
          '، لكن هذا الخادم لا يدعم حاليًا قراءة هذا النوع من الملفات تلقائيًا. انسخ النص المهم من الملف والصقه في السؤال.)'
      });
    } else {
      parts.push({ text: message });
    }

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
        contents: [{ role: 'user', parts }]
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
