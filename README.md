<div align="center">
  <h1 align="center">⬛ BRUTALBENCH ⬛</h1>
  <p align="center"><strong>A Ruthless AI-Powered Code Evaluation Pipeline</strong></p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  </p>
</div>

---

## ⚡ WHAT IS IT?

**BRUTALBENCH** is an automated, zero-mercy developer evaluation platform. It hooks into a user's GitHub, pulls down their latest commits across their top repositories, sanitizes the ASTs, and feeds them directly into Google's **Gemini 2.5 Flash** model for a brutal architectural critique and score.

Built with a **Neo-Brutalist** aesthetic, it features real-time terminal streaming, stark high-contrast UI components, and fluid animations.

## 🔥 KEY FEATURES

- **🤖 Ruthless AI Critique:** Powered by `gemini-2.5-flash` for high-speed, hyper-critical code analysis.
- **📡 Real-Time SSE Terminal:** The evaluation pipeline streams execution logs (fetching, scraping, analyzing) directly to the UI via Server-Sent Events.
- **🗄️ Historical Evaluations:** All scores are permanently logged to Supabase. Track your past evaluations in a dedicated history feed.
- **🎨 Neo-Brutalist UI:** A visually striking interface featuring stark borders, monochrome styling, and fluid `framer-motion` entrance animations.
- **🔒 Secure Architecture:** NextAuth GitHub interception and Row Level Security (RLS) on Supabase ensuring clients can never spoof their scores.

## 🏗️ DIRECTORY STRUCTURE

### `/frontend`
The core application handling both the client-side UI and the server-side AI evaluation logic via a Monolithic Next.js Architecture.
- **Tech Stack:** Next.js App Router, Tailwind CSS (v4), TypeScript, Zustand, NextAuth, Google Gemini SDK, Framer Motion.
- **Key Routes:**
  - `app/api/evaluate/route.ts`: Core AI execution engine with SSE streaming.
  - `app/api/history/route.ts`: Secure fetching of past evaluations.

### `/supabase`
The database infrastructure configuration.
- **Tech Stack:** PostgreSQL (Supabase).
- **Key Features:** `squad_d_schema.sql` contains the exact tables and strict RLS policies.

## 🚀 GETTING STARTED

1. Set up your environment variables inside `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   GOOGLE_API_KEY=your_gemini_api_key
   ```
2. Apply the SQL schema in `/supabase/sql/squad_d_schema.sql` to your Supabase instance.
3. Open a terminal and navigate to the frontend folder: 
   ```bash
   cd frontend
   ```
4. Install dependencies and run the development server:
   ```bash
   npm install
   npm run dev
   ```
5. Open `http://localhost:3000` in your browser and click **Authenticate via GitHub**.

---
<div align="center">
  <i>"Code doesn't lie. Neither does BrutalBench."</i>
</div>
