import React, { useState } from 'react';
import { Award, DollarSign, Cpu, FileText, ArrowRight, Shield, Activity, RefreshCw } from 'lucide-react';

export default function HackathonInfo() {
  const [selectedScoreCard, setSelectedScoreCard] = useState('innovation');

  const scoringData = {
    innovation: {
      title: "Innovation & Creativity (30 ball)",
      points: [
        "Ko'p kanalli tahlil (Multimodal Analytics): Faqatgina veb-kamerani kuzatibgina qolmay, klaviatura yozish tezligi, sichqoncha harakati va audio to'lqinlarini ham parallel tahlil qila oladi.",
        "Privacy Shield (Maxfiylik qalqoni): Foydalanuvchi xohlasa haqiqiy veb-kamera oqimi o'rniga, uning yuz harakatlarini aks ettiruvchi 3D simli avatar (wireframe model) ga o'tishi mumkin. Bu biometrik ma'lumotlar sir qolishini ta'minlaydi.",
        "Darsda diqqatni saqlab qolish bo'yicha real-vaqtda o'qituvchiga aqlli AI tavsiyalarni yetkazadigan yagona interaktiv sinf boshqaruvi."
      ],
      color: 'border-purple-500 text-purple-400'
    },
    fit: {
      title: "Problem-Solution Fit (20 ball)",
      points: [
        "Muammo: Masofaviy ta'limda (Zoom, Teams va boshqalar) talabalarning darsga qanchalik jalb etilganini o'qituvchi bilmaydi, bu esa ta'lim sifati tushishiga sabab bo'ladi.",
        "Yechim: Real vaqt rejimida har bir talabaning jalb qilinganlik indeksi, charchash darajasini tahlil qiladi va darsni interaktiv qilish bo'yicha darhol tavsiyalar beradi.",
        "Talaba uchun foyda: AI Coach orqali charchashni oldini olish va o'quv samaradorligini oshirish bo'yicha doimiy ko'makchi."
      ],
      color: 'border-cyan-500 text-cyan-400'
    },
    presentation: {
      title: "Presentation & Completeness (20 ball)",
      points: [
        "To'liq ishlaydigan prototip: Loyihada real-vaqtda o'zgaruvchi metrikalar, simulyatsiyali yuz/ko'z tahlili, chiroyli diagrammalar (Recharts) to'liq integratsiya qilingan.",
        "Ikkala rol simulyatsiyasi: O'qituvchi boshqaruv paneli va Talabaning shaxsiy ishchi stoli o'rtasida oson o'tish orqali dars jarayonini ikkala tomondan ko'rsatish imkoniyati.",
        "Dizayn: Premium Dark Mode va Glassmorphism arxitekturasi orqali hakamlarda birinchi soniyadanoq ajoyib vizual taassurot qoldirish."
      ],
      color: 'border-emerald-500 text-emerald-400'
    },
    technical: {
      title: "Technical Execution & Code (30 ball)",
      points: [
        "Browser-Local AI Processing: Barcha biometrik ma'lumotlar TensorFlow.js yordamida bevosita brauzerning o'zida tahlil qilinadi, serverga video/audio oqim yuborilmaydi (Zero biometrics leak).",
        "Modulli arxitektura: React 19 va Vite muhitida Tailwind CSS v4 yordamida tezkor, yengil va mukammal strukturalangan toza kod yozilgan.",
        "Security & State tracking: AES-256 shifrlash simulyatsiyasi, avtomatik ma'lumotlarni tozalash taymerlari va xavfsiz state boshqaruvi."
      ],
      color: 'border-pink-500 text-pink-400'
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. HACKATHON SCORING MATRIX */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Scoring cards selector */}
        <div className="glass-card rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
            <Award className="w-6 h-6 text-purple-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Hakaton Baholash Mezonlari</h3>
              <p className="text-xs text-gray-400">ClassVibe AI qanday qilib hakamlar tomonidan maksimal ball olishga mo'ljallangan?</p>
            </div>
          </div>

          {/* Quick tab buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.keys(scoringData).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedScoreCard(key)}
                className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  selectedScoreCard === key
                    ? 'bg-purple-500/10 border-purple-500 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400'
                }`}
              >
                {key === 'innovation' ? "Innovation 30p" : 
                 key === 'fit' ? "Problem Fit 20p" : 
                 key === 'presentation' ? "Completeness 20p" : "Technical 30p"}
              </button>
            ))}
          </div>

          {/* Card Content */}
          <div className={`p-5 rounded-xl border bg-slate-950/40 transition-all ${scoringData[selectedScoreCard].color}`}>
            <h4 className="font-bold text-sm mb-3 uppercase tracking-wider text-white">
              {scoringData[selectedScoreCard].title}
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-gray-300 list-disc list-inside leading-relaxed">
              {scoringData[selectedScoreCard].points.map((pt, index) => (
                <li key={index} className="pl-1">
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2. SYSTEM ARCHITECTURE VISUAL FLOW */}
        <div className="glass-card rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm tracking-wider uppercase text-gray-200">Loyiha Texnik Arxitekturasi</span>
          </div>

          <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 py-4 text-center">
            
            {/* Step 1 */}
            <div className="flex-1 bg-slate-900/60 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-2 relative">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold border border-purple-500/30">
                1
              </div>
              <span className="font-bold text-xs text-white">Multimodal Capture</span>
              <p className="text-[10px] text-gray-400">Veb-kamera mesh, Audio to'lqin, Klaviatura/Mouse harakatlar</p>
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-cyan-400 font-bold text-lg">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex-1 bg-slate-900/60 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-2 relative">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold border border-cyan-500/30">
                2
              </div>
              <span className="font-bold text-xs text-white">Local TF.js Extraction</span>
              <p className="text-[10px] text-gray-400">Biometrik tahlil foydalanuvchining o'z brauzerida ishlaydi (AES-256)</p>
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-cyan-400 font-bold text-lg">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex-1 bg-slate-900/60 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/30">
                3
              </div>
              <span className="font-bold text-xs text-white">Aggregated Vibe Dial</span>
              <p className="text-[10px] text-gray-400">Xavfsiz ma'lumotlar oqimi sinf boshqaruv paneliga birlashtiriladi</p>
            </div>

          </div>
        </div>

      </div>

      {/* 3. BUSINESS MODEL & SAAS CANVASES */}
      <div className="flex flex-col gap-6">
        
        {/* Business monetization card */}
        <div className="glass-card rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>

          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <DollarSign className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm tracking-wider uppercase text-gray-200">Tijoratlashtirish Modelimiz</span>
          </div>

          <div className="flex flex-col gap-4">
            
            {/* SaaS School package */}
            <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex flex-col gap-1.5 hover:border-cyan-500/20 transition-all">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-white">SaaS: Maktab va Universitetlar</span>
                <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full">$2/talaba/oy</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal">
                Xususiy maktablar va oliygohlarga masofaviy dars sifati va talabalar faolligini oshirish uchun bulutli litsenziya.
              </p>
            </div>

            {/* LMS Integration SDK */}
            <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex flex-col gap-1.5 hover:border-purple-500/20 transition-all">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-white">LMS Platformalar uchun SDK</span>
                <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full">Custom API</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal">
                Zoom, Microsoft Teams, Coursera yoki mahalliy LMS (Moodle, Hemis) platformalari bilan integratsiya qilish uchun tayyor API SDK paketi.
              </p>
            </div>

            {/* Corporate training */}
            <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex flex-col gap-1.5 hover:border-emerald-500/20 transition-all">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-white">Korporativ Ta'lim</span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">B2B model</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal">
                Kompaniyalarning o'z xodimlarini masofaviy malaka oshirish darslarida ishtirok etish darajasini o'lchash korporativ paketi.
              </p>
            </div>

          </div>
        </div>

        {/* Pitch advice */}
        <div className="glass-card rounded-2xl p-5 flex items-start gap-3 bg-purple-950/15 border-l-4 border-purple-500">
          <FileText className="w-10 h-10 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-xs text-white">Pitch Deck Maslahati</span>
            <p className="text-[10px] text-gray-400 leading-normal">
              Taqdimot paytida dars jarayonida o'qituvchining AI tavsiyalarga qanchalik tez amal qilishini va talabaning Maxfiylik qalqoni (Privacy Shield) qanchalik qulay ekanligini alohida ta'kidlang. Hakamlar ushbu funksiyani juda yuqori baholashadi!
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
