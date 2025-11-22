# MzeeChakula — Model-Testing

This repository contains the frontend and backend for the MzeeChakula nutrition recommendation and meal-planning prototype. The project provides:

- An interactive, voice-enabled chat assistant for collecting user demographics and dietary preferences.
- A prediction API that estimates daily caloric needs and recommends local foods based on nutritional similarity and learned models.
- A small frontend app built with Vue + Vite + Pinia that consumes the backend API.

## Live demos

- Frontend (static UI): <https://mzeechakula.vercel.app/>
- Backend API: <https://mzeechakula-backend.onrender.com/>
- **Project Documentation**: [Documentation/README.md](../Documentation/README.md) (Run locally for full site)

## Quick links

- Frontend folder: `frontend/`
- Backend folder: `backend/`

## Getting started (developer)

1. Clone the repository:

```bash
git clone https://github.com/MzeeChakula/Model-Testing.git
cd Model-Testing
```

2.Backend (Python / FastAPI)

- Requirements: Python 3.12+ and a virtual environment.

```bash
# from repo root
cd backend
python3 -m venv ../.venv
source ../.venv/bin/activate
pip install -r requirements.txt
# Run the API server (development)
uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
```

Notes:

- The backend serves endpoints under `/predict`, `/foods`, and `/health`.
- Model files and optional embeddings are expected under `backend/models/`. If no trained models are present the backend falls back to a heuristic predictor so the API remains usable.

3.Frontend (Vue / Vite)

- Requirements: Node.js + npm (or yarn).

```bash
# from repo root
cd frontend
npm install
# Run dev server
npm run dev
# Build for production
npm run build
```

- The frontend expects an API base URL in `VITE_API_URL` (defaults to `http://localhost:8000`). When running locally, start the backend first.

Recommendations & troubleshooting

- If the recommender system (embedding-based) is not available, the frontend falls back to scoring local foods by basic nutritional similarity; ensure `frontend/src/store/predictionStore.js` has been loaded and that `getLocalFoods` works (endpoint: `/foods/local`).
- To include the built frontend in this repo for hosts like Vercel that can serve static output, the `dist/` folder can be committed — the project `.gitignore` has been updated to allow committing `dist`.

Deploying

- Frontend: Vercel (recommended). Point the Vercel project to the `frontend` directory or push the built `dist` folder to the repo and configure Vercel to serve it.
- Backend: Render / Heroku / any container or VM. Ensure environment variables and model files are available on the host.

Useful git commands (commit dist to repo)

```bash
# Force add a previously ignored folder (only if needed)
git add -f frontend/dist
git commit -m "Include built frontend dist for deployment"
git push origin main
```

Contributing

- Open issues and PRs are welcome. Keep changes focused and add tests where appropriate.

License

- This repository is released under the terms in the `LICENSE` file.

Contact

- For questions, open an issue or contact the repository owner.
