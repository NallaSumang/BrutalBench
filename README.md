<div align="center">
  <h1>⚔️ BrutalBench</h1>
  <p>An AI-powered code evaluation framework with a leaderboard dashboard.</p>
</div>

---

## 📖 Overview

**BrutalBench** is an evaluation framework built to rigorously test and score LLMs against real-world engineering tasks. It combines a monolithic **Next.js** application with **Supabase** for persistent storage, **Google Gemini** for AI-driven code evaluation, and **n8n** webhook integrations for external workflow automation.

## 🏗️ System Architecture

- **Frontend & Backend (Monolith):** Next.js 16 App Router (`frontend/`) providing both the UI dashboard and the internal evaluation API endpoints (`api/evaluate/`, `api/history/`).
- **Authentication:** NextAuth with GitHub OAuth — users authenticate via their GitHub accounts.
- **AI Engine:** Google Generative AI (`@google/generative-ai`) powers the code evaluation and scoring pipeline. Token counting is handled via `js-tiktoken`.
- **Database (Supabase):** PostgreSQL via Supabase manages the leaderboard schema and stores historical evaluation metrics using structured migrations.
- **External Workflow Automation (n8n):** Uses webhook integrations (`n8n_leaderboard_upsert.sql`) to continuously ingest and normalize test results from autonomous LLM test runs directly into the database.

## 🗄️ Database Migrations

The repository utilizes Supabase migrations to maintain a reliable schema:
- `001_brutalbench_schema.sql` — Initializes the core leaderboard structure.
- `n8n_leaderboard_upsert.sql` — Stored procedure enabling external workflow agents (like n8n) to safely upsert metrics without complex API authentication.
- `squad_d_schema.sql` — Additional evaluation schema.

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16, React 19, TypeScript |
| **AI** | Google Gemini (`@google/generative-ai`), js-tiktoken |
| **Auth** | NextAuth (GitHub OAuth) |
| **Database** | Supabase (PostgreSQL) |
| **Automation** | n8n (webhook-based workflow ingestion) |
| **UI** | Tailwind CSS v4, Framer Motion, Zustand |

## 🚀 Getting Started

1. **Environment Setup:** Create a `.env.local` file in `frontend/` containing:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   GITHUB_ID=<your-github-oauth-id>
   GITHUB_SECRET=<your-github-oauth-secret>
   NEXTAUTH_SECRET=<random-secret>
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_API_KEY=<your-google-api-key>
   ```
2. **Install Dependencies:**
   ```bash
   cd frontend
   npm install
   ```
3. **Run the Dashboard:**
   ```bash
   npm run dev
   ```

## 🧪 Testing

```bash
node frontend/__tests__/test-models.js
node frontend/__tests__/test-gemini.js
node frontend/__tests__/test-supabase.js
```

## 📜 License
Distributed under the MIT License.
