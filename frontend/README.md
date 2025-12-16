# Frontend - Wave Studio Admin Dashboard

## Setup

```bash
cd frontend
npm install
npm run dev
```

## Stack

- **React 18** (with Hooks)
- **Vite** (fast dev server)
- **TailwindCSS** (utility-first CSS)
- **Axios** (HTTP client)
- **React Router** (routing)
- **React Calendar** (scheduling)
- **Recharts** (charts for reports)

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   ├── pages/            # Full page components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API service layer
│   ├── context/          # Context API (auth, theme)
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── public/               # Static assets
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## Pages

1. **Login** (`/`) - Authentication
2. **Dashboard** (`/dashboard`) - Overview
3. **Clients** (`/clients`) - Client management
4. **Trainers** (`/trainers`) - Trainer management
5. **Subscriptions** (`/subscriptions`) - Subscription management
6. **Schedule** (`/schedule`) - Session scheduler (calendar)
7. **Reports** (`/reports`) - Report generation & export

## API Integration

All API calls go through `services/api.js` using Axios with JWT auth.

## Development Status

- [ ] Project initialization
- [ ] Layout & Navigation
- [ ] Authentication
- [ ] Clients page
- [ ] Trainers page
- [ ] Subscriptions page
- [ ] Schedule page
- [ ] Reports page
- [ ] Testing
- [ ] Deployment

## Notes

- API base URL: `http://localhost:5000/api`
- JWT token stored in localStorage
- Auto-logout on token expiry (7 days)
