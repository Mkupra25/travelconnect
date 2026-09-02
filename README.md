TravelConnect - Prototype

Stack:
- Frontend: React + TypeScript + Vite + Leaflet (Mapbox tiles)
- Backend: FastAPI + SQLAlchemy (Postgres in production, SQLite for dev)

Quick start (backend):

1. Create a virtualenv and install dependencies

```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r backend/requirements.txt
```

2. Create `backend/.env` and set `DATABASE_URL`. To enable the Compass AI chat, add `GEMINI_API_KEY=your_key_from_google_ai_studio`. The key stays on the backend and is never exposed to the browser.

3. Create DB tables (python interactive):

```python
from backend.app import models
from backend.app.database import engine
models.Base.metadata.create_all(bind=engine)
```

Or run the seed script to create tables and sample data:

```bash
python -m backend.app.seed_data
```

4. Run the API

```bash
uvicorn backend.app.main:app --reload --port 8001
```

Quick start (frontend):

```bash
cd frontend
npm install
VITE_MAPBOX_TOKEN=your_token npm run dev
```

## Gemini AI chat

Create a free-tier Gemini API key in [Google AI Studio](https://aistudio.google.com/app/apikey), then add it to `backend/.env`:

```env
GEMINI_API_KEY=your_key_here
```

Restart the FastAPI server. The UI sends chat messages to `/api/ai/chat`; that endpoint securely calls Gemini on the server. Without a key, the interface remains usable and tells you how to connect it.

Notes:
- Replace Mapbox token in environment. You can also switch to Google Maps tile provider.
- Current prototype includes endpoints to list/create `destinations` and `businesses`.
- Next steps: auth, recommendations, bot-checker, messaging, admin panel.

## Connecting to GitHub

To connect and push this project to GitHub, follow one of the options below.

Option A — Manual using git and GitHub website

```bash
git init
git add .
git commit -m "Initial scaffold: TravelConnect prototype"
# Create a repository on GitHub (via web UI), then:
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

Option B — Using GitHub CLI (`gh`)

```bash
gh repo create <your-username>/travelconnect --public --source=. --remote=origin --push
```

The repository includes a basic CI workflow at `.github/workflows/ci.yml` that installs backend dependencies and builds the frontend. Add repository secrets (for example `VITE_MAPBOX_TOKEN`, `DATABASE_URL`, `SECRET_KEY`) in the GitHub repo settings under Secrets → Actions.

