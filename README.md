<div align="center">
  <h1>⚔️ BrutalBench</h1>
  <p>A unified Next.js backend and automation pipeline for autonomous AI code evaluation.</p>
</div>

---

## 📖 Overview

**BrutalBench** is an evaluation framework built to rigorously test and score LLMs against real-world engineering tasks. By combining a monolithic **Next.js** backend with **Supabase**, it effectively bridges external workflow automation with a permanent evaluation leaderboard.

## 🏗️ System Architecture

Rather than relying on disjointed scripts, BrutalBench centralizes its logic:

- **Frontend & Backend (Monolith):** Next.js App Router providing both the UI dashboard and the internal evaluation API endpoints.
- **Database (Supabase):** Manages the leaderboard schema and safely stores historical evaluation metrics using structured migrations.
- **External Workflow Automation (n8n):** Uses webhook integrations (`n8n_leaderboard_upsert.sql`) to continuously ingest and normalize test results from autonomous LLM test runs directly into the database.

## 🗄️ Database Migrations

The repository utilizes robust Supabase migrations to maintain a reliable schema:
- `001_brutalbench_schema.sql`: Initializes the core leaderboard structure.
- `n8n_leaderboard_upsert.sql`: Stored procedure enabling external workflow agents (like n8n) to safely upsert metrics without complex API authentication.

## 🚀 Getting Started

1. **Environment Setup:** Create a `.env` file containing your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
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

All internal testing utilities and model validation scripts are located strictly in the `__tests__` directory to preserve production build hygiene.

```bash
node frontend/__tests__/test-models.js
```
