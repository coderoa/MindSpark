# ClassVibe AI

ClassVibe AI is a browser-based classroom analytics and engagement prototype built with React and Vite. It simulates teacher and student dashboards, webcam-based engagement tracking, and a post-lesson quiz flow.

for EdTechHackathon

## APIs and libraries used

### Browser APIs

- `navigator.mediaDevices.getUserMedia()`
  - requests camera permission and returns a `MediaStream`
- `MediaStream.getTracks()`
  - stops the camera when the app unmounts
- `<video>` element API
  - binds webcam video using `video.srcObject = webcamStream`

### AI / face analysis

- `face-api.js`
  - browser-based face detection, expression recognition, and landmark tracking
  - loads models at runtime from `https://justadudewhohacks.github.io/face-api.js/models`
  - internally uses TensorFlow.js for in-browser model inference
- Custom engagement heuristics in `src/hooks/useFaceAnalysis.js`
  - eye openness, blink detection, yawning state, and head tilt
  - attention and focus scoring based on face geometry and expressions
- Optional Gemini quiz context in `src/api/gemini.js`
  - configured with the provided Gemini API key for focus-based quiz generation

### React / UI libraries

- `react` / `react-dom`
- `vite`
- `lucide-react` for icons
- `recharts` for chart visualizations
- `tailwindcss` for styling utilities

## Project structure

- `src/App.jsx` — main application shell, role and tab switching, camera initialization
- `src/components/StudentDashboard.jsx` — student view and post-lesson quiz UI
- `src/components/TeacherDashboard.jsx` — teacher monitoring dashboard
- `src/components/AIReport.jsx` — AI report page with live face analysis metrics
- `src/components/CameraSimulator.jsx` — webcam preview and engagement simulator
- `src/hooks/useFaceAnalysis.js` — face detection and engagement inference logic

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the local URL shown in the terminal.

## Notes

- The app runs completely in the browser and has no backend server dependency.
- Camera permission is required for webcam-based analysis.
- Face models are downloaded at runtime, so the first load may take a few seconds.
- The app is designed to analyze video locally in the browser and not send raw camera data to external servers.
