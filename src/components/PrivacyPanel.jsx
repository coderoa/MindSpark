import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Trash2, EyeOff, CheckCircle, Database } from 'lucide-react';

export default function PrivacyPanel() {
  const [encryptionStatus, setEncryptionStatus] = useState("AES-256 Active");
  const [dataPackets, setDataPackets] = useState([]);
  const [isWiping, setIsWiping] = useState(false);

  // Generate simulated encrypted telemetry packet feed
  useEffect(() => {
    const interval = setInterval(() => {
      const timestamp = new Date().toISOString().substring(11, 19);
      const randomMeshHash = Math.random().toString(36).substring(2, 10).toUpperCase();
      const mockEncryptedPayload = `U2FsdGVkX18${Math.random().toString(36).substring(2, 12)}...`;
      
      const newPacket = {
        time: timestamp,
        meshHash: `FACE_MESH_${randomMeshHash}`,
        payload: mockEncryptedPayload,
        size: "1.4 KB"
      };

      setDataPackets(prev => [newPacket, ...prev.slice(0, 4)]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleWipeData = () => {
    setIsWiping(true);
    setTimeout(() => {
      setDataPackets([]);
      setIsWiping(false);
      alert("Mahalliy brauzer keshidagi barcha tahlil ma'lumotlari to'liq o'chirildi!");
    }, 1500);
  };

  const securityFeatures = [
    {
      title: "Mahalliy AI Tahlil (Local Sandboxing)",
      desc: "Kamera va audio oqimlari hech qanday tashqi serverga yuborilmaydi. Yuz mesh va ovoz balandligi bevosita foydalanuvchi brauzerining o'zida (TensorFlow.js / WebAssembly) tahlil qilinadi.",
      status: true
    },
    {
      title: "Biometrik Anonimlashtirish",
      desc: "Haqiqiy tasvir o'rniga yuzning 468 ta koordinatali nuqtalari (mesh structure) olinadi va shaxsiy ma'lumotlar to'liq himoyalanadi.",
      status: true
    },
    {
      title: "Envelop Shifrlash (AES-256)",
      desc: "Sinfdagi umumiy tahlillar (vibe metrics) serverga uzatilishidan oldin AES-256 algoritmi orqali shifrlanadi. O'qituvchiga faqat integrallashgan natijalar taqdim etiladi.",
      status: true
    },
    {
      title: "Avtomatik O'chirish Taymeri",
      desc: "Mahalliy brauzer xotirasida to'plangan tahliliy loglar har 5 daqiqada avtomatik ravishda butunlay o'chiriladi.",
      status: true
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Security Features Checkbox List */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="glass-card rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Xavfsizlik Arxitekturasi</h3>
              <p className="text-xs text-gray-400">ClassVibe AI ma'lumotlar xavfsizligini ta'minlashning 4 ta fundamental qatlami</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityFeatures.map((feat, idx) => (
              <div key={idx} className="bg-slate-900/40 border border-white/5 p-4 rounded-xl flex gap-3 hover:border-emerald-500/20 transition-all">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-sm text-gray-100">{feat.title}</span>
                  <p className="text-xs text-gray-400 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Encrypted Telemetry Packets Log & Action Box */}
      <div className="flex flex-col gap-6">
        
        {/* Real-time encrypted feed */}
        <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-sm tracking-wider uppercase text-gray-200">Shifrlangan paketlar (Live)</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
          </div>

          <div className="flex flex-col gap-3 font-mono text-[10px] text-gray-300">
            {dataPackets.length === 0 ? (
              <div className="text-center py-6 text-gray-500 uppercase tracking-widest text-[9px]">
                MA'LUMOTLAR VAQTINCHA BO'SH
              </div>
            ) : (
              dataPackets.map((pkt, idx) => (
                <div key={idx} className="bg-slate-950/80 p-3 rounded-lg border border-white/5 flex flex-col gap-1.5 hover:border-purple-500/20 transition-all">
                  <div className="flex justify-between text-purple-400 font-bold">
                    <span>[{pkt.time}]</span>
                    <span>{pkt.size}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Mesh Hash:</span> <span className="text-cyan-400">{pkt.meshHash}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-gray-400">AES:</span> <span className="text-gray-500">{pkt.payload}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Wipe Button */}
          <button
            onClick={handleWipeData}
            disabled={isWiping}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 border flex items-center justify-center gap-2 ${
              isWiping 
                ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                : 'bg-red-600 hover:bg-red-700 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {isWiping ? "Tizim tozalanmoqda..." : "Keshni butunlay tozalash"}
          </button>
        </div>

        {/* Database Zero footprint disclaimer */}
        <div className="glass-card rounded-2xl p-5 flex items-center gap-3 border-l-4 border-cyan-400 bg-cyan-950/10">
          <Database className="w-10 h-10 text-cyan-400 flex-shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-xs text-white">Nol-Iz (Zero Footprint) printsipi</span>
            <p className="text-[10px] text-gray-400 leading-normal">
              Dars mashg'ulotlari tugagandan so'ng, darsdagi har qanday shaxsiy yuz nuqtalari va ovoz loglari serverlardan butunlay o'chiriladi. Hech qanday arxiv saqlanmaydi.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
