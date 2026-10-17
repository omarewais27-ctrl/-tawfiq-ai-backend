# Backend ذكاء اصطناعي مجاني لتطبيق توفيق (Google Gemini)

السيرفر ده وسيط صغير بيحتفظ بمفتاح Gemini بأمان، وتطبيق توفيق بيكلمه هو. مجاني بالكامل: لا تطبيق يحتاج فلوس، ولا المفتاح يحتاج كارت بنكي.

## الخطوات بالتفصيل

### ١) اعمل مفتاح Gemini مجاني
1. روح aistudio.google.com (Google AI Studio)
2. سجّل دخول بحساب Google بتاعك العادي (جيميل)
3. دوس "Get API key" (أو من القايمة على الشمال)
4. دوس "Create API key"
5. انسخ المفتاح (بيبدأ بـ AIza...) واحفظه — من غير كارت ومن غير فلوس

### ٢) ارفع الملفات على GitHub
1. ادخل github.com بنفس حسابك
2. + فوق يمين → New repository → سمّيه tawfiq-ai-backend → Create
3. جوه الريبو الفاضي دوس "uploading an existing file"
4. فك ضغط ملف الzip على جهازك، واسحب الملفات والفولدرات اللي جواه (مش فولدر الzip نفسه)
5. Commit changes

### ٣) اربطه بـ Vercel (مجاني برضو)
1. vercel.com → سجّل دخول بحساب GitHub
2. Add New → Project → اختار ريبو tawfiq-ai-backend
3. قبل الـ Deploy، روح Environment Variables وضيف:
   - `GEMINI_API_KEY` = المفتاح من خطوة ١
   - `GEMINI_MODEL` = `gemini-2.5-flash` (اختياري، ده الافتراضي أصلاً)
4. دوس Deploy

### ٤) هتاخد رابط زي
```
https://tawfiq-ai-backend.vercel.app
```

### ٥) ارجع لتطبيق توفيق
- خانة "رابط Backend الآمن" (مساعد توفيق الذكي):
  `https://tawfiq-ai-backend.vercel.app/api/chat`
- خانة "رابط خادم المدرس" (مدرس توفيق الشخصي):
  `https://tawfiq-ai-backend.vercel.app/api/tutor`
- دوس حفظ، وجرب سؤال.

## ملاحظات
- فيه حد استخدام يومي للنسخة المجانية (مئات الطلبات يوميًا) كافي جدًا لتطبيق طلابي.
- `/api/tutor` بيدعم إرفاق صورة وبيبعتها للنموذج بصريًا.
- CORS متظبط بالفعل عشان GitHub Pages يقدر يكلم السيرفر من غير مشاكل.
- المفتاح موجود بس في إعدادات Vercel، مش في أي ملف — ده اللي بيخليه آمن.
