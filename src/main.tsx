import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SpeedInsights } from "@vercel/speed-insights/react";

createRoot(document.getElementById('root')!).render(
  // Temporarily removed StrictMode to debug
  <>
    <App />
    <SpeedInsights />
  </>
)
