import { useRef, useState, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';

const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

// Uzbek labels for expressions
const EXPRESSION_LABELS = {
  neutral: 'Neytral',
  happy: 'Xursand',
  sad: 'G\'amgin',
  angry: 'G\'azablangan',
  fearful: 'Qo\'rqinchli',
  disgusted: 'Norozilik',
  surprised: 'Hayratda'
};

const EXPRESSION_EMOJI = {
  neutral: '😐',
  happy: '😊',
  sad: '😢',
  angry: '😠',
  fearful: '😨',
  disgusted: '🤢',
  surprised: '😲'
};

// Euclidean distance helper
function dist(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// Eye Aspect Ratio (EAR) — measures how open/closed eyes are
// Low EAR (~< 0.2) = eyes closed (sleeping/heavy blink)
// Normal EAR (~0.25-0.35) = eyes open
function computeEAR(landmarks) {
  const pts = landmarks.positions;
  // Left eye: 36-41
  const leftEAR = (dist(pts[37], pts[41]) + dist(pts[38], pts[40])) / (2 * dist(pts[36], pts[39]));
  // Right eye: 42-47
  const rightEAR = (dist(pts[43], pts[47]) + dist(pts[44], pts[46])) / (2 * dist(pts[42], pts[45]));
  return (leftEAR + rightEAR) / 2;
}

// Mouth Aspect Ratio (MAR) — measures how open the mouth is
// High MAR (> 0.5) = yawning
// Low MAR (< 0.3) = mouth closed
function computeMAR(landmarks) {
  const pts = landmarks.positions;
  // Outer mouth vertical: dist(51,57) + dist(52,56) + dist(53,55)
  // Outer mouth horizontal: dist(48,54)
  const vertSum = dist(pts[51], pts[57]) + dist(pts[52], pts[56]) + dist(pts[53], pts[55]);
  const horiz = dist(pts[48], pts[54]);
  if (horiz === 0) return 0;
  return vertSum / (3 * horiz);
}

// Head tilt detection — if the face is tilted heavily, person might be resting head
function computeHeadTilt(landmarks) {
  const pts = landmarks.positions;
  // Compare y-coordinates of left eye center vs right eye center
  const leftEyeCenter = { x: (pts[36].x + pts[39].x) / 2, y: (pts[36].y + pts[39].y) / 2 };
  const rightEyeCenter = { x: (pts[42].x + pts[45].x) / 2, y: (pts[42].y + pts[45].y) / 2 };
  const dx = rightEyeCenter.x - leftEyeCenter.x;
  const dy = rightEyeCenter.y - leftEyeCenter.y;
  // Return tilt angle in degrees (0 = level, >15 = significantly tilted)
  return Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
}

export default function useFaceAnalysis(videoRef, isActive) {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelLoadProgress, setModelLoadProgress] = useState('');
  const [currentExpression, setCurrentExpression] = useState(null);
  const [history, setHistory] = useState([]);
  const [faceDetected, setFaceDetected] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [sessionStart, setSessionStart] = useState(null);

  // Geometric face metrics
  const [eyeOpenness, setEyeOpenness] = useState(0.3);   // 0 = closed, 0.35 = wide open
  const [mouthOpenness, setMouthOpenness] = useState(0.2); // 0.2 = closed, >0.5 = yawning
  const [headTilt, setHeadTilt] = useState(0);             // degrees
  const [isYawning, setIsYawning] = useState(false);
  const [isEyesClosed, setIsEyesClosed] = useState(false);

  // Derived engagement metrics (REAL, not simulated)
  const [attentionScore, setAttentionScore] = useState(0);
  const [focusScore, setFocusScore] = useState(0);
  const [moodLabel, setMoodLabel] = useState('—');

  // Consecutive no-face counter for smoothing
  const noFaceCountRef = useRef(0);
  const lowEarCountRef = useRef(0);

  const intervalRef = useRef(null);

  // Load face-api.js models
  useEffect(() => {
    if (!isActive) return;

    async function loadModels() {
      try {
        setModelLoadProgress('TinyFaceDetector modeli yuklanmoqda...');
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        
        setModelLoadProgress('FaceExpression modeli yuklanmoqda...');
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

        setModelLoadProgress('FaceLandmark modeli yuklanmoqda...');
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);

        setModelsLoaded(true);
        setModelLoadProgress('');
        setSessionStart(Date.now());
      } catch (err) {
        console.error('Failed to load face-api models:', err);
        setModelLoadProgress('Modellarni yuklashda xatolik yuz berdi. Sahifani yangilang.');
      }
    }

    loadModels();
  }, [isActive]);

  // Run face detection loop
  useEffect(() => {
    if (!modelsLoaded || !isActive || !videoRef?.current) return;

    const detectFace = async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      try {
        const detections = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 }))
          .withFaceLandmarks(true)
          .withFaceExpressions();

        if (detections) {
          noFaceCountRef.current = 0;
          setFaceDetected(true);

          const expressions = detections.expressions;
          const landmarks = detections.landmarks;

          // ===== GEOMETRIC ANALYSIS =====
          const ear = computeEAR(landmarks);
          const mar = computeMAR(landmarks);
          const tilt = computeHeadTilt(landmarks);

          setEyeOpenness(ear);
          setMouthOpenness(mar);
          setHeadTilt(tilt);

          // Yawning detection: mouth wide open
          const yawning = mar > 0.5;
          setIsYawning(yawning);

          // Eyes closed detection with consecutive frame smoothing
          const eyesClosed = ear < 0.19;
          if (eyesClosed) {
            lowEarCountRef.current++;
          } else {
            lowEarCountRef.current = 0;
          }
          // Only flag as "sleeping" if eyes closed for 3+ consecutive frames (~2 seconds)
          const sustainedEyesClosed = lowEarCountRef.current >= 3;
          setIsEyesClosed(sustainedEyesClosed);

          // ===== EXPRESSION ANALYSIS =====
          let maxLabel = 'neutral';
          let maxConf = 0;
          Object.entries(expressions).forEach(([label, confidence]) => {
            if (confidence > maxConf) {
              maxConf = confidence;
              maxLabel = label;
            }
          });

          const expData = {
            label: maxLabel,
            labelUz: EXPRESSION_LABELS[maxLabel],
            emoji: EXPRESSION_EMOJI[maxLabel],
            confidence: maxConf,
            all: Object.fromEntries(
              Object.entries(expressions).map(([k, v]) => [k, parseFloat(v.toFixed(4))])
            )
          };

          setCurrentExpression(expData);

          // ===== DERIVE ACCURATE ATTENTION SCORE =====
          // Factors: eye openness, expression engagement, yawning penalty, head tilt penalty
          let attention = 0;

          // Base attention from eye openness (0-40 points)
          const eyeScore = Math.min(40, Math.max(0, (ear - 0.15) / (0.30 - 0.15) * 40));
          attention += eyeScore;

          // Expression engagement bonus (0-35 points)
          // happy/surprised = high engagement, neutral = moderate, sad/angry/fearful = low
          const expressionEngagement = {
            happy: 35,
            surprised: 30,
            neutral: 18,
            fearful: 8,
            sad: 5,
            angry: 5,
            disgusted: 3
          };
          attention += (expressionEngagement[maxLabel] || 15);

          // Face detection confidence bonus (0-15 points)
          attention += detections.detection.score * 15;

          // Penalty: head tilt > 20 degrees (resting head on hand/desk)
          if (tilt > 20) {
            attention -= Math.min(25, (tilt - 20) * 1.5);
          }

          // Penalty: yawning
          if (yawning) {
            attention -= 20;
          }

          // Penalty: sustained eyes closed (sleeping!)
          if (sustainedEyesClosed) {
            attention = Math.min(attention, 10); // Cap at 10% if sleeping
          }

          // Penalty: single frame eyes closed (blinking — small penalty)
          if (eyesClosed && !sustainedEyesClosed) {
            attention -= 5;
          }

          const finalAttention = Math.max(0, Math.min(100, Math.round(attention)));
          setAttentionScore(finalAttention);

          // ===== DERIVE FOCUS SCORE =====
          // Focus = is the person looking at the screen? (face visible + eyes open + head straight)
          let focus = 0;
          // Face is detected and centered = good focus base
          focus += detections.detection.score * 50;
          // Eyes open = looking
          focus += Math.min(30, Math.max(0, (ear - 0.15) / (0.28 - 0.15) * 30));
          // Head straight = facing screen
          focus += Math.max(0, 20 - tilt);

          if (sustainedEyesClosed) {
            focus = Math.min(focus, 5);
          }

          const finalFocus = Math.max(0, Math.min(100, Math.round(focus)));
          setFocusScore(finalFocus);

          // ===== DERIVE MOOD LABEL =====
          let mood = EXPRESSION_LABELS[maxLabel];
          if (sustainedEyesClosed) {
            mood = 'Uxlayapti 💤';
          } else if (yawning) {
            mood = 'Esnamoqda 🥱';
          } else if (maxLabel === 'neutral' && ear < 0.22) {
            mood = 'Charchagan';
          }
          setMoodLabel(mood);

          // ===== RECORD TO HISTORY =====
          setAnalysisCount(prev => prev + 1);
          setHistory(prev => {
            const entry = {
              timestamp: Date.now(),
              timeLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              dominant: maxLabel,
              dominantUz: EXPRESSION_LABELS[maxLabel],
              emoji: EXPRESSION_EMOJI[maxLabel],
              confidence: maxConf,
              expressions: expData.all,
              ear: parseFloat(ear.toFixed(3)),
              mar: parseFloat(mar.toFixed(3)),
              tilt: parseFloat(tilt.toFixed(1)),
              attention: finalAttention,
              focus: finalFocus,
              isYawning: yawning,
              isEyesClosed: sustainedEyesClosed,
              mood
            };
            const next = [...prev, entry];
            return next.length > 500 ? next.slice(-500) : next;
          });

        } else {
          // No face detected
          noFaceCountRef.current++;
          
          // After 3 consecutive no-face frames, flag as not present
          if (noFaceCountRef.current >= 3) {
            setFaceDetected(false);
            setAttentionScore(0);
            setFocusScore(0);
            setMoodLabel('Yuz topilmadi');
            setIsEyesClosed(false);
            setIsYawning(false);
          }
        }
      } catch (err) {
        // Silently ignore intermittent detection errors
      }
    };

    intervalRef.current = setInterval(detectFace, 600);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [modelsLoaded, isActive, videoRef]);

  // Generate comprehensive AI report from accumulated history
  const generateReport = useCallback(() => {
    if (history.length === 0) return null;

    const sessionDuration = sessionStart ? Math.round((Date.now() - sessionStart) / 1000) : 0;
    const durationMin = Math.floor(sessionDuration / 60);
    const durationSec = sessionDuration % 60;

    // Expression frequency counts
    const expressionCounts = {};
    const expressionConfidenceSum = {};
    let totalYawns = 0;
    let totalEyesClosed = 0;
    let totalAttention = 0;
    let totalFocus = 0;

    history.forEach(entry => {
      const d = entry.dominant;
      expressionCounts[d] = (expressionCounts[d] || 0) + 1;
      expressionConfidenceSum[d] = (expressionConfidenceSum[d] || 0) + entry.confidence;
      if (entry.isYawning) totalYawns++;
      if (entry.isEyesClosed) totalEyesClosed++;
      totalAttention += entry.attention;
      totalFocus += entry.focus;
    });

    // Calculate percentages
    const total = history.length;
    const expressionDistribution = Object.entries(expressionCounts)
      .map(([label, count]) => ({
        label,
        labelUz: EXPRESSION_LABELS[label],
        emoji: EXPRESSION_EMOJI[label],
        count,
        percentage: parseFloat(((count / total) * 100).toFixed(1)),
        avgConfidence: parseFloat((expressionConfidenceSum[label] / count).toFixed(3))
      }))
      .sort((a, b) => b.count - a.count);

    // Dominant expression overall
    const dominantOverall = expressionDistribution[0];

    // Average engagement score from REAL attention data
    const engagementScore = Math.round(totalAttention / total);
    const avgFocus = Math.round(totalFocus / total);

    // Yawning and sleep percentages
    const yawnPercentage = parseFloat(((totalYawns / total) * 100).toFixed(1));
    const sleepPercentage = parseFloat(((totalEyesClosed / total) * 100).toFixed(1));

    // Timeline chart data for Recharts (sampled every Nth entry)
    const chartData = [];
    const step = Math.max(1, Math.floor(history.length / 30));
    for (let i = 0; i < history.length; i += step) {
      const entry = history[i];
      chartData.push({
        name: entry.timeLabel,
        attention: entry.attention,
        focus: entry.focus,
        happy: Math.round((entry.expressions.happy || 0) * 100),
        neutral: Math.round((entry.expressions.neutral || 0) * 100),
        sad: Math.round((entry.expressions.sad || 0) * 100),
      });
    }

    // Generate AI insights based on REAL data
    const insights = [];
    
    if (engagementScore > 70) {
      insights.push({
        type: 'positive',
        text: `O'rtacha diqqat darajasi ${engagementScore}% — talaba darsga yuqori darajada jalb qilingan.`
      });
    } else if (engagementScore > 40) {
      insights.push({
        type: 'warning',
        text: `O'rtacha diqqat darajasi ${engagementScore}% — talaba qisman jalb qilingan. Darsga ko'proq interaktiv elementlar qo'shish tavsiya etiladi.`
      });
    } else {
      insights.push({
        type: 'concern',
        text: `O'rtacha diqqat darajasi juda past — ${engagementScore}%. Talaba dars materialiga kam e'tibor qaratmoqda.`
      });
    }

    if (yawnPercentage > 10) {
      insights.push({
        type: 'concern',
        text: `Talaba darsning ${yawnPercentage}% qismida esnadi. Bu charchoq yoki darsning bir xilligidan dalolat beradi. Qisqa tanaffus yoki mashg'ulot turini o'zgartirish tavsiya etiladi.`
      });
    }

    if (sleepPercentage > 5) {
      insights.push({
        type: 'concern',
        text: `Ko'zlar yopiq holat ${sleepPercentage}% kuzatildi — talaba mudrab qolgan yoki uxlayotgan bo'lishi mumkin. Zudlik bilan e'tibor qaratish lozim.`
      });
    }

    if (dominantOverall.label === 'happy' && dominantOverall.percentage > 30) {
      insights.push({
        type: 'positive',
        text: `Talabaning asosiy kayfiyati "${dominantOverall.labelUz}" (${dominantOverall.percentage}%). Dars materialidan mamnun ekanligi ko'rinadi.`
      });
    }

    if (dominantOverall.label === 'neutral' && dominantOverall.percentage > 60) {
      insights.push({
        type: 'warning',
        text: `Talaba darsning ${dominantOverall.percentage}% qismida neytral holatda. Bu passiv tinglovchilik belgisi bo'lishi mumkin.`
      });
    }

    if ((expressionCounts['sad'] || 0) / total > 0.1) {
      const sadPct = ((expressionCounts['sad'] / total) * 100).toFixed(1);
      insights.push({
        type: 'concern',
        text: `G'amginlik ifodasi ${sadPct}% kuzatildi. Bu tushunmaslik yoki motivatsiya tushishidan dalolat berishi mumkin.`
      });
    }

    // Recommendations
    const recommendations = [];
    if (engagementScore < 50) {
      recommendations.push('Darsga interaktiv savol-javob seanslarini qo\'shing.');
      recommendations.push('Har 15 daqiqada qisqa tanaffus yoki guruh muhokamasi o\'tkazing.');
    }
    if (yawnPercentage > 5) {
      recommendations.push('Talaba charchagan — 2 daqiqalik yengil jismoniy mashq yoki ko\'z dam olishi tavsiya etiladi.');
    }
    if (sleepPercentage > 3) {
      recommendations.push('Talabaga shaxsiy xabar yuboring yoki uni darsda savolga javob berishga undang.');
    }
    if ((expressionCounts['neutral'] || 0) / total > 0.5) {
      recommendations.push('Vizual materiallar (video, grafik, animatsiya) ko\'proq foydalaning.');
      recommendations.push('Talabalarni darsga faol jalb etish uchun real hayotiy misollar keltiring.');
    }
    if (engagementScore > 70 && yawnPercentage < 5) {
      recommendations.push('Dars uslubingiz samarali — davom ettiring!');
      recommendations.push('Eng faol lahzalarni qayd qilib, keyingi darslarda ham qo\'llang.');
    }

    return {
      sessionDuration: `${durationMin} daqiqa ${durationSec} soniya`,
      totalFrames: total,
      expressionDistribution,
      dominantOverall,
      engagementScore,
      avgFocus,
      yawnPercentage,
      sleepPercentage,
      chartData,
      insights,
      recommendations,
      generatedAt: new Date().toLocaleString('uz-UZ')
    };
  }, [history, sessionStart]);

  // Reset the analysis session
  const resetSession = useCallback(() => {
    setHistory([]);
    setAnalysisCount(0);
    setCurrentExpression(null);
    setSessionStart(Date.now());
    setAttentionScore(0);
    setFocusScore(0);
    setMoodLabel('—');
    noFaceCountRef.current = 0;
    lowEarCountRef.current = 0;
  }, []);

  return {
    modelsLoaded,
    modelLoadProgress,
    currentExpression,
    faceDetected,
    analysisCount,
    history,
    generateReport,
    resetSession,
    // Geometric metrics
    eyeOpenness,
    mouthOpenness,
    headTilt,
    isYawning,
    isEyesClosed,
    // Derived REAL scores
    attentionScore,
    focusScore,
    moodLabel,
    EXPRESSION_LABELS,
    EXPRESSION_EMOJI
  };
}
