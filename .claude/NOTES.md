# Project Notes - GA Insights Platform

## Project Overview
AI-powered analytics assistant for small businesses to extract actionable insights from Google Analytics 4 data. Combines GA4 API integration with LLM-powered analysis to provide concrete recommendations.

## Current State (as of 2025-10-06)

### Phase Completion Status
- **Phase 1 (Foundation & Authentication)**: ✅ COMPLETE
  - All tasks 1.1 through 1.7 completed
  - User authentication (email/password + JWT)
  - Google OAuth 2.0 integration
  - Frontend auth UI with React Hook Form + Zod validation
  - Comprehensive test suite established

- **Phase 2 (GA Properties & Dashboard)**: ❌ NOT STARTED
  - Next task: 2.1 - GA Properties Model & Service

### Tech Stack Confirmed
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (schema defined, migrations ready)
- **Cache**: Redis (configured but Docker not running)
- **Auth**: JWT for sessions, OAuth 2.0 for GA access
- **LLM**: TBD (Ollama local dev / OpenAI production)
- **Testing**: Jest + Supertest

### Key Architecture Decisions

#### Authentication Flow
1. Standard email/password with bcrypt hashing (10 rounds)
2. JWT tokens: 15min access token, 7 day refresh token
3. Google OAuth separate from user auth - only for GA access
4. OAuth tokens encrypted at rest (AES-256-GCM)
5. CSRF protection via state parameter in OAuth flow

#### Database Schema
- 6 main tables: users, ga_properties, insights, conversations, analytics_cache, api_usage
- All relationships defined with proper foreign keys
- Indexes on frequently queried fields
- JSON/JSONB columns for flexible data (action_items, messages, cached data)

#### Caching Strategy (from SPEC.md)
- **3-layer cache**: Redis (hot) → PostgreSQL (warm) → GA4 API (cold)
- **TTL strategy**:
  - Completed date ranges: 24h-7d (data won't change)
  - Current day: 1h (frequent updates)
  - Dashboard metrics: 30min
- **Cache key format**: `{resourceType}:{propertyId}:{specifics}:{dateRange}`

#### Rate Limiting Strategy
- **GA4 API**: 500 requests/day per property (free tier)
- **LLM**: 10 reports/day free tier, 50 chat messages/day
- **General API**: 100 requests/hour authenticated
- Track usage in Redis + api_usage table

### Current Implementation Details

#### Backend Structure
```
backend/src/
├── config/         # DB, Redis, OAuth configs
├── controllers/    # auth.controller, oauth.controller
├── middleware/     # auth, errorHandler, rateLimiter
├── models/         # user.model (CRUD operations)
├── routes/         # auth.routes, oauth.routes
├── services/       # auth.service, oauth.service
├── types/          # express.d.ts (extended Request interface)
├── utils/          # encryption, jwt, validators, errors, logger
└── tests/          # Comprehensive unit + integration tests
```

#### Frontend Structure
```
frontend/src/
├── components/auth/  # LoginForm, RegisterForm, GoogleOAuthButton
├── contexts/         # AuthContext (React Context + useAuth hook)
├── hooks/            # useAuth (React Query for auth state)
├── pages/            # Login, Register, Dashboard (placeholder)
├── services/         # api (axios), authService
└── utils/            # (minimal so far)
```

#### Key Files to Remember

**Backend Core:**
- `server.ts` - Express app, middleware, route mounting, graceful shutdown
- `config/database.ts` - PostgreSQL connection pool
- `config/redis.ts` - Redis client configuration
- `config/oauth.ts` - Google OAuth client setup
- `utils/encryption.ts` - AES-256-GCM for token encryption
- `utils/jwt.ts` - Token generation/verification
- `middleware/auth.middleware.ts` - JWT validation + user attachment

**Frontend Core:**
- `App.tsx` - Router setup, AuthContext provider
- `contexts/AuthContext.tsx` - Global auth state management
- `services/api.ts` - Axios instance with auth interceptors
- `hooks/useAuth.ts` - React Query integration for auth

**Database:**
- `backend/migrations/` - All schema migrations (6 tables)
- Schema follows SPEC.md exactly

### Testing Strategy Implemented
- **Unit tests**: Utils (encryption, JWT, validators), middleware
- **Integration tests**: Auth endpoints, database operations
- **Mocks**: Database and Redis clients for isolated testing
- **Coverage target**: >80% for business logic
- All tests passing before moving to next phase

### Important Constraints & Patterns

#### Security Best Practices (from CLAUDE.md + SPEC.md)
- Never log passwords, tokens, or API keys
- All inputs validated and sanitized
- Parameterized queries only (SQL injection prevention)
- CORS whitelist (not wildcard in production)
- Rate limiting on all public endpoints
- OAuth state validation (CSRF prevention)
- Password requirements: min 8 chars, 1 upper, 1 lower, 1 number

#### Code Style (from CLAUDE.md)
- Test Driven Development (TDD) for all new features
- Smallest reasonable changes to achieve outcome
- Reduce code duplication aggressively
- Match existing code style within files
- Names tell WHAT code does, not HOW or history
- No temporal references (new/old/legacy/improved)
- All files start with 2-line ABOUTME comment
- Systematic debugging over quick fixes

### Next Steps (Phase 2)

**Task 2.1: GA Properties Model & Service**
- Create property model with CRUD operations
- Implement basic ga4.service to fetch properties list
- Use @google-analytics/data package
- Handle OAuth token refresh automatically
- Estimated: 2 hours

**Critical Dependencies:**
1. Must have valid Google Cloud project with Analytics API enabled
2. OAuth credentials configured (client ID + secret)
3. Test account with GA4 properties to connect

**Known Risks:**
- Ollama local LLM may be too slow for production use (fallback to OpenAI planned)
- GA4 API rate limits (500/day) could be restrictive for power users
- Token refresh logic needs to be bulletproof (expired tokens will break everything)

### Insights Generation Strategy (Phase 3)

**5 Preset Report Types:**
1. **Traffic Health Check** - Identifies significant changes, explains causes, provides actions
2. **Conversion Funnel Analysis** - Maps user journey, identifies drop-offs, estimates ROI
3. **Content Performance Review** - Top/underperforming content with improvement suggestions
4. **Traffic Source Optimization** - ROI per channel, budget reallocation recommendations
5. **User Behavior Insights** - Device/geo/time patterns with actionable findings

**Key Requirement**: Every insight must include 2-5 specific, actionable recommendations with estimated impact.

**LLM Context Strategy**:
- Intelligent data fetching via function calling (mid-tier approach)
- LLM requests specific GA4 data it needs
- Avoids overwhelming context window
- More accurate than full data dump upfront

### Function Calling for Chat (Phase 4)

**Available Functions for LLM:**
- getTrafficMetrics(propertyId, dateRange)
- getTopPages(propertyId, dateRange, limit)
- getTrafficSources(propertyId, dateRange)
- getConversionFunnel(propertyId, funnelSteps)
- getUserBehavior(propertyId, dateRange)
- getHistoricalTrend(propertyId, metric, days)
- compareProperties(propertyIds, metric, dateRange)

**Note**: Llama 3.2 may have limited function calling support. OpenAI GPT-4o-mini recommended for chat interface due to superior function calling capabilities.

### Environment Variables Reference

**Required for Current Phase:**
- DATABASE_URL, REDIS_URL
- JWT_SECRET, REFRESH_TOKEN_SECRET
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
- ENCRYPTION_KEY (32-byte hex for AES-256)
- FRONTEND_URL (for CORS)

**Required for Phase 3+:**
- LLM_PROVIDER, OLLAMA_HOST, OLLAMA_MODEL
- OPENAI_API_KEY, OPENAI_MODEL (fallback/production)
- SMTP credentials (for Phase 5 daily digest)

### Daily Digest Feature (Phase 5)

**Approach:**
- Node-cron job runs daily at 8 AM user timezone
- Picks most relevant insight based on unusual changes (traffic spikes/drops)
- MJML email template (responsive)
- SendGrid free tier (100 emails/day) for MVP
- Unsubscribe link required

### Critical Success Metrics

**MVP Launch Blockers:**
- Users can connect at least one GA4 property ✓ (OAuth ready)
- Dashboard displays accurate GA metrics (Phase 2)
- All 5 preset reports generate useful insights (Phase 3)
- Chat interface answers basic questions (Phase 4)
- Error handling prevents crashes (Partial - ongoing)
- App deployed and accessible (Phase 6)

**Target Quality:**
- 4+ star average rating on insights
- <2s average insight generation time
- >70% of reports rated 4-5 stars
- 95% uptime

### Development Notes

#### Git Workflow
- Currently on master branch (clean working directory)
- All non-trivial changes must be committed
- Never skip pre-commit hooks
- Create WIP branch when starting new task
- Commit frequently throughout development

#### Testing Workflow (TDD)
1. Write failing test that validates desired functionality
2. Run test to confirm it fails as expected
3. Write ONLY enough code to make test pass
4. Run test to confirm success
5. Refactor while keeping tests green

#### Docker Status
- docker-compose.yml configured for PostgreSQL + Redis
- **Docker not currently running** - will need to start for local development
- Migrations created but not yet executed

### Questions for Will

1. **Google Cloud Setup**: Do you have a Google Cloud project with Analytics API enabled? Need OAuth credentials configured.

2. **GA4 Test Data**: Do you have a GA4 property we can use for testing, or should we set up a demo property?

3. **LLM Provider Preference**: For production, prefer OpenAI (easier, better function calling) or invest time in optimizing local Llama?

4. **Deployment Timeline**: Any specific deadline for beta launch? SPEC suggests 12 weeks total.

5. **Email Provider**: Confirm SendGrid for daily digest emails, or prefer different provider (Mailgun, SES)?

### Things to Watch Out For

1. **OAuth Token Lifecycle**: Refresh tokens must be handled properly. If refresh token expires, user must re-authenticate. Need to handle this gracefully in UI.

2. **GA4 Rate Limits**: 500 requests/day per property is easy to hit with multiple users. Aggressive caching is critical. May need to upgrade to paid tier.

3. **LLM Prompt Engineering**: Quality of insights directly depends on prompt quality. Will need extensive iteration based on user feedback.

4. **Cost Management**: LLM tokens can add up quickly. Need to track usage carefully and implement hard limits for free tier.

5. **Error Recovery**: GA4 API can be flaky. Need retry logic with exponential backoff. Same for LLM API.

6. **CORS Issues**: Frontend/backend on different ports in dev. Need proper CORS config for OAuth callbacks.

### Useful Commands

```bash
# Backend
cd backend
npm run dev              # Start dev server
npm run build            # TypeScript build
npm run test             # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run migrate:up       # Run migrations
npm run migrate:down     # Rollback migrations

# Frontend
cd frontend
npm run dev              # Start Vite dev server
npm run build            # Production build
npm run preview          # Preview production build

# Docker
docker-compose up -d     # Start PostgreSQL + Redis
docker-compose down      # Stop services
docker-compose logs -f   # View logs

# Database
psql -U postgres -d ga_insights  # Connect to DB
```

### Key Takeaways for Next Session

1. **Phase 1 is solid** - Auth foundation is complete with good test coverage
2. **Ready for Phase 2** - GA4 integration is the next major milestone
3. **Will need Google credentials** - Can't proceed with GA integration without OAuth setup
4. **TDD discipline established** - Continue this pattern for all new features
5. **Caching will be critical** - GA4 rate limits are tight, must cache aggressively
6. **LLM choice deferred** - Can decide between Ollama/OpenAI during Phase 3 implementation

### Project Strengths

- **Comprehensive spec** - SPEC.md is very detailed and well thought out
- **Clear roadmap** - PROMPT_PLAN.md provides step-by-step implementation guide
- **Security first** - Good practices baked in from the start
- **Test coverage** - TDD approach ensures reliability
- **Scalable architecture** - Service-oriented design allows for growth

### Potential Challenges

- **LLM quality variance** - Local models may not be consistent enough for production
- **GA4 API complexity** - Lots of dimensions/metrics, need to learn the API well
- **Prompt engineering** - Getting actionable insights requires skilled prompting
- **User expectations** - "AI-powered" creates high expectations for insight quality
- **Cost scaling** - LLM tokens + hosting could get expensive with growth

---

**Last Updated**: 2025-10-06
**Next Review**: When starting Task 2.1
