import React, { useState, useEffect, useRef } from 'react';
import { Camera, Shield, Eye, Activity, Mic, ShieldAlert, Monitor, VideoOff, AlertTriangle, Loader } from 'lucide-react';
import useFaceAnalysis from '../hooks/useFaceAnalysis';

export default function CameraSimulator({ isTeacher = false, webcamStream, cameraError, onMetricChange }) {
  const [isPrivacyOn, setIsPrivacyOn] = useState(false);
  const videoRef = useRef(null);

  const {
    modelsLoaded,
    modelLoadProgress,
    currentExpression,
    faceDetected,
    analysisCount,
    eyeOpenness,
    mouthOpenness,
    headTilt,
    isYawning,
    isEyesClosed,
    attentionScore,
    focusScore,
    moodLabel
  } = useFaceAnalysis(videoRef, !isPrivacyOn && !!webcamStream);

  // Bind the shared webcam stream to the video DOM element
  useEffect(() => {
    if (videoRef.current && webcamStream && !isPrivacyOn) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream, isPrivacyOn]);

  // Propagate REAL metrics to parent App
  useEffect(() => {
    if (onMetricChange && modelsLoaded) {
      onMetricChange({
        attention: attentionScore,
        focus: focusScore,
        mood: moodLabel,
        speechRate: 0,
        keystrokes: 0,
        mouseMovement: 0,
        faceDetected,
        isYawning,
        isEyesClosed
      });
    }
  }, [attentionScore, focusScore, moodLabel, faceDetected, isYawning, isEyesClosed, modelsLoaded, onMetricChange]);

  const streamActive = webcamStream && !isPrivacyOn;

  // Color helper for attention bar
  const getAttentionColor = (score) => {
    if (score > 70) return 'bg-emerald-500';
    if (score > 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getAttentionLabel = (score) => {
    if (!modelsLoaded) return 'AI yuklanmoqda...';
    if (!faceDetected) return 'Yuz topilmadi';
    if (isEyesClosed) return '💤 Uxlayapti';
    if (isYawning) return '🥱 Esnamoqda';
    if (score > 70) return '✅ Diqqatli';
    if (score > 40) return '⚠️ O\'rtacha';
    return '🔴 Past';
  };

  return (
    <div className="glass-card rounded-2xl p-5 overflow-hidden flex flex-col gap-4 relative">
      {/* Glow Effect */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${isPrivacyOn ? 'bg-cyan-500' : 'bg-purple-500'}`}></div>
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Camera className={`w-5 h-5 ${isPrivacyOn ? 'text-cyan-400' : 'text-purple-400'}`} />
          <span className="font-semibold text-xs tracking-wider uppercase">
            {isTeacher ? "AI Kuzatuv (Sinf xonasi)" : "Jonli Kamera & AI Tahlil"}
          </span>
        </div>
        
        {!isTeacher && (
          <button
            onClick={() => setIsPrivacyOn(!isPrivacyOn)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all border ${
              isPrivacyOn 
                ? 'bg-cyan-500/10 border-cyan-400/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
            }`}
          >
            <Shield className={`w-3.5 h-3.5 ${isPrivacyOn ? 'animate-pulse' : ''}`} />
            {isPrivacyOn ? "Privacy: ON" : "Privacy: OFF"}
          </button>
        )}
      </div>

      {/* Camera Screen */}
      <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center border border-white/5 shadow-inner">
        
        {isPrivacyOn ? (
          /* Privacy Mode: Wireframe avatar */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            
            <div className="w-36 h-44 rounded-full border-2 border-cyan-400/40 relative flex items-center justify-center bg-cyan-950/20 shadow-[0_0_25px_rgba(6,182,212,0.15)] animate-pulse-slow">
              <div className="absolute top-16 left-6 w-8 h-4 rounded-full border border-cyan-400/50 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>
              </div>
              <div className="absolute top-16 right-6 w-8 h-4 rounded-full border border-cyan-400/50 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>
              </div>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 144 176">
                <line x1="72" y1="0" x2="72" y2="176" stroke="rgba(34, 211, 238, 0.15)" strokeDasharray="3,3" />
                <line x1="0" y1="88" x2="144" y2="88" stroke="rgba(34, 211, 238, 0.15)" strokeDasharray="3,3" />
                <circle cx="72" cy="100" r="3" fill="#22d3ee" />
                <path d="M 45 130 Q 72 150 99 130" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            
            <div className="absolute bottom-4 bg-cyan-950/80 border border-cyan-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-[9px] uppercase font-bold text-cyan-400 tracking-widest">Anonimlashtirildi</span>
            </div>
          </div>
        ) : (
          /* Real Webcam Feed */
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            {webcamStream ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <VideoOff className="w-12 h-12 text-gray-600 mb-2 animate-bounce" />
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  {cameraError ? cameraError : "Kamera ruxsati kutilmoqda..."}
                </span>
              </div>
            )}

            {/* AI Model Loading Overlay */}
            {webcamStream && !modelsLoaded && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 gap-2">
                <Loader className="w-6 h-6 text-purple-400 animate-spin" />
                <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">
                  {modelLoadProgress || 'AI model yuklanmoqda...'}
                </span>
              </div>
            )}

            {/* YAWNING / SLEEPING ALERT OVERLAY */}
            {modelsLoaded && faceDetected && isEyesClosed && (
              <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center z-10 pointer-events-none">
                <div className="bg-red-600/90 px-4 py-2 rounded-xl flex items-center gap-2 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                  <AlertTriangle className="w-5 h-5 text-white" />
                  <span className="text-sm font-bold text-white">💤 UXLAYAPTI — Diqqat: {attentionScore}%</span>
                </div>
              </div>
            )}

            {modelsLoaded && faceDetected && isYawning && !isEyesClosed && (
              <div className="absolute top-3 left-3 bg-amber-600/90 px-3 py-1.5 rounded-lg flex items-center gap-1.5 z-10 animate-bounce shadow-md">
                <span className="text-sm">🥱</span>
                <span className="text-[10px] font-bold text-white uppercase">Esnash aniqlandi!</span>
              </div>
            )}

            {/* Live expression badge */}
            {modelsLoaded && currentExpression && faceDetected && (
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur px-2.5 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 z-10">
                <span className="text-lg">{currentExpression.emoji}</span>
                <div>
                  <span className="text-[10px] font-bold text-white">{currentExpression.labelUz}</span>
                  <p className="text-[8px] text-gray-400">{(currentExpression.confidence * 100).toFixed(0)}% ishonch</p>
                </div>
              </div>
            )}

            {/* Live tag */}
            {modelsLoaded && streamActive && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-md z-10">
                <span className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-green-500 animate-ping' : 'bg-red-500'}`}></span>
                <span className={`text-[9px] font-bold tracking-wider ${faceDetected ? 'text-green-500' : 'text-red-500'}`}>
                  {faceDetected ? 'AI ACTIVE' : 'NO FACE'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* REAL Telemetry Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Attention — REAL from face analysis */}
        <div className="glass-panel rounded-xl p-3 flex flex-col gap-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Diqqat</span>
            <Eye className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-xl font-bold ${attentionScore > 70 ? 'text-emerald-400' : attentionScore > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
              {attentionScore}%
            </span>
          </div>
          <div className="text-[9px] font-bold mt-0.5"
            style={{ color: attentionScore > 70 ? '#10b981' : attentionScore > 40 ? '#f59e0b' : '#ef4444' }}
          >
            {getAttentionLabel(attentionScore)}
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full transition-all duration-700 ${getAttentionColor(attentionScore)}`} 
              style={{ width: `${attentionScore}%` }}
            ></div>
          </div>
        </div>

        {/* Focus — REAL from face geometry */}
        <div className="glass-panel rounded-xl p-3 flex flex-col gap-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Ko'z Fokusi</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-xl font-bold ${focusScore > 70 ? 'text-cyan-400' : focusScore > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
              {focusScore}%
            </span>
          </div>
          <div className="text-[9px] font-bold mt-0.5 text-cyan-400">
            {!faceDetected ? 'Yuz topilmadi' : focusScore > 70 ? 'Ekranga qarayapti' : focusScore > 40 ? 'Qisman' : 'Boshqa tomonga'}
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-cyan-500 transition-all duration-700" 
              style={{ width: `${focusScore}%` }}
            ></div>
          </div>
        </div>

        {/* Mood — REAL expression */}
        <div className="glass-panel rounded-xl p-3 flex flex-col gap-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Kayfiyat</span>
            <span className="text-xs">{currentExpression ? currentExpression.emoji : '—'}</span>
          </div>
          <div className="flex items-baseline mt-1">
            <span className={`text-sm font-bold ${
              isEyesClosed ? 'text-red-400' : isYawning ? 'text-amber-400' : 'text-gradient-purple'
            }`}>
              {moodLabel || '—'}
            </span>
          </div>
          <div className="text-[9px] text-gray-400 mt-1 uppercase font-bold">Kamera orqali aniq tahlil</div>
        </div>

        {/* Eye / Mouth Geometry Stats */}
        <div className="glass-panel rounded-xl p-3 flex flex-col gap-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Geometriya</span>
            <Monitor className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex flex-col gap-1.5 mt-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-gray-400">👁️ Ko'z ochiq:</span>
              <span className={`text-[10px] font-bold ${isEyesClosed ? 'text-red-400' : 'text-emerald-400'}`}>
                {isEyesClosed ? 'Yopiq ❌' : `${(eyeOpenness * 100).toFixed(0)}%`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-gray-400">👄 Og'iz:</span>
              <span className={`text-[10px] font-bold ${isYawning ? 'text-amber-400' : 'text-gray-300'}`}>
                {isYawning ? 'Esnayapti 🥱' : `${(mouthOpenness * 100).toFixed(0)}%`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-gray-400">↩️ Bosh burchagi:</span>
              <span className={`text-[10px] font-bold ${headTilt > 20 ? 'text-amber-400' : 'text-gray-300'}`}>
                {headTilt.toFixed(0)}°
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Count */}
      {modelsLoaded && (
        <div className="text-center text-[9px] text-gray-500 font-semibold uppercase tracking-widest">
          AI tomonidan tahlil qilingan kadrlar: {analysisCount}
        </div>
      )}
    </div>
  );
}
