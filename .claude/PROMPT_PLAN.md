# GA Insights Platform - Implementation Plan

## Overview
This document contains a step-by-step implementation plan for the GA Insights Platform. Each task includes:
- Clear status tracking (❌ Not Started, 🔄 In Progress, ✅ Complete)
- Exact prompts to use with Claude Code
- Acceptance criteria for validation
- Dependencies and prerequisites

## Current Status
**Last Updated**: 2025-09-29
**Current Phase**: Phase 1 - Foundation
**Next Task**: 1.4

---

## Phase 1: Foundation & Authentication (Week 1-2)

### Task 1.1: Project Initialization ✅
**Status**: Complete  
**Estimated Time**: 2-3 hours  
**Dependencies**: None

**Prompt**:
```
Initialize the GA Insights Platform project with the following structure:

1. Create monorepo structure:
   - /frontend (React + TypeScript + Vite + Tailwind)
   - /backend (Node.js + Express + TypeScript)
   - /shared (shared TypeScript types)

2. Frontend setup:
   - Initialize Vite project with React and TypeScript
   - Install and configure Tailwind CSS
   - Install React Router v6
   - Install Axios for API calls
   - Install React Query (@tanstack/react-query)
   - Set up ESLint and Prettier
   - Create basic folder structure from SPEC.md

3. Backend setup:
   - Initialize Node.js project with TypeScript
   - Install Express and required middleware
   - Install PostgreSQL client (pg)
   - Install Redis client (ioredis)
   - Set up ESLint and Prettier
   - Create basic folder structure from SPEC.md

4. Root level:
   - Create docker-compose.yml for PostgreSQL and Redis
   - Create .gitignore files
   - Create README.md with setup instructions
   - Create .env.example files for frontend and backend

Use the exact tech stack and structure specified in SPEC.md.
```

**Acceptance Criteria**:
- [x] Folder structure matches SPEC.md
- [x] `npm install` works in both frontend and backend
- [x] `docker-compose up` starts PostgreSQL and Redis (config created, Docker not running)
- [x] TypeScript compiles without errors
- [x] ESLint and Prettier configured and working
- [x] Both apps can start in development mode

**Verification Commands**:
```bash
cd frontend && npm run dev
cd backend && npm run dev
docker-compose up -d
```

---

### Task 1.2: Database Setup & Migrations ✅
**Status**: Complete  
**Estimated Time**: 2 hours  
**Dependencies**: Task 1.1

**Prompt**:
```
Set up PostgreSQL database with the schema from SPEC.md:

1. Install migration tool (node-pg-migrate or Knex.js)

2. Create migration files for all tables in this order:
   - users table (with encrypted token fields)
   - ga_properties table
   - insights table
   - conversations table
   - analytics_cache table
   - api_usage table

3. Add all indexes specified in SPEC.md

4. Create database configuration file in backend/src/config/database.ts:
   - Read DATABASE_URL from environment
   - Export configured PostgreSQL client
   - Include connection pooling

5. Create seed file for development data:
   - 1 test user with hashed password
   - No real data (we'll add via OAuth later)

6. Update package.json with migration commands:
   - npm run migrate:up
   - npm run migrate:down
   - npm run seed

Reference the exact schema from SPEC.md, including all column types, constraints, and relationships.
```

**Acceptance Criteria**:
- [x] All migrations run successfully (migrations created, Docker not running)
- [x] Database schema matches SPEC.md exactly
- [x] Seed data creates test user
- [x] Can connect to database from backend
- [x] Rollback migrations work correctly
- [x] All foreign keys and indexes created
- [x] Jest testing framework set up with basic tests

**Verification Commands**:
```bash
npm run migrate:up
npm run seed
psql -U postgres -d ga_insights -c "\dt"
```

---

### Task 1.3: Backend Core Setup ✅
**Status**: Complete  
**Estimated Time**: 2 hours  
**Dependencies**: Task 1.2

**Prompt**:
```
Set up the core backend infrastructure:

1. Create backend/src/server.ts:
   - Express app setup
   - Middleware configuration (cors, helmet, express.json)
   - Basic error handling middleware
   - Health check endpoint (GET /health)
   - 404 handler

2. Create backend/src/middleware/errorHandler.middleware.ts:
   - Global error handler
   - Custom error classes (AuthError, ValidationError, NotFoundError)
   - Error logging (console for now)
   - User-friendly error responses

3. Create backend/src/utils/logger.ts:
   - Simple Winston logger
   - Log levels: error, warn, info, debug
   - Pretty print in development
   - JSON format for production

4. Create backend/src/config/ files:
   - database.ts (PostgreSQL connection)
   - redis.ts (Redis connection)
   - index.ts (export all configs)

5. Update backend/src/server.ts to:
   - Use logger instead of console
   - Connect to database and Redis on startup
   - Handle graceful shutdown

6. Set up environment variables in .env:
   - Copy from SPEC.md environment variables section
   - Use development values for now

Follow the backend architecture from SPEC.md.
```

**Acceptance Criteria**:
- [x] Server starts without errors
- [x] Health check endpoint responds with 200
- [x] Error handler catches and formats errors
- [x] Logger writes to console in development
- [x] Can connect to PostgreSQL and Redis (verified in health check)
- [x] Graceful shutdown works (Ctrl+C)
- [x] CORS configured for frontend URL
- [x] Custom error classes created and tested

**Verification Commands**:
```bash
npm run dev
curl http://localhost:3001/health
curl http://localhost:3001/nonexistent (should return 404)
```

---

### Task 1.4: Authentication Models & Utils ❌
**Status**: Not Started  
**Estimated Time**: 2 hours  
**Dependencies**: Task 1.3

**Prompt**:
```
Create authentication utilities and user model:

1. Create backend/src/models/user.model.ts:
   - User interface matching database schema
   - CRUD operations (create, findById, findByEmail, update, delete)
   - Use parameterized queries to prevent SQL injection
   - Hash passwords with bcrypt before storing
   - Never return password_hash in queries

2. Create backend/src/utils/encryption.ts:
   - encryptToken(token: string): string
   - decryptToken(encrypted: string): string
   - Use AES-256-GCM encryption
   - Get encryption key from environment variable

3. Create backend/src/utils/jwt.ts:
   - generateAccessToken(userId: string): string
   - generateRefreshToken(userId: string): string
   - verifyAccessToken(token: string): { userId: string }
   - verifyRefreshToken(token: string): { userId: string }
   - Use secrets from environment variables
   - Set appropriate expiration times (15min access, 7 days refresh)

4. Create backend/src/utils/validators.ts:
   - validateEmail(email: string): boolean
   - validatePassword(password: string): { valid: boolean, errors: string[] }
   - Password requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number

5. Create backend/src/types/express.d.ts:
   - Extend Express Request interface to include user property
   - Add User type to request

Reference SPEC.md security requirements and follow best practices.
```

**Acceptance Criteria**:
- [ ] User model can create and retrieve users
- [ ] Passwords are hashed with bcrypt
- [ ] Encryption/decryption works correctly
- [ ] JWT tokens can be generated and verified
- [ ] Validators reject invalid inputs
- [ ] TypeScript types are correct
- [ ] No passwords logged or exposed

**Verification Commands**:
```bash
# Write and run tests for these utilities
npm run test:unit
```

---

### Task 1.5: Email/Password Authentication ❌
**Status**: Not Started  
**Estimated Time**: 3 hours  
**Dependencies**: Task 1.4

**Prompt**:
```
Implement email/password authentication endpoints:

1. Create backend/src/services/auth.service.ts:
   - register(email, password): Create user, hash password, return tokens
   - login(email, password): Verify credentials, return tokens
   - refreshToken(refreshToken): Validate and return new access token
   - logout(userId): Invalidate refresh tokens (store in Redis blacklist)

2. Create backend/src/controllers/auth.controller.ts:
   - POST /api/auth/register handler
   - POST /api/auth/login handler
   - POST /api/auth/refresh handler
   - POST /api/auth/logout handler
   - Validate inputs using validators
   - Handle errors gracefully

3. Create backend/src/middleware/auth.middleware.ts:
   - authenticateToken middleware
   - Extract JWT from Authorization header
   - Verify token and attach user to request
   - Return 401 if invalid/missing

4. Create backend/src/routes/auth.routes.ts:
   - Define all auth routes
   - Apply appropriate middleware
   - Export router

5. Update backend/src/server.ts:
   - Mount auth routes at /api/auth

6. Add rate limiting to auth endpoints:
   - Install express-rate-limit
   - Limit login attempts: 5 per 15 minutes
   - Limit registration: 3 per hour per IP

Follow API endpoints specification from SPEC.md. Return proper HTTP status codes and error messages.
```

**Acceptance Criteria**:
- [ ] Can register new user with valid email/password
- [ ] Registration fails with invalid inputs
- [ ] Can login with correct credentials
- [ ] Login fails with incorrect credentials
- [ ] Refresh token endpoint works
- [ ] Logout invalidates refresh token
- [ ] Auth middleware protects routes
- [ ] Rate limiting prevents brute force
- [ ] Passwords never returned in responses

**Verification Commands**:
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}'

# Test protected route
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

---

### Task 1.6: Google OAuth Setup ❌
**Status**: Not Started  
**Estimated Time**: 3-4 hours  
**Dependencies**: Task 1.5

**Prompt**:
```
Implement Google OAuth 2.0 flow for Google Analytics access:

1. Install required packages:
   - googleapis
   - passport
   - passport-google-oauth20

2. Create backend/src/config/oauth.ts:
   - Google OAuth client configuration
   - Scopes: https://www.googleapis.com/auth/analytics.readonly
   - Redirect URI from environment variable

3. Create backend/src/services/oauth.service.ts:
   - getAuthorizationUrl(userId): Generate OAuth URL with state parameter
   - handleCallback(code, state): Exchange code for tokens
   - refreshAccessToken(refreshToken): Get new access token
   - Store tokens encrypted in database

4. Create backend/src/controllers/oauth.controller.ts:
   - GET /api/auth/google: Redirect to Google OAuth consent
   - GET /api/auth/google/callback: Handle OAuth callback
   - Store tokens in user record (encrypted)
   - Redirect to frontend with success/error

5. Create backend/src/routes/oauth.routes.ts:
   - Define OAuth routes
   - Must be authenticated before initiating OAuth

6. Update user model to handle OAuth tokens:
   - updateGoogleTokens(userId, accessToken, refreshToken, expiresAt)
   - getGoogleTokens(userId): Decrypt and return tokens
   - Check if tokens are expired and refresh if needed

7. Create state management for OAuth flow:
   - Store state parameter in Redis with user ID
   - Validate state in callback to prevent CSRF
   - Expire state after 10 minutes

Follow SPEC.md OAuth flow section. Include comprehensive error handling for OAuth failures.
```

**Acceptance Criteria**:
- [ ] OAuth URL generation works
- [ ] Redirects to Google consent screen
- [ ] Callback handles authorization code
- [ ] Tokens stored encrypted in database
- [ ] State parameter prevents CSRF
- [ ] Token refresh works when expired
- [ ] Error cases handled (denial, invalid state, etc.)
- [ ] Frontend receives success/error callback

**Verification Commands**:
```bash
# Start OAuth flow (must be logged in first)
curl -X GET http://localhost:3001/api/auth/google \
  -H "Authorization: Bearer <access_token>"

# Complete flow manually in browser
# Check database for encrypted tokens
psql -U postgres -d ga_insights -c "SELECT email, google_refresh_token IS NOT NULL as has_token FROM users;"
```

---

### Task 1.7: Frontend Authentication UI ❌
**Status**: Not Started  
**Estimated Time**: 3 hours  
**Dependencies**: Task 1.6

**Prompt**:
```
Create frontend authentication pages and components:

1. Install additional dependencies:
   - React Hook Form
   - Zod (for validation)

2. Create frontend/src/services/api.ts:
   - Axios instance with base URL
   - Request interceptor to add auth token
   - Response interceptor to handle 401 (refresh token)
   - Error handling

3. Create frontend/src/services/authService.ts:
   - register(email, password)
   - login(email, password)
   - logout()
   - refreshToken()
   - getCurrentUser()
   - All methods use api.ts

4. Create frontend/src/hooks/useAuth.ts:
   - React Query hook for authentication
   - Manages auth state (user, tokens, loading)
   - Store tokens in localStorage
   - Auto-refresh token when expired

5. Create frontend/src/contexts/AuthContext.tsx:
   - Auth provider using useAuth hook
   - Expose: user, login, logout, register, isAuthenticated, isLoading

6. Create frontend/src/components/auth/:
   - LoginForm.tsx: Email/password form with validation
   - RegisterForm.tsx: Registration form with validation
   - GoogleOAuthButton.tsx: "Connect Google Analytics" button

7. Create frontend/src/pages/:
   - Login.tsx: Login page with form
   - Register.tsx: Registration page with form
   - Add links between login/register pages

8. Create frontend/src/App.tsx:
   - Router setup
   - AuthContext provider
   - Public routes: /login, /register
   - Protected routes placeholder

9. Add Tailwind styling:
   - Clean, modern forms
   - Responsive design
   - Error message display
   - Loading states

Follow component structure from SPEC.md. Use React Hook Form for form management and Zod for validation.
```

**Acceptance Criteria**:
- [ ] Login page renders correctly
- [ ] Registration page renders correctly
- [ ] Forms validate inputs (email format, password strength)
- [ ] Error messages display for invalid inputs
- [ ] Successful login stores token and redirects
- [ ] Successful registration logs user in
- [ ] Google OAuth button initiates OAuth flow
- [ ] Loading states show during API calls
- [ ] Responsive design works on mobile
- [ ] Navigation between login/register works

**Verification Steps**:
1. Open http://localhost:5173/login
2. Try invalid inputs - see validation errors
3. Register new account - should redirect to dashboard
4. Logout and login again - should work
5. Test on mobile viewport

---

## Phase 2: GA Properties & Dashboard (Week 3-4)

### Task 2.1: GA Properties Model & Service ❌
**Status**: Not Started  
**Estimated Time**: 2 hours  
**Dependencies**: Task 1.7

**Prompt**:
```
Create Google Analytics properties data layer:

1. Create backend/src/models/property.model.ts:
   - Property interface matching database schema
   - create(userId, propertyId, propertyName, websiteUrl)
   - findByUserId(userId): Get all user's properties
   - findById(id): Get single property
   - update(id, data): Update property info
   - delete(id): Soft delete or hard delete property
   - updateLastSynced(id): Update last_synced_at timestamp

2. Create backend/src/services/ga4.service.ts (basic version):
   - listProperties(accessToken): Fetch user's GA4 properties from Google
   - Use googleapis library
   - Parse response and return array of {propertyId, propertyName, websiteUrl}
   - Handle OAuth errors (expired tokens, invalid tokens)

3. Create backend/src/services/properties.service.ts:
   - connectProperty(userId, propertyId): Save property to database
   - getUserProperties(userId): Get all properties for user
   - getPropertyDetails(propertyId): Get single property with last sync info
   - disconnectProperty(propertyId): Remove property
   - syncProperties(userId): Fetch from GA and update database

4. Add error handling:
   - Handle GA API errors (rate limits, invalid property)
   - Handle database errors
   - Custom error types: PropertyNotFoundError, GAAPIError

Follow SPEC.md for GA4 API integration patterns. Use the @google-analytics/data package.
```

**Acceptance Criteria**:
- [ ] Property model CRUD operations work
- [ ] Can fetch properties from GA4 API
- [ ] Properties saved to database correctly
- [ ] User can have multiple properties
- [ ] syncProperties updates existing and adds new
- [ ] Errors handled gracefully
- [ ] Last synced timestamp updates

**Verification Commands**:
```bash
# Test with actual Google account that has GA properties
# Run integration test or manual test via API
```

---

### Task 2.2: Properties API Endpoints ❌
**Status**: Not Started  
**Estimated Time**: 2 hours  
**Dependencies**: Task 2.1

**Prompt**:
```
Create API endpoints for GA properties management:

1. Create backend/src/controllers/properties.controller.ts:
   - GET /api/properties: List user's connected properties
   - POST /api/properties/connect: After OAuth, fetch and save GA properties
   - GET /api/properties/:id: Get single property details
   - DELETE /api/properties/:id: Disconnect property
   - POST /api/properties/sync: Re-sync properties from GA

2. Create backend/src/routes/properties.routes.ts:
   - Define all property routes
   - All routes require authentication
   - Export router

3. Update backend/src/server.ts:
   - Mount properties routes at /api/properties

4. Add authorization checks:
   - Ensure user can only access their own properties
   - Return 403 if trying to access another user's property

5. Add caching for property list:
   - Cache in Redis for 1 hour
   - Invalidate cache on connect/disconnect/sync

Follow API endpoints from SPEC.md. Return appropriate HTTP status codes.
```

**Acceptance Criteria**:
- [ ] GET /api/properties returns user's properties
- [ ] POST /api/properties/connect saves properties after OAuth
- [ ] GET /api/properties/:id returns single property
- [ ] DELETE /api/properties/:id removes property
- [ ] Authorization prevents access to others' properties
- [ ] Caching reduces repeated database queries
- [ ] All endpoints return consistent JSON format

**Verification Commands**:
```bash
# List properties
curl -X GET http://localhost:3001/api/properties \
  -H "Authorization: Bearer <token>"

# Get single property
curl -X GET http://localhost:3001/api/properties/<property-id> \
  -H "Authorization: Bearer <token>"

# Disconnect property
curl -X DELETE http://localhost:3001/api/properties/<property-id> \
  -H "Authorization: Bearer <token>"
```

---

### Task 2.3: GA4 Analytics Data Fetching ❌
**Status**: Not Started  
**Estimated Time**: 4 hours  
**Dependencies**: Task 2.2

**Prompt**:
```
Implement GA4 Data API integration for fetching analytics data:

1. Expand backend/src/services/ga4.service.ts:
   - getTrafficMetrics(propertyId, accessToken, dateRange): Fetch users, sessions, bounce rate, avg duration
   - getTopPages(propertyId, accessToken, dateRange, limit): Fetch top pages with metrics
   - getTrafficSources(propertyId, accessToken, dateRange): Fetch traffic by source/medium
   - getConversionData(propertyId, accessToken, dateRange): Fetch conversion metrics if goals configured
   - getUserBehavior(propertyId, accessToken, dateRange): Fetch device, location, time patterns

2. For each method:
   - Use BetaAnalyticsDataClient from @google-analytics/data
   - Build proper runReport requests with dimensions and metrics
   - Parse responses into clean TypeScript interfaces
   - Handle pagination if needed
   - Implement retry logic with exponential backoff
   - Handle rate limiting (503 errors)

3. Create backend/src/types/ga4.types.ts:
   - TrafficMetrics interface
   - TopPage interface
   - TrafficSource interface
   - ConversionData interface
   - UserBehavior interface
   - DateRange type

4. Create backend/src/services/cache.service.ts:
   - get(key): Get from Redis
   - set(key, data, ttl): Store in Redis
   - invalidate(pattern): Delete matching keys
   - Generate cache keys following SPEC.md pattern

5. Update ga4.service.ts to use caching:
   - Check cache before API call
   - Cache completed date ranges for 24 hours
   - Cache current day for 1 hour
   - Implement cache key generation per SPEC.md

Follow SPEC.md for GA4 Data API integration and caching strategy. Reference the example code in SPEC.md.
```

**Acceptance Criteria**:
- [ ] Can fetch traffic metrics from GA4
- [ ] Can fetch top pages with metrics
- [ ] Can fetch traffic sources breakdown
- [ ] Can fetch conversion data (if configured)
- [ ] Can fetch user behavior data
- [ ] All responses parsed into clean interfaces
- [ ] Caching reduces API calls
- [ ] Retry logic handles transient failures
- [ ] Rate limiting respected
- [ ] Errors logged with context

**Verification Commands**:
```bash
# Manual testing through API endpoints (to be created next)
# Check Redis for cached data
redis-cli KEYS "traffic_metrics:*"
```

---

### Task 2.4: Analytics API Endpoints ❌
**Status**: Not Started  
**Estimated Time**: 2 hours  
**Dependencies**: Task 2.3

**Prompt**:
```
Create API endpoints for fetching analytics data:

1. Create backend/src/controllers/analytics.controller.ts:
   - GET /api/analytics/:propertyId/traffic: Get traffic metrics
   - GET /api/analytics/:propertyId/pages: Get top pages
   - GET /api/analytics/:propertyId/sources: Get traffic sources
   - GET /api/analytics/:propertyId/conversions: Get conversion data
   - GET /api/analytics/:propertyId/behavior: Get user behavior data

2. For each endpoint:
   - Validate propertyId belongs to authenticated user
   - Parse query params for dateRange (startDate, endDate)
   - Default to last 30 days if not specified
   - Fetch user's Google tokens from database
   - Call appropriate ga4.service method
   - Return formatted response

3. Create backend/src/routes/analytics.routes.ts:
   - Define all analytics routes
   - All routes require authentication
   - Export router

4. Update backend/src/server.ts:
   - Mount analytics routes at /api/analytics

5. Add request validation:
   - Validate date format (YYYY-MM-DD)
   - Validate date range (not future dates, max 1 year range)
   - Return 400 for invalid params

6. Implement rate limiting per property:
   - Track GA API calls per property per day
   - Warn at 80% of daily limit
   - Return 429 if limit exceeded

Follow API endpoints from SPEC.md. Include proper error handling for expired tokens and GA API errors.
```

**Acceptance Criteria**:
- [ ] All analytics endpoints return data
- [ ] Date range validation works
- [ ] Authorization prevents unauthorized access
- [ ] Proper error messages for invalid dates
- [ ] Rate limiting tracks per property
- [ ] Token refresh works automatically
- [ ] Responses match TypeScript interfaces
- [ ] Query params parsed correctly

**Verification Commands**:
```bash
# Get traffic metrics
curl -X GET "http://localhost:3001/api/analytics/<property-id>/traffic?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <token>"

# Get top pages
curl -X GET "http://localhost:3001/api/analytics/<property-id>/pages?startDate=2024-01-01&endDate=2024-01-31&limit=10" \
  -H "Authorization: Bearer <token>"
```

---

### Task 2.5: Frontend Properties Management ❌
**Status**: Not Started  
**Estimated Time**: 3 hours  
**Dependencies**: Task 2.4

**Prompt**:
```
Create frontend UI for managing GA properties:

1. Create frontend/src/services/propertiesService.ts:
   - getProperties()
   - getProperty(id)
   - connectProperty()
   - disconnectProperty(id)
   - syncProperties()

2. Create frontend/src/hooks/useProperties.ts:
   - React Query hooks for properties
   - useProperties(): Fetch all properties
   - useProperty(id): Fetch single property
   - useConnectProperty(): Mutation for connecting
   - useDisconnectProperty(): Mutation for disconnecting

3. Create frontend/src/contexts/PropertyContext.tsx:
   - Manage selected property state
   - selectedProperty, setSelectedProperty
   - Load from localStorage on mount
   - Auto-select first property if none selected

4. Create frontend/src/components/properties/:
   - PropertyList.tsx: Grid/list of property cards
   - PropertyCard.tsx: Single property display with metrics preview
   - PropertySelector.tsx: Dropdown for selecting active property
   - ConnectPropertyButton.tsx: Button to initiate OAuth flow
   - DisconnectPropertyDialog.tsx: Confirmation dialog for disconnect

5. Create frontend/src/pages/Properties.tsx:
   - List all connected properties
   - Connect new property button
   - Empty state if no properties
   - Loading and error states

6. Style with Tailwind:
   - Card-based layout
   - Property info: name, URL, last synced
   - Connect/disconnect actions
   - Responsive grid

Follow component structure from SPEC.md. Use React Query for data fetching and caching.
```

**Acceptance Criteria**:
- [ ] Properties page displays all properties
- [ ] Can connect new property via OAuth
- [ ] Can disconnect property with confirmation
- [ ] Property selector works in navigation
- [ ] Selected property persists across page loads
- [ ] Empty state shows when no properties
- [ ] Loading states during API calls
- [ ] Error messages for failures
- [ ] Responsive design works

**Verification Steps**:
1. Navigate to /properties
2. See list of connected properties (or empty state)
3. Click "Connect Property" - goes through OAuth
4. After OAuth, see new property in list
5. Select property from dropdown
6. Disconnect a property - see confirmation
7. Refresh page - selected property remembered

---

### Task 2.6: Dashboard Metrics Components ❌
**Status**: Not Started  
**Estimated Time**: 4 hours  
**Dependencies**: Task 2.5

**Prompt**:
```
Create dashboard UI to display GA metrics:

1. Create frontend/src/services/analyticsService.ts:
   - getTrafficMetrics(propertyId, dateRange)
   - getTopPages(propertyId, dateRange, limit)
   - getTrafficSources(propertyId, dateRange)
   - All methods use api.ts

2. Create frontend/src/hooks/useAnalytics.ts:
   - useTrafficMetrics(propertyId, dateRange)
   - useTopPages(propertyId, dateRange, limit)
   - useTrafficSources(propertyId, dateRange)
   - React Query hooks with proper caching

3. Create frontend/src/components/dashboard/:
   - MetricsOverview.tsx: 4 metric cards (users, sessions, bounce rate, duration)
     - Display current value
     - Display % change vs previous period
     - Up/down arrow with color (green/red)
     - Tooltip with previous period value
   
   - TrafficChart.tsx: Line chart showing users/sessions over time
     - Use Recharts library
     - Toggle between users and sessions
     - Responsive design
   
   - TopPagesTable.tsx: Table of top 10 pages
     - Columns: Page, Views, Bounce Rate
     - Sortable columns
     - Pagination if >10 results
   
   - TrafficSourcesChart.tsx: Pie chart of traffic sources
     - Use Recharts
     - Show: Organic, Direct, Referral, Social, Paid
     - Percentages and counts in legend
   
   - DateRangePicker.tsx: Date range selector
     - Presets: Last 7 days, Last 30 days, Last 90 days, Custom
     - Date inputs for custom range
     - Apply button

4. Install chart library:
   - Recharts or Chart.js (prefer Recharts for React)

5. Create frontend/src/pages/Dashboard.tsx:
   - Show property selector
   - Show date range picker
   - Show metrics overview cards
   - Show traffic chart
   - Show top pages table
   - Show traffic sources chart
   - Link to Google Analytics dashboard
   - Loading states while fetching
   - Error states for API failures

6. Style with Tailwind:
   - Card-based layout
   - Responsive grid (4 cols desktop, 2 cols tablet, 1 col mobile)
   - Clean, modern design
   - Charts with proper colors and labels

Follow dashboard design from SPEC.md. Keep it lightweight - it's a preview, not a full GA replacement.
```

**Acceptance Criteria**:
- [ ] Dashboard displays all metrics correctly
- [ ] Metric cards show % change with colors
- [ ] Line chart renders traffic over time
- [ ] Top pages table shows data
- [ ] Traffic sources pie chart renders
- [ ] Date range picker changes data
- [ ] Property selector switches properties
- [ ] Link to Google Analytics works
- [ ] Loading states during data fetch
- [ ] Error messages for failures
- [ ] Responsive design works on mobile
- [ ] Charts responsive to screen size

**Verification Steps**:
1. Navigate to /dashboard
2. Select a property
3. See all metrics load
4. Change date range - see data update
5. Switch property - see data update
6. Verify metrics match Google Analytics
7. Test on mobile viewport
8. Test error state (disconnect internet)

---

## Phase 3: LLM Integration - Preset Reports (Week 5-6)

### Task 3.1: Local LLM Setup ❌
**Status**: Not Started  
**Estimated Time**: 1-2 hours  
**Dependencies**: Task 2.6

**Prompt**:
```
Set up local LLM integration for development:

1. Document Ollama setup in README.md:
   - Installation instructions for macOS/Linux/Windows
   - Pull llama3.2:3b or llama3.2:8b model
   - Start Ollama service
   - Test with simple query

2. Create backend/src/config/llm.ts:
   - LLM configuration from environment
   - Support for multiple providers (Ollama, OpenAI, Anthropic)
   - Provider: 'ollama' | 'openai' | 'anthropic'
   - Model name configuration
   - API endpoint URLs

3. Install LLM client libraries:
   - ollama (for local)
   - openai (fallback for function calling)
   - @anthropic-ai/sdk (alternative)

4. Create backend/src/services/llm.service.ts (basic version):
   - generateText(prompt, systemPrompt): Send request to LLM
   - Handle streaming vs non-streaming
   - Error handling and retries
   - Token counting/tracking
   - Support switching between providers based on config

5. Add environment variables:
   - LLM_PROVIDER=ollama
   - OLLAMA_HOST=http://localhost:11434
   - OLLAMA_MODEL=llama3.2:3b
   - OPENAI_API_KEY (optional fallback)
   - OPENAI_MODEL=gpt-4o-mini

6. Create test endpoint:
   - POST /api/test/llm: Test LLM with simple prompt
   - Returns response and metadata (tokens, time)

Follow SPEC.md LLM integration section. Include fallback to OpenAI if Ollama fails or is too slow.
```

**Acceptance Criteria**:
- [ ] Ollama installed and running locally
- [ ] LLM service can send requests to Ollama
- [ ] Can switch between Ollama and OpenAI via config
- [ ] Error handling for LLM failures
- [ ] Test endpoint returns LLM response
- [ ] Token counting works
- [ ] Response time acceptable (<5s for simple prompts)

**Verification Commands**:
```bash
# Check Ollama is running
ollama list

# Test LLM endpoint
curl -X POST http://localhost:3001/api/test/llm \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is analytics?"}'
```

---

### Task 3.2: Prompt Templates System ❌
**Status**: Not Started  
**Estimated Time**: 2 hours  
**Dependencies**: Task 3.1

**Prompt**:
```
Create prompt engineering system for insights generation:

1. Create backend/src/prompts/ directory structure:
   - systemPrompts.ts: System prompts for different contexts
   - reportTemplates.ts: Templates for each report type
   - formatters.ts: Helpers to format data for LLM context

2. Create backend/src/prompts/systemPrompts.ts:
   - ANALYTICS_EXPERT_PROMPT: Main system prompt from SPEC.md
   - REPORT_GENERATOR_PROMPT: For structured reports
   - CHAT_ASSISTANT_PROMPT: For conversational queries
   - Each with clear instructions on tone, format, and actionability

3. Create backend/src/prompts/reportTemplates.ts:
   - trafficHealthCheckTemplate(data): Format prompt for traffic health
   - conversionFunnelTemplate(data): Format prompt for funnel analysis
   - contentPerformanceTemplate(data): Format prompt for content review
   - trafficSourcesTemplate(data): Format prompt for source optimization
   - userBehaviorTemplate(data): Format prompt for behavior insights
   - Each includes: data context, analysis instructions, output format

4. Create backend/src/prompts/formatters.ts:
   - formatMetricsForLLM(metrics): Convert metrics to readable format
   - formatTopPagesForLLM(pages): Format pages array
   - formatTrafficSourcesForLLM(sources): Format sources array
   - formatDateRange(start, end): Human-readable date range
   - calculateTrends(current, previous): Calculate and format % changes

5. Create backend/src/types/insights.types.ts:
   - InsightType enum: 'traffic_health' | 'conversion_funnel' | etc.
   - Insight interface: id, type, title, content, actionItems, etc.
   - ActionItem interface: text, priority, estimatedImpact
   - InsightRequest interface: propertyId, type, dateRange

Reference SPEC.md prompt templates section. Ensure prompts produce actionable outputs.
```

**Acceptance Criteria**:
- [ ] System prompts follow SPEC.md guidelines
- [ ] Report templates structured for each insight type
- [ ] Data formatters convert GA data to LLM-friendly format
- [ ] Prompt templates include clear output format instructions
- [ ] TypeScript types defined for all insight structures
- [ ] Templates produce consistent, parseable outputs

**Verification Commands**:
```bash
# Test by generating prompt and reviewing format
npm run test:unit -- prompts
```

---

### Task 3.3: Insights Generation Service ❌
**Status**: Not Started  
**Estimated Time**: 4 hours  
**Dependencies**: Task 3.2

**Prompt**:
```
Create insights generation service that combines GA data with LLM:

1. Create backend/src/models/insight.model.ts:
   - Insight CRUD operations
   - create(propertyId, type, title, content, actionItems, dateRange)
   - findByPropertyId(propertyId, limit, offset)
   - findById(id)
   - update(id, data): For user ratings
   - delete(id)

2. Expand backend/src/services/llm.service.ts:
   - generateStructuredInsight(prompt, systemPrompt): Request with JSON output
   - parseInsightResponse(response): Extract title, summary, findings, actions
   - Handle parsing errors gracefully

3. Create backend/src/services/insights.service.ts:
   - generateTrafficHealthCheck(propertyId, userId, dateRange):
     a. Fetch traffic metrics from GA
     b. Fetch comparison period metrics
     c. Calculate trends
     d. Format data with promptTemplates
     e. Send to LLM
     f. Parse response
     g. Save to database
     h. Return insight
   
   - generateConversionFunnel(propertyId, userId, dateRange): Similar flow
   - generateContentPerformance(propertyId, userId, dateRange): Similar flow
   - generateTrafficSources(propertyId, userId, dateRange): Similar flow
   - generateUserBehavior(propertyId, userId, dateRange): Similar flow

4. For each generation method:
   - Validate user owns property
   - Fetch necessary GA data (multiple calls if needed)
   - Use appropriate report template
   - Include system prompt from systemPrompts.ts
   - Parse LLM response into structured format
   - Extract action items (list of strings)
   - Store in database with metadata
   - Track LLM usage (tokens, cost)

5. Create backend/src/utils/insightParser.ts:
   - parseTrafficHealthResponse(text): Extract title, findings, actions
   - parseConversionFunnelResponse(text): Same structure
   - Generic parseInsightResponse(text, type): Flexible parser
   - Handle markdown formatting
   - Extract bullet points as action items

6. Add response validation:
   - Ensure all required fields present
   - Validate action items are actionable
   - Retry generation if output malformed (max 2 retries)

Follow SPEC.md insights generation patterns. Use the report templates from Task 3.2.
```

**Acceptance Criteria**:
- [ ] Can generate traffic health check insight
- [ ] Can generate conversion funnel insight
- [ ] Can generate content performance insight
- [ ] Can generate traffic sources insight
- [ ] Can generate user behavior insight
- [ ] Insights saved to database correctly
- [ ] LLM responses parsed into structured format
- [ ] Action items extracted as array
- [ ] Error handling for LLM failures
- [ ] Retries work for malformed responses
- [ ] Token usage tracked

**Verification Commands**:
```bash
# Test via API endpoint (to be created next)
# Check database for saved insights
psql -U postgres -d ga_insights -c "SELECT id, insight_type, title FROM insights LIMIT 5;"
```

---

### Task 3.4: Insights API Endpoints ❌
**Status**: Not Started  
**Estimated Time**: 2 hours  
**Dependencies**: Task 3.3

**Prompt**:
```
Create API endpoints for insights generation and retrieval:

1. Create backend/src/controllers/insights.controller.ts:
   - GET /api/insights/:propertyId: List all insights for property
     - Pagination support (limit, offset)
     - Filter by insight_type query param
     - Sort by generated_at DESC
   
   - POST /api/insights/:propertyId/generate: Generate specific insight
     - Body: { type, dateRange }
     - Validate type is valid InsightType
     - Call appropriate insights.service method
     - Return generated insight
   
   - GET /api/insights/:id: Get single insight by ID
     - Mark as viewed if not already
   
   - POST /api/insights/:id/rate: Rate insight
     - Body: { rating: 1-5 }
     - Update user_rating in database
   
   - DELETE /api/insights/:id: Delete insight
     - Only owner can delete

2. Create specific report generation endpoints:
   - POST /api/insights/:propertyId/traffic-health
   - POST /api/insights/:propertyId/conversion-funnel
   - POST /api/insights/:propertyId/content-performance
   - POST /api/insights/:propertyId/traffic-sources
   - POST /api/insights/:propertyId/user-behavior
   - Each accepts { dateRange } in body

3. Create backend/src/routes/insights.routes.ts:
   - Define all insights routes
   - All routes require authentication
   - Apply rate limiting (10 insights per day for free tier)
   - Export router

4. Update backend/src/server.ts:
   - Mount insights routes at /api/insights

5. Add authorization checks:
   - Verify user owns property before generating
   - Verify user owns insight before accessing

6. Add loading indicators:
   - Return 202 Accepted immediately
   - Generate insight asynchronously (or synchronously for MVP)
   - Return insight when complete

Follow SPEC.md API endpoints for insights. Include proper error handling and rate limiting.
```

**Acceptance Criteria**:
- [ ] Can list all insights for a property
- [ ] Can generate each type of insight
- [ ] Can retrieve single insight
- [ ] Can rate an insight
- [ ] Can delete own insights
- [ ] Authorization prevents unauthorized access
- [ ] Rate limiting enforced (10/day)
- [ ] Pagination works for insight lists
- [ ] All endpoints return consistent format
- [ ] Errors handled gracefully

**Verification Commands**:
```bash
# Generate traffic health insight
curl -X POST "http://localhost:3001/api/insights/<property-id>/traffic-health" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"dateRange":{"start":"2024-01-01","end":"2024-01-31"}}'

# List insights
curl -X GET "http://localhost:3001/api/insights/<property-id>?limit=10" \
  -H "Authorization: Bearer <token>"

# Rate insight
curl -X POST "http://localhost:3001/api/insights/<insight-id>/rate" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"rating":5}'
```

---

### Task 3.5: Frontend Insights UI ❌
**Status**: Not Started  
**Estimated Time**: 4 hours  
**Dependencies**: Task 3.4

**Prompt**:
```
Create frontend UI for viewing and generating insights:

1. Create frontend/src/services/insightsService.ts:
   - getInsights(propertyId, limit, offset, type?)
   - getInsight(id)
   - generateInsight(propertyId, type, dateRange)
   - generateTrafficHealth(propertyId, dateRange)
   - generateConversionFunnel(propertyId, dateRange)
   - generateContentPerformance(propertyId, dateRange)
   - generateTrafficSources(propertyId, dateRange)
   - generateUserBehavior(propertyId, dateRange)
   - rateInsight(id, rating)
   - deleteInsight(id)

2. Create frontend/src/hooks/useInsights.ts:
   - useInsights(propertyId, type?): Query for insights list
   - useInsight(id): Query for single insight
   - useGenerateInsight(): Mutation for generation
   - useRateInsight(): Mutation for rating
   - useDeleteInsight(): Mutation for deletion

3. Create frontend/src/components/insights/:
   - InsightCard.tsx: Display single insight
     - Title and insight type badge
     - Generated date
     - Summary/content section
     - Action items list with checkboxes (local state only)
     - Rating stars (1-5)
     - Delete button
   
   - InsightsList.tsx: List of insight cards
     - Grid layout
     - Filter by type
     - Pagination
     - Empty state
   
   - ReportGenerator.tsx: Buttons to generate each report type
     - 5 buttons for each report type
     - Date range picker
     - Loading state during generation
     - Error handling
   
   - ActionItems.tsx: Checklist of action items
     - Checkbox for each item
     - Priority indicator (high/medium/low)
     - Estimated impact display
     - Local state (doesn't persist)
   
   - InsightTypeFilter.tsx: Filter dropdown
     - All types option
     - Individual report types

4. Create frontend/src/pages/Insights.tsx:
   - Property selector at top
   - Report generator section
   - Filter and sort controls
   - Insights list
   - Pagination controls
   - Loading states
   - Error states

5. Style with Tailwind:
   - Card-based layout for insights
   - Color-coded by insight type
   - Action items as styled checklist
   - Rating stars interactive
   - Responsive grid layout

Follow SPEC.md UI specifications. Make insights visually distinct and easy to scan.
```

**Acceptance Criteria**:
- [ ] Insights page displays all insights
- [ ] Can generate each type of report
- [ ] Report generation shows loading state
- [ ] Generated insight appears in list
- [ ] Can view single insight with full content
- [ ] Action items displayed as checklist
- [ ] Can rate insights (stars update)
- [ ] Can delete insights with confirmation
- [ ] Filter by insight type works
- [ ] Pagination works for many insights
- [ ] Empty state when no insights
- [ ] Error messages for failures
- [ ] Responsive design works

**Verification Steps**:
1. Navigate to /insights
2. Select property
3. Click "Generate Traffic Health Check"
4. See loading state
5. See generated insight appear
6. Click to expand full insight
7. Check off action items
8. Rate the insight
9. Generate other report types
10. Filter by type
11. Delete an insight

---

## Phase 4: Chat Interface (Week 7-8)

### Task 4.1: Function Calling Setup ❌
**Status**: Not Started  
**Estimated Time**: 3 hours  
**Dependencies**: Task 3.5

**Prompt**:
```
Implement function calling for intelligent data fetching:

1. Update backend/src/config/llm.ts:
   - Add support for function calling mode
   - Configure for OpenAI (better function calling support than Llama)
   - Fall back to OpenAI for chat if Ollama doesn't support functions

2. Create backend/src/services/functions.ts:
   - Define available functions for LLM to call
   - Each function matches a GA data fetching method
   - Functions:
     - getTrafficMetrics(propertyId, startDate, endDate)
     - getTopPages(propertyId, startDate, endDate, limit)
     - getTrafficSources(propertyId, startDate, endDate)
     - getConversionData(propertyId, startDate, endDate)
     - getUserBehavior(propertyId, startDate, endDate)
     - getHistoricalTrend(propertyId, metric, days)
   
3. Define function schemas in OpenAI format:
   - Name, description, parameters for each function
   - Clear descriptions so LLM knows when to use each
   - Parameter types and required fields
   - Follow OpenAI function calling API spec

4. Update backend/src/services/llm.service.ts:
   - Add generateWithFunctions(messages, functions, maxIterations)
   - Send initial query to LLM with available functions
   - If LLM requests function call:
     - Parse function name and arguments
     - Execute function (fetch GA data)
     - Add function result to messages
     - Send back to LLM for final answer
   - Repeat up to maxIterations (default 5)
   - Return final text response

5. Create backend/src/services/chat.service.ts:
   - answerQuestion(propertyId, question, conversationHistory)
   - Build messages array with system prompt and history
   - Call llm.generateWithFunctions()
   - Track which functions were called
   - Return { answer, functionsUsed, tokensUsed }

6. Add conversation history model:
   - Already exists in database schema
   - Implement in backend/src/models/conversation.model.ts
   - create(userId, propertyId, messages)
   - findById(id)
   - update(id, newMessages)
   - Keep last 10 messages for context

Follow SPEC.md function calling patterns. Ensure LLM can fetch exactly what it needs.
```

**Acceptance Criteria**:
- [ ] Function schemas defined correctly
- [ ] LLM can request function calls
- [ ] Functions execute and return data
- [ ] Results sent back to LLM
- [ ] Final answer generated with context
- [ ] Conversation history maintained
- [ ] Multiple function calls in one query supported
- [ ] Max iterations prevents infinite loops
- [ ] Errors handled gracefully

**Verification Commands**:
```bash
# Test via chat endpoint (to be created next)
# Check logs to see which functions were called
```

---

### Task 4.2: Chat API Endpoints ❌
**Status**: Not Started  
**Estimated Time**: 2 hours  
**Dependencies**: Task 4.1

**Prompt**:
```
Create API endpoints for chat/query interface:

1. Create backend/src/controllers/chat.controller.ts:
   - POST /api/chat/:propertyId/query: Answer a question
     - Body: { question, conversationId? }
     - If conversationId provided, load history
     - Otherwise start new conversation
     - Call chat.service.answerQuestion()
     - Save messages to conversation
     - Return { answer, conversationId, functionsUsed }
   
   - GET /api/chat/:propertyId/history: Get conversation history
     - Query param: conversationId
     - Return full conversation
   
   - DELETE /api/chat/:propertyId/history: Clear conversation
     - Query param: conversationId
     - Delete conversation from database
   
   - POST /api/chat/:propertyId/new: Start new conversation
     - Create new conversation record
     - Return conversationId

2. Create backend/src/routes/chat.routes.ts:
   - Define all chat routes
   - All routes require authentication
   - Apply rate limiting (50 messages per day for free tier)
   - Export router

3. Update backend/src/server.ts:
   - Mount chat routes at /api/chat

4. Add authorization checks:
   - Verify user owns property
   - Verify user owns conversation

5. Add streaming support (optional, for better UX):
   - Stream LLM responses token by token
   - Use Server-Sent Events (SSE)
   - Endpoint: POST /api/chat/:propertyId/query/stream

Follow SPEC.md chat API endpoints. Consider streaming for better user experience.
```

**Acceptance Criteria**:
- [ ] Can send question and get answer
- [ ] Conversation history maintained
- [ ] Can load previous conversation
- [ ] Can start new conversation
- [ ] Can clear conversation history
- [ ] Authorization prevents unauthorized access
- [ ] Rate limiting enforced
- [ ] Functions called as needed
- [ ] Errors handled gracefully
- [ ] Streaming works (if implemented)

**Verification Commands**:
```bash
# Ask a question
curl -X POST "http://localhost:3001/api/chat/<property-id>/query" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"question":"Why did my traffic drop last week?"}'

# Get history
curl -X GET "http://localhost:3001/api/chat/<property-id>/history?conversationId=<id>" \
  -H "Authorization: Bearer <token>"
```

---

### Task 4.3: Frontend Chat Interface ❌
**Status**: Not Started  
**Estimated Time**: 4 hours  
**Dependencies**: Task 4.2

**Prompt**:
```
Create frontend chat interface for natural language queries:

1. Create frontend/src/services/chatService.ts:
   - sendMessage(propertyId, question, conversationId?)
   - getHistory(propertyId, conversationId)
   - clearHistory(propertyId, conversationId)
   - startNewConversation(propertyId)

2. Create frontend/src/hooks/useChat.ts:
   - useChat(propertyId): Manage chat state
   - messages: Message[]
   - conversationId: string | null
   - sendMessage(question): Send and update messages
   - clearChat(): Clear conversation
   - newChat(): Start new conversation
   - isLoading: boolean

3. Create frontend/src/components/chat/:
   - ChatInterface.tsx: Main chat container
     - Header with property name and new chat button
     - MessageList in scrollable area
     - MessageInput at bottom
     - Auto-scroll to latest message
   
   - MessageList.tsx: Display all messages
     - User messages aligned right
     - Assistant messages aligned left
     - Timestamp on each message
     - Loading indicator while waiting
   
   - Message.tsx: Single message bubble
     - Different styling for user vs assistant
     - Markdown rendering for assistant messages
     - Copy button for assistant messages
   
   - MessageInput.tsx: Input area
     - Textarea with auto-resize
     - Send button
     - Disabled while loading
     - Shift+Enter for new line, Enter to send
   
   - SuggestedQuestions.tsx: Quick question buttons
     - Show when no messages yet
     - Example questions:
       - "How is my traffic trending?"
       - "What's my best performing content?"
       - "Why did my bounce rate increase?"
       - "Where should I focus my marketing efforts?"
     - Click to populate input

4. Create frontend/src/pages/Chat.tsx:
   - Property selector
   - ChatInterface component
   - Sidebar with conversation history (future enhancement)

5. Install dependencies:
   - react-markdown: Render markdown in messages
   - react-syntax-highlighter: Code blocks in responses

6. Style with Tailwind:
   - Chat bubble design
   - Smooth animations for new messages
   - Loading dots animation
   - Responsive layout
   - Clean, modern messenger-style UI

Follow SPEC.md chat interface design. Make it feel like a real conversation.
```

**Acceptance Criteria**:
- [ ] Chat interface renders correctly
- [ ] Can send messages
- [ ] Assistant responses appear
- [ ] Loading state while waiting
- [ ] Markdown rendered in responses
- [ ] Suggested questions work
- [ ] Can start new conversation
- [ ] Can clear conversation
- [ ] Messages persist in conversation
- [ ] Auto-scroll to new messages
- [ ] Shift+Enter adds new line
- [ ] Enter sends message
- [ ] Copy button works
- [ ] Responsive design

**Verification Steps**:
1. Navigate to /chat
2. Select property
3. See suggested questions
4. Click a suggested question
5. See message sent and response
6. Ask follow-up question
7. See conversation maintained
8. Click "New Chat"
9. Previous conversation cleared
10. Test on mobile viewport

---

## Phase 5: Automation & Polish (Week 9-10)

### Task 5.1: Daily Digest Email System ❌
**Status**: Not Started  
**Estimated Time**: 4 hours  
**Dependencies**: Task 4.3

**Prompt**:
```
Implement automated daily digest email system:

1. Install email dependencies:
   - nodemailer
   - mjml (for responsive email templates)

2. Create backend/src/services/email.service.ts:
   - sendEmail(to, subject, html, text)
   - Configure with SMTP settings from environment
   - Handle sending errors
   - Log all sent emails

3. Create backend/src/templates/email/:
   - dailyDigest.mjml: MJML template for digest email
     - Header with property name
     - Insight summary section
     - Action items section
     - View full report CTA button
     - Unsubscribe link
   - Compile MJML to HTML

4. Create backend/src/services/digest.service.ts:
   - generateDailyDigest(userId):
     - For each user property with digest enabled
     - Pick most relevant recent insight or generate new one
     - Logic: Priority to unusual changes (traffic drops/spikes)
     - Format into email content
     - Return { propertyId, subject, content }
   
   - sendDailyDigests():
     - Find all users with daily_digest_enabled=true
     - For each user, call generateDailyDigest()
     - Send email via email.service
     - Log success/failure

5. Create backend/src/jobs/dailyDigest.job.ts:
   - Use node-cron or node-schedule
   - Schedule to run daily at 8 AM user's timezone (default UTC for now)
   - Call digest.service.sendDailyDigests()
   - Catch and log errors

6. Update user settings:
   - Add daily_digest_enabled to users table (already in schema)
   - Add digest_time preference (default 08:00)
   - Add timezone preference

7. Create backend/src/routes/settings.routes.ts:
   - GET /api/settings: Get user settings
   - PATCH /api/settings: Update settings
   - POST /api/settings/daily-digest: Toggle digest on/off

8. Start job when server starts:
   - Update backend/src/server.ts to initialize cron jobs

Follow SPEC.md daily digest specification. Ensure emails are responsive and actionable.
```

**Acceptance Criteria**:
- [ ] Email service can send emails
- [ ] Daily digest template renders correctly
- [ ] Digest generation picks relevant insights
- [ ] Cron job runs daily at specified time
- [ ] Users can toggle digest on/off
- [ ] Emails are responsive (mobile-friendly)
- [ ] Unsubscribe link works
- [ ] Errors logged and handled
- [ ] Can manually trigger digest for testing

**Verification Commands**:
```bash
# Manually trigger digest
curl -X POST http://localhost:3001/api/test/digest \
  -H "Authorization: Bearer <token>"

# Check email logs
```

---

### Task 5.2: User Settings Page ❌
**Status**: Not Started  
**Estimated Time**: 2 hours  
**Dependencies**: Task 5.1

**Prompt**:
```
Create user settings page for preferences:

1. Create frontend/src/services/settingsService.ts:
   - getSettings()
   - updateSettings(settings)
   - toggleDailyDigest(enabled)

2. Create frontend/src/hooks/useSettings.ts:
   - useSettings(): Query for settings
   - useUpdateSettings(): Mutation for updates

3. Create frontend/src/components/settings/:
   - SettingsForm.tsx: Main settings form
     - Email preferences section
       - Toggle for daily digest
       - Time picker for digest delivery
     - Notification preferences
     - Account information display
     - Save button
   
   - EmailPreferences.tsx: Email-specific settings
     - Daily digest toggle
     - Digest time picker
     - Test digest button (sends immediately)
   
   - AccountInfo.tsx: Display account details
     - Email (not editable)
     - Member since date
     - Subscription tier
     - Connected properties count

4. Create frontend/src/pages/Settings.tsx:
   - Settings navigation sidebar
   - Settings form
   - Success/error messages
   - Loading states

5. Style with Tailwind:
   - Clean form layout
   - Toggle switches
   - Save confirmation
   - Responsive design

Follow SPEC.md user settings specification.
```

**Acceptance Criteria**:
- [ ] Settings page renders correctly
- [ ] Can toggle daily digest on/off
- [ ] Can change digest delivery time
- [ ] Test digest button works
- [ ] Settings save successfully
- [ ] Success message shows after save
- [ ] Account info displays correctly
- [ ] Responsive design works

**Verification Steps**:
1. Navigate to /settings
2. Toggle daily digest on
3. Select delivery time
4. Click "Test Digest" - receive email
5. Click Save
6. Refresh page - settings persisted
7. Check email at scheduled time next day

---

### Task 5.3: Property Comparison Feature ❌
**Status**: Not Started  
**Estimated Time**: 3 hours  
**Dependencies**: Task 5.2

**Prompt**:
```
Implement property comparison functionality:

1. Create backend/src/services/comparison.service.ts:
   - compareProperties(propertyIds, metrics, dateRange):
     - Fetch same metrics for each property
     - Calculate relative performance
     - Identify best/worst performers
     - Return comparison data structure

2. Create API endpoint:
   - POST /api/analytics/compare
     - Body: { propertyIds, metrics, dateRange }
     - Validate user owns all properties
     - Call comparison.service
     - Return comparison data

3. Create frontend/src/services/comparisonService.ts:
   - compareProperties(propertyIds, metrics, dateRange)

4. Create frontend/src/hooks/useComparison.ts:
   - usePropertyComparison(propertyIds, metrics, dateRange)

5. Create frontend/src/components/comparison/:
   - PropertyComparisonTable.tsx: Side-by-side metrics table
     - Columns: Metric, Property 1, Property 2, Property N
     - Highlight best performer in each row
     - Show % difference
   
   - PropertySelector.tsx: Multi-select for properties
     - Checkbox list of user's properties
     - Select 2-5 properties
   
   - MetricSelector.tsx: Choose which metrics to compare
     - Checkboxes for: Users, Sessions, Bounce Rate, etc.
   
   - ComparisonChart.tsx: Bar chart comparing metrics
     - Use Recharts
     - Grouped bars for each metric
     - Legend for properties

6. Add comparison view to Dashboard or create new page:
   - Property multi-selector
   - Metric selector
   - Date range picker
   - Comparison table
   - Comparison chart
   - Export to CSV button

Follow SPEC.md property comparison specification.
```

**Acceptance Criteria**:
- [ ] Can select multiple properties
- [ ] Can choose which metrics to compare
- [ ] Comparison table shows data side-by-side
- [ ] Best performer highlighted
- [ ] Comparison chart renders correctly
- [ ] Date range affects all properties
- [ ] Can export comparison to CSV
- [ ] Only owner's properties available
- [ ] Responsive design works

**Verification Steps**:
1. Select 2-3 properties
2. Choose metrics to compare
3. Set date range
4. See comparison table populate
5. See chart update
6. Export to CSV
7. Verify data accuracy
