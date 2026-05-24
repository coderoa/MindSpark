import React, { useState, useEffect } from 'react';
import { Sparkles, Users, User, Shield, Brain } from 'lucide-react';
import CameraSimulator from './components/CameraSimulator';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import PrivacyPanel from './components/PrivacyPanel';
import AIReport from './components/AIReport';

function App() {
  const [activeRole, setActiveRole] = useState('teacher'); // 'teacher' or 'student'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'privacy', 'report'
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [confusionLog, setConfusionLog] = useState([]);
  
  // Shared Live Webcam Stream State
  const [webcamStream, setWebcamStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  // Capture webcam once at the global level
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 640 }, 
        height: { ideal: 480 },
        facingMode: "user"
      } 
    })
    .then(stream => {
      setWebcamStream(stream);
      setCameraError(null);
    })
    .catch(err => {
      console.warn("Webcam access denied or unavailable at App level:", err);
      setCameraError("Kamera ulanmadi (Ruxsat berilmagan yoki kamera band)");
    });

    // Cleanup: stop camera on unmount
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      
      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <header className="glass-card sticky top-0 z-40 border-b border-white/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white m-0 leading-none">
              Class<span className="text-gradient-purple font-black">Vibe</span> AI
            </h1>
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-1">
              Multimodal AI Classroom Analytics
            </p>
          </div>
        </div>

        {/* Presentation Controls: Active Role Switcher */}
        <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.4)]">
          <button
            type="button"
            onClick={() => {
              setActiveRole('teacher');
              setActiveTab('dashboard');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeRole === 'teacher'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            O'qituvchi Rejimi
          </button>
          
          <button
            type="button"
            onClick={() => {
              setActiveRole('student');
              setActiveTab('dashboard');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeRole === 'student'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <User className="w-4 h-4" />
            Talaba Rejimi
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* LEFT COLUMN (1/4 space on desktop): Live Multimodal Capture Feed */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <CameraSimulator 
            isTeacher={activeRole === 'teacher'} 
            webcamStream={webcamStream}
            cameraError={cameraError}
            onMetricChange={(metrics) => setLiveMetrics(metrics)} 
          />
        </div>

        {/* RIGHT COLUMN (3/4 space on desktop): Active Telemetry Dashboard Workspace */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          
          {/* Glass Navbar Tabs */}
          <div className="glass-card rounded-2xl p-2 flex gap-1 border border-white/5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                activeTab === 'dashboard'
                  ? (activeRole === 'teacher' 
                    ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                    : 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]')
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Boshqaruv Paneli (Dashboard)
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                activeTab === 'privacy'
                  ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              Ma'lumotlar Himoyasi
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                activeTab === 'report'
                  ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <Brain className="w-4 h-4" />
              AI Hisobot
            </button>

          </div>

          {/* Active Workstation Render */}
          <div className="flex-1 transition-all duration-300">
            {activeTab === 'dashboard' && (
              activeRole === 'teacher' 
                ? <TeacherDashboard liveMetrics={liveMetrics} webcamStream={webcamStream} confusionLog={confusionLog} /> 
                : <StudentDashboard liveMetrics={liveMetrics} onConfusionMark={(entry) => setConfusionLog(prev => [entry, ...prev])} />
            )}
            
            {activeTab === 'privacy' && <PrivacyPanel />}

            {activeTab === 'report' && <AIReport webcamStream={webcamStream} />}
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 text-center mt-10">
        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">
          ClassVibe AI © 2026. Barcha huquqlar himoyalangan. Prototip.
        </p>
      </footer>

    </div>
  );
}

export default App;
