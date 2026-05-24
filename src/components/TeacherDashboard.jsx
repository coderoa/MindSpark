import React, { useState, useEffect, useRef } from 'react';
import { Users, AlertTriangle, Lightbulb, Sparkles, UserCheck, MessageSquare, TrendingUp, Grid, Table, VideoOff, Mic, Eye } from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from "recharts";

export default function TeacherDashboard({ liveMetrics, webcamStream, confusionLog }) {

  const [classEngagement, setClassEngagement] = useState(76);
  const [viewMode, setViewMode] = useState('grid');
  const videoRef = useRef(null);

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      message: "Sinf diqqat darajasi o'zgarib turibdi.",
      time: "Hozir"
    }
  ]);

  const [chartData, setChartData] = useState([
    { name: '09:00', engagement: 82 },
    { name: '09:05', engagement: 79 },
    { name: '09:10', engagement: 85 },
    { name: '09:15', engagement: 74 },
    { name: '09:20', engagement: 88 },
    { name: '09:25', engagement: 81 },
    { name: '09:30', engagement: 76 }
  ]);

  // =========================
  // REAL-TIME SIMULATION LOOP
  // =========================
  useEffect(() => {
    if (!liveMetrics) return;

    const interval = setInterval(() => {
      const randomValue = Math.random();

      // ALERT GENERATION
      if (randomValue > 0.8) {
        const tips = [
          "Ovoz faolligi oshdi.",
          "Diqqat darajasi yuqori.",
          "Sinfda charchoq belgilari kuzatilmoqda.",
          "Interaktivlik oshdi."
        ];

        const newAlert = {
          id: Date.now(),
          type: Math.random() > 0.5 ? "tip" : "info",
          message: tips[Math.floor(Math.random() * tips.length)],
          time: "Hozir"
        };

        setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
      }

      // CHART UPDATE
      setChartData(prev => {
        const next = [...prev];
        next.shift();

        next.push({
          name: new Date().toLocaleTimeString(),
          engagement: Math.round(
            ((liveMetrics?.attention ?? 70) +
              (liveMetrics?.focus ?? 75) +
              80 +
              65) / 4
          )
        });

        return next;
      });

      // CLASS ENGAGEMENT UPDATE
      setClassEngagement(
        Math.round(liveMetrics?.attention ?? 75)
      );

    }, 3000);

    return () => clearInterval(interval);
  }, [liveMetrics]);

  // =========================
  // CAMERA STREAM BIND
  // =========================
  useEffect(() => {
    if (videoRef.current && webcamStream && viewMode === 'grid') {
      videoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream, viewMode]);

  // =========================
  // MOCK STUDENTS
  // =========================
  const students = [
    {
      id: "1",
      name: "Sardor (Siz)",
      mood: "Qiziqqan",
      focus: liveMetrics?.focus ?? 90,
      speaking: liveMetrics?.speechRate > 0 ? "Gapirmoqda" : "Muted",
      status: liveMetrics?.attention > 75 ? "Fokusda" : "Normal",
      interaction: `${liveMetrics?.keystrokes ?? 45} WPM`,
      color: "#a855f7"
    },
    {
      id: "2",
      name: "Hilola Karimova",
      mood: "Fikrli",
      focus: 85,
      speaking: "Muted",
      status: "Fokusda",
      interaction: "65 WPM",
      color: "#10b981"
    },
    {
      id: "3",
      name: "Javohir Aliev",
      mood: "Charchagan",
      focus: 48,
      speaking: "Muted",
      status: "Chalg'igan",
      interaction: "5 WPM",
      color: "#f59e0b"
    },
    {
      id: "4",
      name: "Nigora Sobirova",
      mood: "Qiziqqan",
      focus: 94,
      speaking: "Gapirmoqda",
      status: "Fokusda",
      interaction: "55 WPM",
      color: "#3b82f6"
    }
  ];

  return (
    <div className="p-4 text-white">
      
      {/* HEADER */}
      <div className="mb-4">
        <h1 className="text-xl font-bold">Teacher Dashboard</h1>
        <p className="text-sm text-gray-400">
          Live AI Classroom Monitoring
        </p>
      </div>

      {/* CLASS STATUS */}
      <div className="p-4 rounded-xl bg-gray-900 mb-4">
        <h2 className="text-lg">Class Engagement: {classEngagement}%</h2>
      </div>

      {/* ALERTS */}
      <div className="space-y-2 mb-4">
        {confusionLog?.length > 0 && (
          <div className="p-3 bg-slate-900 rounded border border-amber-500/10 text-[11px] text-amber-300">
            <div className="font-bold mb-2">Student confusion log</div>
            <div className="space-y-1">
              {confusionLog.slice(0, 3).map((entry, index) => (
                <div key={index} className="flex justify-between gap-3">
                  <span>{entry.time}</span>
                  <span>Attention: {entry.attention ?? 'N/A'}%</span>
                  <span>Focus: {entry.focus ?? 'N/A'}%</span>
                </div>
              ))}
            </div>
            {confusionLog.length > 3 && (
              <div className="mt-2 text-[10px] text-gray-400">+{confusionLog.length - 3} more confusion points logged</div>
            )}
          </div>
        )}
        {alerts.map(alert => (
          <div key={alert.id} className="p-3 bg-gray-800 rounded">
            {alert.message}
          </div>
        ))}
      </div>

      {/* STUDENTS */}
      <div className="grid grid-cols-2 gap-3">
        {students.map(s => (
          <div key={s.id} className="p-3 bg-gray-800 rounded">
            <h3 className="font-bold">{s.name}</h3>
            <p>Focus: {s.focus}%</p>
            <p>Status: {s.status}</p>
          </div>
        ))}
      </div>

    </div>
  );
}