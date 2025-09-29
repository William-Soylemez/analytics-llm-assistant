# GA Insights Platform

An AI-powered analytics assistant for small businesses to extract actionable insights from Google Analytics 4 data.

## Project Structure

```
analytics/
├── frontend/          # React + TypeScript + Vite + Tailwind
├── backend/           # Node.js + Express + TypeScript
├── shared/            # Shared TypeScript types
├── docker-compose.yml # PostgreSQL + Redis services
└── README.md
```

## Prerequisites

- Node.js v22.2.0 or higher
- Docker and Docker Compose
- npm or yarn

## Getting Started

### 1. Clone the repository and install dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Set up environment variables

```bash
# Frontend
cd frontend
cp .env.example .env
# Edit .env and add your configuration

# Backend
cd ../backend
cp .env.example .env
# Edit .env and add your configuration
```

### 3. Start PostgreSQL and Redis

```bash
# From the root directory
docker-compose up -d
```

### 4. Start the development servers

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

## Development

### Frontend (http://localhost:5173)
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- React Query for data fetching
- Axios for API calls

### Backend (http://localhost:3001)
- Express.js with TypeScript
- PostgreSQL for data storage
- Redis for caching
- JWT authentication
- Google OAuth 2.0

### Database Services
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled JavaScript

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, React Router, React Query
- **Backend**: Node.js, Express, TypeScript, PostgreSQL, Redis
- **Auth**: JWT, Google OAuth 2.0
- **LLM**: Ollama (development), OpenAI/Anthropic (production)
- **Deployment**: Docker, AWS/Vercel/Railway

## Next Steps

1. Set up database migrations (Task 1.2)
2. Implement authentication (Tasks 1.3-1.6)
3. Build dashboard and analytics integration (Phase 2)
4. Add LLM-powered insights (Phase 3)
5. Implement chat interface (Phase 4)

## Documentation

See `.claude/SPEC.md` for the complete project specification and `.claude/PROMPT_PLAN.md` for the implementation roadmap.

## License

ISC