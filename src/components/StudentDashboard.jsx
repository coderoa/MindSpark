import React, { useState, useEffect } from 'react';
import { Award, Zap, Heart, Shield, RefreshCw, HelpCircle, Bell } from 'lucide-react';
import { fetchGeminiFocusQuiz } from '../api/gemini';

export default function StudentDashboard({ liveMetrics, onConfusionMark }) {
  const [personalScore, setPersonalScore] = useState(88);
  const [activeTab, setActiveTab] = useState('insights');
  const [handRaised, setHandRaised] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [lessonFinished, setLessonFinished] = useState(false);
  const [questionInput, setQuestionInput] = useState("");
  const [studyNotes, setStudyNotes] = useState("");
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizSource, setQuizSource] = useState('local');
  const [quizHint, setQuizHint] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [logsTimer, setLogsTimer] = useState(300); // 5 minutes in seconds

  // Local logs auto-delete countdown simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setLogsTimer(prev => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format countdown timer
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Lesson topic content available for AI study notes
  const lessonSections = [
    {
      title: '1-bob: Birinchi tartibli oddiy differensial tenglamalar',
      bullets: [
        'Differensial tenglamaning tartibi, yechimi (xususiy va umumiy), Koshi masalasi.',
        'Oʻzgaruvchilari ajraladigan tenglamalar va integrallash usullari.',
        'Bir jinsli differensial tenglamalar va ularni yechish algoritmlari.',
        'Birinchi tartibli chiziqli tenglamalar: Bernulli va Rikkati tenglamalari.',
        'Toʻliq differensialli tenglamalar va integrallovchi koʻpaytuvchi tushunchasi.'
      ]
    },
    {
      title: '2-bob: Yuqori tartibli differensial tenglamalar',
      bullets: [
        'Asosiy tushunchalar va teoremalar: tartibni pasaytirish usullari.',
        'Chiziqli differensial tenglamalar (CHDT): bir jinsli va bir jinsli boʻlmagan tenglamalar.',
        'Vronskiy determinanti va yechimlarning chiziqli bogʻliqligini tekshirish.',
        'Oʻzgarmas koeffitsiyentli CHDT: xarakteristik tenglama ildizlari.',
      ]
    },
    {
      title: '3-bob: Differensial tenglamalar sistemasi',
      bullets: [
        'Normal sistema, yechim tushunchasi.',
        'Sistemalarni yechish usullari: yoʻqotish va integrallanuvchi kombinatsiyalar.',
        'Matritsali usul: xos qiymatlar yordamida yechish.'
      ]
    },
    {
      title: '4-bob: Barqarorlik nazariyasi va xususiy hosilali tenglamalar',
      bullets: [
        'Lyapunov maʼnosida barqarorlik, fazoviy trayektoriyalar.',
        'Koshi masalasi va xususiy hosilali tenglamalarni klassifikatsiyalash.'
      ]
    }
  ];

  const getStudyNotes = (question) => {
    const text = question.toLowerCase();
    const notes = [];
    if (text.includes('koshi') || text.includes('initial') || text.includes('boshlang')) {
      notes.push('Koshi masalasi: boshlang‘ich shart bilan berilgan differensial tenglama uchun bitta unikal yechim topish nazariyasi. Bu 1-bob va 4-bob mavzularida muhim.');
    }
    if (text.includes('bir jinsli') || text.includes('homogen') || text.includes('homogeneous')) {
      notes.push('Bir jinsli differensial tenglamalar: yechimni topish uchun o‘zgaruvchilarni ajratish, muhit funktsiyasi va integralni qo‘llash zarur.');
    }
    if (text.includes('bernulli') || text.includes('rikkati')) {
      notes.push('Bernulli va Rikkati tenglamalari aynan 1-bob bosqichida yechish algoritmi bilan o‘rganiladi. Rikkati tenglamasi odatda berilgan tasavvur bilan oldingi bir jinsli tenglamaga aylantiriladi.');
    }
    if (text.includes('vronskiy') || text.includes('determinant')) {
      notes.push('Vronskiy determinanti yordamida CHDT yechimlari chiziqli bog‘liqligini tekshirish mumkin. Agar determinant nolga teng bo‘lmasa, yechimlar chiziqli mustaqil.');
    }
    if (text.includes('barqarorlik') || text.includes('lyapunov')) {
      notes.push('Lyapunov barqarorligi: tizimning boshlang‘ich shartlariga nisbatan kichik perturbatsiyalardan keyin ham boʻrimlikni saqlashi muhim.');
    }
    if (text.includes('tartib') || text.includes('yuqori tartib')) {
      notes.push('Tartibni pasaytirish usullari yuqori tartibli differensial tenglamalarni 1-bobga qaytarish va ularni oddiy differensial tenglamalar tarzida yechish uchun qo‘llaniladi.');
    }
    if (text.includes('savol') || text.includes('qayer') || text.includes('nima')) {
      notes.push('Agar sizning savolingiz tushunarsiz nuqtaga bog‘liq bo‘lsa, o‘qituvchidan aynan qaysi bosqichda e’tibor yo‘qolganini so‘rashingiz foydali.');
    }
    if (!notes.length) {
      notes.push('Ushbu mavzular 1-bobdan 4-bobgacha bo‘lgan asosiy diferensial tenglamalar kontseptsiyalarini qamrab oladi. Asosiy e’tibor birinchi tartibli, yuqori tartibli, sistemalar va barqarorlik nazariyasiga qaratilishi kerak.');
    }
    return notes.join(' ');
  };

  const handleFinishLesson = () => {
    setLessonFinished(true);
    showToast('Dars yakunlandi. Endi o‘rganish eslatmalari va quizni boshlashingiz mumkin.');
  };

  const handleAskQuestion = () => {
    if (!questionInput.trim()) {
      showToast('Iltimos, savol kiriting.');
      return;
    }
    const notes = getStudyNotes(questionInput);
    setStudyNotes(notes);
    setQuestionInput("");
    showToast('AI Yordamchi savolingizga oid eslatmalar tayyorladi.');
  };

  // Sync personal score with live simulated eye/attention metrics
  useEffect(() => {
    if (!liveMetrics) return;
    setPersonalScore(Math.round((liveMetrics.attention * 0.6) + (liveMetrics.focus * 0.4)));
  }, [liveMetrics]);

  // Raise hand action
  const handleRaiseHand = () => {
    setHandRaised(!handRaised);
    showToast(handRaised ? "Qo'lingiz tushirildi." : "Qo'lingiz ko'tarildi! O'qituvchiga xabar yuborildi.");
  };

  // Quick feedback toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const buildLocalQuiz = (metrics) => {
    const focus = metrics?.focus ?? 100;
    const attention = metrics?.attention ?? 100;
    const lowLabel = focus < attention ? 'Focus' : 'Attention';

    if (focus < 55 && attention < 55) {
      setQuizHint('Persistently low focus and attention detected. Bu holatda diqqatni tiklash strategiyalariga oid savollarni tanladik.');
      return [
        {
          id: 1,
          question: 'Dars vaqtida diqqat darajasi tushib ketganda nima qilish kerak?',
          options: ['Qisqa tanaffus qilish', 'Koʻproq yozuv olib, lekin tinglamaslik', 'Matnni toʻliq eʼtiborsiz qoldirish'],
          answer: 'Qisqa tanaffus qilish'
        },
        {
          id: 2,
          question: 'Ekranga qarab turib diqqatni saqlash uchun eng yaxshi amaliyot qaysi?',
          options: ['Qisqa savol berish', 'Boshqa oynaga qarash', 'Telefonni ishlatish'],
          answer: 'Qisqa savol berish'
        },
        {
          id: 3,
          question: 'Privacy Shield funksiyasi nimani taʼminlaydi?',
          options: ['Foydalanuvchi maʼlumotlarini maxfiy saqlashni', 'Internet tezligini oshirishni', 'Video sifatini yaxshilashni'],
          answer: 'Foydalanuvchi maʼlumotlarini maxfiy saqlashni'
        }
      ];
    }

    if (focus < 70) {
      setQuizHint(`Past fokus kuzatildi (${focus}%). Focus-ga oid savollar tanlandi.`);
      return [
        {
          id: 1,
          question: 'Fokus pasayganda qaerga qarash yaxshi emas?',
          options: ['Telefon ekraniga', 'Oʻqituvchi taqdimotiga', 'Oʻquv kitobiga'],
          answer: 'Telefon ekraniga'
        },
        {
          id: 2,
          question: 'Fokusni tiklash uchun qaysi metod samaraliroq?',
          options: ['20-20-20 qoidasi', 'Uyquni toʻxtatish', 'Oshqozonni toʻldirish'],
          answer: '20-20-20 qoidasi'
        },
        {
          id: 3,
          question: 'Yuz tahlili nima uchun dars monitoringida foydali?',
          options: ['Diqqat va kayfiyatni baholash uchun', 'Internetni tezlashtirish uchun', 'Audio yozuv uchun'],
          answer: 'Diqqat va kayfiyatni baholash uchun'
        }
      ];
    }

    if (attention < 70) {
      setQuizHint(`Diqqat pasayishi aniqlangan (${attention}%). Shu borada savollar tanlandi.`);
      return [
        {
          id: 1,
          question: 'Diqqat pasayganda darsga qaytish uchun nima qilish foydali?',
          options: ['Qisqa savol-javob sessiyasi', 'Oʻzini yolgʻiz qoldirish', 'Ovqat isteʼmol qilish'],
          answer: 'Qisqa savol-javob sessiyasi'
        },
        {
          id: 2,
          question: 'Agar siz darsda nofokus boʼlsangiz, qaysi holat eng koʼp uchraydi?',
          options: ['Oʻzingizni chalgʻitib qoʻyish', 'Oʻqituvchiga qarash', 'Dars materialini qayta ko‘rib chiqish'],
          answer: 'Oʻzingizni chalgʻitib qoʻyish'
        },
        {
          id: 3,
          question: 'Yuz ifodalarini tahlil qilish nima uchun muhim?',
          options: ['Talabaning ehtiyojini yaxshiroq tushunish uchun', 'Video sifatini oshirish uchun', 'Ranglarni sozlash uchun'],
          answer: 'Talabaning ehtiyojini yaxshiroq tushunish uchun'
        }
      ];
    }

    setQuizHint(`${lowLabel} normal. Umumiy bilimni mustahkamlovchi quiz tayyorlandi.`);
    return [
      {
        id: 1,
        question: 'AI darslarida eng muhim maqsad nima?',
        options: ['Oʻquvchini jalb qilish', 'Oʻqituvchini almashtirish', 'Baholashni osongina qilish'],
        answer: 'Oʻquvchini jalb qilish'
      },
      {
        id: 2,
        question: 'Quizni darsdan keyin oʻtkazish nimani oshiradi?',
        options: ['Xotirani mustahkamlash', 'Sinfdoshlar bilan raqobat', 'Dars vaqtini qisqartirish'],
        answer: 'Xotirani mustahkamlash'
      },
      {
        id: 3,
        question: 'Privacy Shield funksiyasi nimani taʼminlaydi?',
        options: ['Avtorizatsiyani', 'Foydalanuvchi maʼlumotlarini maxfiy saqlashni', 'Internet tezligini'],
        answer: 'Foydalanuvchi maʼlumotlarini maxfiy saqlashni'
      }
    ];
  };

  const handleStartQuiz = async () => {
    if (!lessonFinished) {
      showToast('Darsni tugatmaguningizcha quizni boshlash mumkin emas.');
      return;
    }
    setQuizStarted(true);
    setQuizSubmitted(false);
    setQuizAnswers({});
    showToast('Darsdan keyingi quiz tayyorlanmoqda...');

    const generatedQuestions = await fetchGeminiFocusQuiz(liveMetrics);
    if (generatedQuestions && generatedQuestions.length > 0) {
      setQuizQuestions(generatedQuestions);
      setQuizSource('gemini');
      setQuizHint('Gemini asosida eʼtiborsiz joylarga moslashtirilgan quiz.');
      showToast('Gemini yordamida yaratilgan fokusga mos quiz yuklandi.');
    } else {
      const localQuestions = buildLocalQuiz(liveMetrics);
      setQuizQuestions(localQuestions);
      setQuizSource('local');
      showToast('Fokusga asoslangan lokal quiz yuklandi.');
    }
  };

  const handleSelectAnswer = (questionId, option) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    const score = quizQuestions.filter(q => quizAnswers[q.id] === q.answer).length;
    showToast(`Quiz yakunlandi: ${score}/${quizQuestions.length} to'g'ri javob.`);
  };

  // Quick notes simulation and confusion tracking
  const handleQuickQuestion = () => {
    const entry = {
      time: new Date().toLocaleTimeString(),
      attention: liveMetrics?.attention ?? null,
      focus: liveMetrics?.focus ?? null
    };
    if (onConfusionMark) {
      onConfusionMark(entry);
    }
    showToast("Tushunarsiz nuqta belgilandi va AI qayd etdi.");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
      
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-purple-600 border border-purple-400 text-white font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 z-50 animate-bounce">
          <Bell className="w-5 h-5 animate-swing" />
          <span className="text-sm">{toastMessage}</span>
        </div>
      )}

      {/* LEFT COLUMN: Personal Telemetry & Status */}
      <div className="md:col-span-1 flex flex-col gap-6">
        
        {/* Personal Vibe Score */}
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>
          
          <span className="font-bold text-sm tracking-wider uppercase text-gray-400 border-b border-white/5 pb-2 w-full text-center">
            Mening Dars Faolligim
          </span>

          <div className="flex flex-col items-center justify-center mt-6 relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="52" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
              <circle 
                cx="64" 
                cy="64" 
                r="52" 
                stroke="url(#cyanGradient)" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray={326.7}
                strokeDashoffset={326.7 - (326.7 * personalScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white">{personalScore}%</span>
              <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest">Faollik</span>
            </div>
          </div>

          <div className="flex justify-around w-full mt-6 text-center border-t border-white/5 pt-4">
            <div>
              <span className="text-lg font-bold text-white">#1</span>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Guruhda o'rnim</p>
            </div>
            <div>
              <span className="text-lg font-bold text-emerald-400">Excellent</span>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Darajam</p>
            </div>
          </div>
        </div>

        {/* Local Privacy Shield Stats */}
        <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-xs tracking-wider uppercase text-gray-200">Xavfsizlik & Maxfiylik</span>
            </div>
            <span className="text-[9px] bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 font-bold px-1.5 py-0.5 rounded">
              AES-256
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Kamera Tahlili:</span>
              <span className="font-bold text-emerald-400">Local (Brauzerda)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Shaxsiy shifrlash:</span>
              <span className="font-bold text-emerald-400">Yoqilgan</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Loglarni o'chirish:</span>
              <span className="font-bold text-cyan-400 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                {formatTime(logsTimer)} daqiqa
              </span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
              <p className="text-[10px] text-gray-400 leading-normal">
                <strong>Eslatma:</strong> Barcha yuz mesh, ovoz va harakat ma'lumotlaringiz shifrlanadi. Serverga hech qanday video yoki audio fayl uzatilmaydi - faqat tahliliy koeffitsientlar yuboriladi.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* MIDDLE & RIGHT COLUMNS: AI Vibe Coach, Actions, Interactive booster */}
      <div className="md:col-span-2 flex flex-col gap-6">

        {/* AI Vibe Coach */}
        <div className="glass-card rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl"></div>

          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Heart className="w-5 h-5 text-purple-400 animate-pulse" />
            <h3 className="font-bold text-sm tracking-wider uppercase text-gray-200">AI Vibe Coach (Siz uchun shaxsiy)</h3>
          </div>

          <div className="flex flex-col gap-4">
            {/* Condition alert 1 */}
            <div className="bg-purple-900/15 border border-purple-500/20 p-4 rounded-xl flex gap-3">
              <Zap className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold text-xs text-purple-300">Faollik Maslahati</span>
                <p className="text-xs text-gray-200 leading-relaxed">
                  Siz oxirgi 15 daqiqa davomida juda diqqat bilan tingladingiz. Biroq, savol-javobda ishtirok etmadingiz. Keyingi muhokamada o'z fikringizni bildiring yoki ovozingizni yoqib darsda qatnashing!
                </p>
              </div>
            </div>

            {/* Health alert 2 */}
            <div className="bg-cyan-900/15 border border-cyan-500/20 p-4 rounded-xl flex gap-3">
              <Award className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold text-xs text-cyan-300">Sog'lom Ishchi Muhit</span>
                <p className="text-xs text-gray-200 leading-relaxed">
                  Ko'zlaringiz diqqat koeffitsienti 90% dan yuqori bo'ldi. Dars orasida ko'z muskullarini bo'shashtirish uchun 20 soniya davomida uzoqdagi nuqtaga qarab turishni tavsiya qilamiz (20-20-20 qoidasi).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Classroom Interactive Actions */}
        <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
          <span className="font-bold text-sm tracking-wider uppercase text-gray-200">Tezkor Interaktiv Amallar</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Raise Hand Button */}
            <button 
              onClick={handleRaiseHand}
              className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 border font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                handRaised 
                  ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-95' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-200'
              }`}
            >
              <span className="text-2xl">{handRaised ? "🖐️" : "✋"}</span>
              <span>{handRaised ? "Qo'lni Tushirish" : "Qo'l Ko'tarish"}</span>
            </button>

            {/* Don't understand action */}
            <button 
              onClick={handleQuickQuestion}
              className="bg-white/5 border border-white/10 hover:bg-white/10 p-4 rounded-xl flex flex-col items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all"
            >
              <span className="text-2xl">🤷‍♂️</span>
              <span>Tushunarsiz Nuqta</span>
            </button>

            {/* Quick Quiz simulated indicator */}
            <button 
              onClick={handleStartQuiz}
              className="bg-white/5 border border-white/10 hover:bg-white/10 p-4 rounded-xl flex flex-col items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all relative overflow-hidden"
            >
              <span className="text-2xl">📝</span>
              <span>Darsga Fokus Quiz</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            </button>
          </div>
        </div>

        {/* Lesson Completion Panel */}
        <div className="glass-card rounded-2xl p-5 flex flex-col gap-4 border border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm tracking-wider uppercase text-gray-200">Dars mavzusi va tugatish</span>
          </div>

          <div className="grid gap-3 text-[10px] text-gray-300">
            {lessonSections.map((section) => (
              <div key={section.title} className="bg-slate-950/50 border border-white/5 p-3 rounded-xl">
                <p className="font-semibold text-white text-[11px]">{section.title}</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
                  {section.bullets.map((bullet, index) => (
                    <li key={index}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleFinishLesson}
              className={`w-full rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all ${lessonFinished ? 'bg-slate-700 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
              disabled={lessonFinished}
            >
              {lessonFinished ? 'Dars tugallangan' : 'Darsni tugatish'}
            </button>
            <div className="text-[10px] text-gray-400">
              {lessonFinished ? 'Siz darsni tugatdingiz. Endi AI yordamchi savolga javob beradi va quiz tayyorlaydi.' : 'Darsni tugatish tugmasini bosing, so‘ngra quiz va o‘rganish eslatmalari ko‘rsatiladi.'}
            </div>
            <div className="text-[10px] text-cyan-300">
              {confusionLog.length ? `Tushunarsiz nuqtalar: ${confusionLog.length}.` : 'Hozirgacha tushunarsiz nuqta belgilanmadi.'}
            </div>
          </div>
        </div>

        {/* Darsdan Keyingi Quiz */}
        <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm tracking-wider uppercase text-gray-200">Darsdan Keyingi Quiz</span>
          </div>

          <p className="text-[10px] text-gray-400 leading-relaxed">
            Dars yakunlangach, qisqa interaktiv quiz orqali o'rganganlaringizni mustahkamlang.
          </p>

          {!quizStarted && (
            <button
              onClick={handleStartQuiz}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition-all"
            >
              Quizni boshlash
            </button>
          )}

          {quizStarted && (
            <div className="space-y-4">
              <div className="text-[10px] text-cyan-300 uppercase tracking-wider font-semibold">
                {quizSource === 'gemini' ? 'Gemini generatsiyalangan fokusga mos quiz' : 'Lokal fokusga mos quiz'}
              </div>
              {quizHint && (
                <div className="text-[10px] text-gray-400">
                  {quizHint}
                </div>
              )}

              {quizQuestions.map((item) => (
                <div key={item.id} className="bg-slate-900/60 border border-white/5 p-3 rounded-xl">
                  <p className="text-[11px] font-bold text-white mb-2">{item.id}. {item.question}</p>
                  <div className="grid gap-2">
                    {item.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSelectAnswer(item.id, option)}
                        className={`w-full text-left rounded-lg px-3 py-2 text-[10px] transition-all border ${quizAnswers[item.id] === option ? 'border-cyan-500 bg-cyan-500/10 text-cyan-200' : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSubmitQuiz}
                  disabled={quizSubmitted}
                  className={`w-full rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all ${quizSubmitted ? 'bg-slate-700 text-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
                >
                  {quizSubmitted ? 'Quiz topshirildi' : 'Quizni topshirish'}
                </button>
                {quizSubmitted && (
                  <div className="text-[10px] text-gray-400">
                    Quiz natijalaringiz tahlil qilinmoqda. O'qituvchi keyinchalik baholaydi.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI Study Companion (Copilot Helper Box) */}
        <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-sm tracking-wider uppercase text-gray-200">AI Yordamchi (Study Companion)</span>
          </div>
          
          <div className="flex gap-2 flex-col sm:flex-row">
            <input 
              type="text" 
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="Dars yuzasidan savol bering (AI tushuntirib beradi)..." 
              className="flex-1 bg-slate-900 border border-white/10 px-4 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAskQuestion();
                }
              }}
            />
            <button 
              onClick={handleAskQuestion}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
            >
              So'rash
            </button>
          </div>
          <div className="text-[10px] text-gray-400">
            Masalan: <em>"20-20-20 qoidasi nima?"</em> yoki <em>"O'qituvchining oxirgi tushuntirishini kimyoviy misol bilan yozib bering."</em>
          </div>
          {studyNotes && (
            <div className="bg-slate-950/50 border border-white/10 p-4 rounded-xl text-[10px] text-gray-200">
              <div className="font-semibold text-[11px] text-white mb-2">AI Yordamchi eslatmalari:</div>
              <p>{studyNotes}</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
