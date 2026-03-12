# 📅 BookEasy AI

Premium appointment booking system with modern 2026 UI.

## Features
- 🎨 Premium glassmorphism UI with multiple themes
- 📅 Smart appointment scheduling
- 👔 Admin dashboard
- 📊 Analytics
- 📱 PWA-enabled (installable as native app)
- ⚡ Real-time availability
- 🎯 Multiple business types supported

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** FastAPI + Python
- **Database:** MongoDB
- **Deployment:** Railway, Render, Vercel

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload
```

### Frontend  
```bash
cd frontend
yarn install
yarn dev
```

## Environment Variables

**Backend (.env):**
```
MONGO_URL=your_mongodb_connection_string
DB_NAME=bookeasy_db
CORS_ORIGINS=*
```

**Frontend (.env):**
```
VITE_API_URL=/api
```

## Deploy to Railway

1. Push to GitHub
2. Connect Railway to your repo
3. Set root directory: `backend` or `frontend`
4. Add environment variables
5. Deploy!

## Market Value
**$3,500 - $5,000** as a sellable SaaS product

## License
MIT - 100% yours to use, modify, and sell!
