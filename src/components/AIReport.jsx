import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, RefreshCw, Brain, TrendingUp, BarChart3, AlertTriangle, CheckCircle, Info, Loader, Camera } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid, PieChart, Pie } from 'recharts';
import useFaceAnalysis from '../hooks/useFaceAnalysis';

const EXPRESSION_COLORS = {
  happy: '#10b981',
  neutral: '#6b7280',
  sad: '#3b82f6',
  angry: '#ef4444',
  fearful: '#f59e0b',
  disgusted: '#8b5cf6',
  surprised: '#06b6d4'
};

export default function AIReport({ webcamStream }) {
  const videoRef = useRef(null);
  const [reportData, setReportData] = useState(null);
  const [showReport, setShowReport] = useState(false);

  const {
    modelsLoaded,
    modelLoadProgress,
    currentExpression,
    faceDetected,
    analysisCount,
    history,
    generateReport,
    resetSession,
    EXPRESSION_LABELS,
    EXPRESSION_EMOJI
  } = useFaceAnalysis(videoRef, true);

  // Bind webcam stream to video element
  useEffect(() => {
    if (videoRef.current && webcamStream) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  const handleGenerateReport = () => {
    const report = generateReport();
    setReportData(report);
    setShowReport(true);
  };

  const handleResetSession = () => {
    resetSession();
    setReportData(null);
    setShowReport(false);
  };

  // Print/download the report
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6">

      {/* SECTION 1: Live Analysis Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Live Camera Feed with Expression Overlay */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Camera className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-sm tracking-wider uppercase text-gray-200">Jonli Yuz Tahlili</span>
          </div>

          <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden border border-white/5">
            {webcamStream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-xs">
                Kamera yuklanmoqda...
              </div>
            )}

            {/* Model Loading Overlay */}
            {!modelsLoaded && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 z-10">
                <Loader className="w-8 h-8 text-purple-400 animate-spin" />
                <span className="text-xs text-purple-300 font-bold uppercase tracking-wider">
                  {modelLoadProgress || 'AI Modellar yuklanmoqda...'}
                </span>
                <p className="text-[10px] text-gray-500 max-w-[200px] text-center">
                  Birinchi marta yuklash 5-15 soniya davom etishi mumkin
                </p>
              </div>
            )}

            {/* Live Expression Badge */}
            {modelsLoaded && currentExpression && faceDetected && (
              <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-sm rounded-xl p-3 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{currentExpression.emoji}</span>
                  <div>
                    <span className="text-sm font-bold text-white">{currentExpression.labelUz}</span>
                    <p className="text-[9px] text-gray-400 uppercase">
                      Ishonchlilik: {(currentExpression.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-purple-400 font-bold">{analysisCount} kadr</span>
                </div>
              </div>
            )}

            {/* Face not detected warning */}
            {modelsLoaded && !faceDetected && (
              <div className="absolute bottom-3 left-3 right-3 bg-amber-600/90 rounded-xl p-2.5 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-white" />
                <span className="text-[10px] text-white font-bold uppercase">Yuz aniqlanmadi — kameraga qarang</span>
              </div>
            )}

            {/* Live Tag */}
            {modelsLoaded && faceDetected && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                <span className="text-[9px] font-bold text-green-500 tracking-wider">AI TAHLIL</span>
              </div>
            )}
          </div>

          {/* All Expressions Mini Bars */}
          {modelsLoaded && currentExpression && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Barcha ifodalar (Real-time)</span>
              {Object.entries(currentExpression.all)
                .sort(([, a], [, b]) => b - a)
                .map(([label, confidence]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-xs w-4">{EXPRESSION_EMOJI[label]}</span>
                    <span className="text-[10px] text-gray-300 w-24 truncate">{EXPRESSION_LABELS[label]}</span>
                    <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.round(confidence * 100)}%`,
                          backgroundColor: EXPRESSION_COLORS[label]
                        }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-gray-400 w-10 text-right font-mono">
                      {(confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleGenerateReport}
              disabled={history.length < 5}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                history.length >= 5
                  ? 'bg-purple-600 hover:bg-purple-700 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                  : 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FileText className="w-4 h-4" />
              AI Hisobot ({history.length} kadr)
            </button>
            <button
              onClick={handleResetSession}
              className="px-3 py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 transition-all"
              title="Sessiyani qayta boshlash"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Report or Placeholder */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {!showReport || !reportData ? (
            /* Placeholder — waiting for report generation */
            <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
              <div className="w-20 h-20 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Brain className="w-10 h-10 text-purple-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white">AI Tahliliy Hisobot</h3>
              <p className="text-sm text-gray-400 max-w-md">
                Dars davomida yuzingizni kameraga qarating. AI tizimi sizning yuz ifodalari (xursandchilik, g'amginlik, hayrat, neytral va h.k.) ni real vaqtda tahlil qiladi.
                Yetarlicha ma'lumot yig'ilgach, <strong className="text-purple-400">"AI Hisobot"</strong> tugmasini bosing — sizga batafsil hisobot tayyorlanadi.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                  <span className="text-[10px] text-gray-300 font-bold uppercase">
                    {modelsLoaded ? `Tahlil qilinmoqda: ${analysisCount} kadr` : 'Model yuklanmoqda...'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* GENERATED AI REPORT */
            <div className="flex flex-col gap-6 print:bg-white print:text-black" id="ai-report-content">

              {/* Report Header */}
              <div className="glass-card rounded-2xl p-6 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/15 rounded-full blur-3xl"></div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-white">ClassVibe AI — Yuz Ifodasi Tahliliy Hisoboti</h2>
                      <p className="text-xs text-gray-400">Yaratilgan: {reportData.generatedAt}</p>
                    </div>
                  </div>
                  <button
                    onClick={handlePrintReport}
                    className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-2 rounded-xl text-xs font-bold text-gray-300 transition-all print:hidden"
                  >
                    <Download className="w-4 h-4" />
                    Yuklab olish
                  </button>
                </div>

                {/* Session Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  <div className="bg-slate-900/50 rounded-xl p-3 text-center border border-white/5">
                    <span className="text-2xl font-extrabold text-white">{reportData.engagementScore}%</span>
                    <p className="text-[9px] text-purple-400 font-bold uppercase mt-1">Jalb qilinganlik</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-3 text-center border border-white/5">
                    <span className="text-2xl font-extrabold text-white">{reportData.totalFrames}</span>
                    <p className="text-[9px] text-cyan-400 font-bold uppercase mt-1">Tahlil kadrlar</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-3 text-center border border-white/5">
                    <span className="text-2xl font-extrabold text-white">{reportData.sessionDuration}</span>
                    <p className="text-[9px] text-emerald-400 font-bold uppercase mt-1">Sessiya davomiyligi</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-3 text-center border border-white/5 flex flex-col items-center">
                    <span className="text-2xl">{reportData.dominantOverall.emoji}</span>
                    <p className="text-[9px] text-pink-400 font-bold uppercase mt-1">Asosiy kayfiyat</p>
                  </div>
                </div>
              </div>

              {/* Expression Distribution Chart */}
              <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <span className="font-bold text-sm tracking-wider uppercase text-gray-200">Yuz Ifodalari Taqsimoti</span>
                </div>
                
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.expressionDistribution} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <XAxis 
                        dataKey="labelUz" 
                        stroke="#6b7280" 
                        fontSize={10} 
                        tickLine={false}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis stroke="#6b7280" fontSize={10} tickLine={false} unit="%" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        formatter={(value) => [`${value}%`, 'Ulushi']}
                      />
                      <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                        {reportData.expressionDistribution.map((entry) => (
                          <Cell key={entry.label} fill={EXPRESSION_COLORS[entry.label]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 justify-center">
                  {reportData.expressionDistribution.map(entry => (
                    <div key={entry.label} className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: EXPRESSION_COLORS[entry.label] }}></div>
                      <span className="text-[10px] text-gray-300 font-semibold">{entry.emoji} {entry.labelUz}: {entry.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engagement Timeline */}
              {reportData.chartData.length > 2 && (
                <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold text-sm tracking-wider uppercase text-gray-200">Ifodalar Dinamikasi (Vaqt bo'yicha)</span>
                  </div>

                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={reportData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="happyGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="neutralGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="sadGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={9} tickLine={false} />
                        <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={9} tickLine={false} unit="%" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        />
                        <Area type="monotone" dataKey="happy" name="😊 Xursand" stroke="#10b981" strokeWidth={2} fill="url(#happyGrad)" />
                        <Area type="monotone" dataKey="neutral" name="😐 Neytral" stroke="#6b7280" strokeWidth={1.5} fill="url(#neutralGrad)" />
                        <Area type="monotone" dataKey="sad" name="😢 G'amgin" stroke="#3b82f6" strokeWidth={1.5} fill="url(#sadGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* AI Insights */}
              <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
                  <span className="font-bold text-sm tracking-wider uppercase text-gray-200">AI Sun'iy Intellekt Xulosalari</span>
                </div>

                <div className="flex flex-col gap-3">
                  {reportData.insights.map((insight, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border flex gap-3 ${
                      insight.type === 'positive' 
                        ? 'bg-emerald-500/10 border-emerald-500/20' 
                        : insight.type === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/20'
                        : 'bg-red-500/10 border-red-500/20'
                    }`}>
                      {insight.type === 'positive' 
                        ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        : insight.type === 'warning'
                        ? <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        : <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      }
                      <p className="text-xs text-gray-200 leading-relaxed">{insight.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold text-sm tracking-wider uppercase text-gray-200">AI Tavsiyalari (O'qituvchi uchun)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reportData.recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-cyan-500/5 border border-cyan-500/15 p-3.5 rounded-xl flex gap-2.5">
                      <span className="text-cyan-400 font-extrabold text-sm mt-0.5">{idx + 1}.</span>
                      <p className="text-xs text-gray-200 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engagement Score Final Badge */}
              <div className={`glass-card rounded-2xl p-6 flex items-center justify-between border-l-4 ${
                reportData.engagementScore > 70 
                  ? 'border-emerald-500' 
                  : reportData.engagementScore > 40 
                  ? 'border-amber-500' 
                  : 'border-red-500'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white ${
                    reportData.engagementScore > 70 ? 'bg-emerald-600' : reportData.engagementScore > 40 ? 'bg-amber-600' : 'bg-red-600'
                  }`}>
                    {reportData.engagementScore > 70 ? 'A' : reportData.engagementScore > 40 ? 'B' : 'C'}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">
                      Umumiy Baho: {reportData.engagementScore > 70 ? 'A\'lo' : reportData.engagementScore > 40 ? 'O\'rta' : 'Past'} ({reportData.engagementScore}%)
                    </h4>
                    <p className="text-xs text-gray-400">
                      {reportData.engagementScore > 70 
                        ? 'Talaba dars materialiga yuqori darajada jalb qilingan. Dars samarali o\'tmoqda.' 
                        : reportData.engagementScore > 40
                        ? 'Talaba qisman jalb qilingan. Darsni interaktiv qilish tavsiya etiladi.'
                        : 'Talaba darsga kam jalb qilingan. Dars uslubini o\'zgartirish zarur.'}
                    </p>
                  </div>
                </div>
                <span className="text-4xl">
                  {reportData.engagementScore > 70 ? '🏆' : reportData.engagementScore > 40 ? '📊' : '⚠️'}
                </span>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
