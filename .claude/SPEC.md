# GA Insights Platform - Project Specification

## Executive Summary

An AI-powered analytics assistant for small businesses who have Google Analytics set up but lack the expertise to extract actionable insights. The platform connects to users' GA4 properties, displays essential metrics, and provides LLM-generated reports with concrete action items through both preset templates and natural language queries.

---

## Target User

**Primary Persona**: Small business owners, solo marketers, or small marketing teams who:
- Have GA4 set up and collecting data
- Lack analytics expertise or time to analyze data deeply
- Need actionable recommendations, not just data visualization
- Want to understand "what should I do" rather than "what happened"
- May manage multiple web properties (main site, landing pages, blogs)

---

## Core Features

### 1. User Authentication & Account Management
- Standard account creation with email/password
- Google OAuth 2.0 integration for GA4 access
- User profile with subscription/usage tracking
- Secure token storage and refresh handling

### 2. Google Analytics Property Management
- Connect multiple GA4 properties via OAuth
- Property selection interface (dropdown or cards)
- Basic property info display (name, URL, connection status)
- Ability to disconnect/reconnect properties
- Property comparison capability (compare metrics across properties)

### 3. Analytics Dashboard (Overview)
**Purpose**: Give users confidence they're looking at real data, but drive them toward insights

**Key Metrics Display**:
- Time period selector (Last 7 days, Last 30 days, Last 90 days)
- Core metrics with trend indicators:
  - Total Users (with % change vs previous period)
  - Sessions (with % change)
  - Bounce Rate (with % change)
  - Average Session Duration (with % change)
  - Conversion Rate if goals configured (with % change)

**Visual Components**:
- Line chart: Traffic over time (users/sessions)
- Bar chart: Top 5 pages by pageviews
- Pie chart: Traffic sources breakdown (Organic, Direct, Referral, Social, Paid)
- Simple table: Top 10 pages with basic metrics

**Important**: Keep this lightweight - it's a preview, not a full GA replacement. Include prominent "View in Google Analytics" link.

### 4. LLM-Powered Insights System

#### 4.1 Preset Report Templates
Users can generate these on-demand or schedule them (daily/weekly):

**A. Weekly Traffic Health Check**
- Identifies significant changes (>20% shifts)
- Explains likely causes (seasonality, events, technical issues)
- Flags anomalies requiring attention
- 3-5 specific action items
- Example: "Traffic dropped 35% on Tuesday. Checking your analytics, this coincides with your blog being unreachable for 6 hours. Action: Set up uptime monitoring to catch outages faster."

**B. Conversion Funnel Analysis**
- Maps user journey through key pages
- Identifies biggest drop-off points
- Suggests improvements for each weak point
- ROI estimation for fixing each issue
- Example: "67% of users leave at checkout. Your checkout page loads in 8.3s (industry standard: <3s). Action: Optimize images and enable caching - could recover ~$2,400/month in lost sales."

**C. Content Performance Review**
- Top performing content and why it works
- Underperforming content with improvement suggestions
- Content gaps based on search queries
- Publishing schedule recommendations
- Example: "Your 'beginner guide' posts get 3x more engagement than advanced topics. Action: Create 2 more beginner guides this month on [topic A] and [topic B]."

**D. Traffic Source Optimization**
- ROI analysis per channel
- Recommendations for budget reallocation
- Emerging opportunities
- Channel-specific tactics
- Example: "Organic search drives 60% of conversions at $0 cost. Your top ranking keywords are losing position. Action: Update your top 3 posts with fresh content this week to regain rankings."

**E. User Behavior Insights**
- Device/browser trends
- Geographic patterns
- Time-of-day patterns
- New vs returning user behavior
- Example: "Mobile users have 2x higher bounce rate but desktop converts better. Action: Prioritize mobile UX improvements on your homepage and product pages."

#### 4.2 Natural Language Query Interface
- Free-form questions about analytics data
- LLM decides what data it needs and fetches it (function calling)
- Maintains conversation context within a session
- Examples users might ask:
  - "Why did traffic drop on Tuesday?"
  - "What's my best performing blog post and why?"
  - "Should I invest more in paid ads or SEO?"
  - "How do I improve my conversion rate?"

#### 4.3 Automatic Daily Insights (Optional)
- User can opt-in to receive daily digest
- System picks the most relevant insight based on recent data changes
- Delivered via email or in-app notification
- Always includes 1-3 action items
- Learns from user engagement (which insights they act on)

### 5. LLM Context Strategy

**Approach**: Intelligent data fetching (mid-tier option)

**How it works**:
1. User asks question or triggers report
2. LLM analyzes request and determines required data
3. System makes specific GA4 API calls via function calling
4. LLM receives only relevant data in structured format
5. LLM generates insight with action items
6. Response formatted and displayed to user

**Benefits**:
- Doesn't overwhelm context window with unnecessary data
- More accurate responses with targeted data
- Faster than fetching everything upfront
- Naturally extensible to agentic behavior later

**Data Structures for LLM**:
```typescript
// Structured format for passing GA data to LLM
interface AnalyticsContext {
  propertyInfo: {
    name: string;
    url: string;
    industry?: string;
  };
  dateRange: {
    start: string;
    end: string;
    comparisonStart?: string;
    comparisonEnd?: string;
  };
  metrics: {
    users: number;
    sessions: number;
    bounceRate: number;
    avgSessionDuration: number;
    conversions?: number;
    // ... comparison values
  };
  topPages?: Array<{page: string; views: number; bounceRate: number}>;
  trafficSources?: Array<{source: string; users: number; conversions: number}>;
  // Additional data as needed
}
```

**Available Functions for LLM**:
- `getTrafficMetrics(propertyId, dateRange)` - Core traffic numbers
- `getTopPages(propertyId, dateRange, limit)` - Page performance
- `getTrafficSources(propertyId, dateRange)` - Channel breakdown
- `getConversionFunnel(propertyId, funnelSteps)` - Funnel analysis
- `getUserBehavior(propertyId, dateRange)` - Device, location, time patterns
- `getHistoricalTrend(propertyId, metric, days)` - Long-term trends
- `compareProperties(propertyIds, metric, dateRange)` - Multi-property comparison

---

## Technical Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (hosted on Supabase or similar)
- **Analytics**: Google Analytics 4 Data API v1
- **LLM**: 
  - Development: Local Llama 3.2 (3B or 8B model) via Ollama
  - Production: TBD (OpenAI GPT-4, Anthropic Claude, or hosted Llama)
  - Fallback: OpenAI/Anthropic for testing if local inference too slow
- **Auth**: OAuth 2.0 for Google Analytics access, JWT for session management
- **Deployment**: Docker, AWS (ECS/EC2) or Vercel (frontend) + Railway/Render (backend)
- **Caching**: Redis for GA data and rate limiting

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Dashboard  │  │   Reports    │  │  Chat Interface│     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS/REST API
┌───────────────────────────▼─────────────────────────────────┐
│                      Backend (Express)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Auth Service│  │  GA Service  │  │  LLM Service │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼────────┐   │
│  │           PostgreSQL (Users, Properties, Cache)      │   │
│  └───────────────────────────────────────────────────────┘  │
└─────┬─────────────────────┬─────────────────────┬───────────┘
      │                     │                     │
      │ OAuth 2.0           │ GA4 API             │ LLM API
      │                     │                     │
┌─────▼─────┐         ┌─────▼─────┐        ┌─────▼─────┐
│  Google   │         │  Google   │        │  Ollama/  │
│  OAuth    │         │  Analytics│        │  OpenAI   │
└───────────┘         └───────────┘        └───────────┘
```

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- NULL if OAuth only
  google_refresh_token TEXT, -- Encrypted
  google_access_token TEXT, -- Encrypted
  token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  subscription_tier VARCHAR(50) DEFAULT 'free',
  daily_digest_enabled BOOLEAN DEFAULT false
);

-- GA Properties
CREATE TABLE ga_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  property_id VARCHAR(255) NOT NULL, -- GA4 property ID
  property_name VARCHAR(255),
  website_url VARCHAR(500),
  connected_at TIMESTAMP DEFAULT NOW(),
  last_synced_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, property_id)
);

-- Generated Insights/Reports
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES ga_properties(id) ON DELETE CASCADE,
  insight_type VARCHAR(100) NOT NULL, -- 'traffic_health', 'conversion_funnel', etc.
  title VARCHAR(500),
  content TEXT NOT NULL, -- JSON or markdown
  action_items JSONB, -- Array of action items
  date_range_start DATE,
  date_range_end DATE,
  generated_at TIMESTAMP DEFAULT NOW(),
  user_viewed BOOLEAN DEFAULT false,
  user_rating INTEGER -- 1-5 stars for feedback
);

-- Conversation History
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES ga_properties(id) ON DELETE CASCADE,
  messages JSONB NOT NULL, -- Array of {role, content, timestamp}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Analytics Cache (for frequently accessed data)
CREATE TABLE analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES ga_properties(id) ON DELETE CASCADE,
  cache_key VARCHAR(255) NOT NULL, -- e.g., 'traffic_metrics_2024-01-15_2024-01-22'
  data JSONB NOT NULL,
  cached_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  UNIQUE(property_id, cache_key)
);

-- Usage Tracking (for rate limiting and billing)
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint VARCHAR(255),
  ga_api_calls INTEGER DEFAULT 0,
  llm_tokens_used INTEGER DEFAULT 0,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ga_properties_user ON ga_properties(user_id);
CREATE INDEX idx_insights_property ON insights(property_id);
CREATE INDEX idx_insights_generated ON insights(generated_at DESC);
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_cache_property_key ON analytics_cache(property_id, cache_key);
CREATE INDEX idx_cache_expires ON analytics_cache(expires_at);
```

### API Endpoints

#### Authentication
```
POST   /api/auth/register              - Create new account
POST   /api/auth/login                 - Login with email/password
POST   /api/auth/logout                - Logout
GET    /api/auth/google                - Initiate Google OAuth flow
GET    /api/auth/google/callback       - OAuth callback handler
POST   /api/auth/refresh               - Refresh JWT token
GET    /api/auth/me                    - Get current user info
```

#### GA Properties
```
GET    /api/properties                 - List user's connected properties
POST   /api/properties/connect         - Initiate property connection (redirects to OAuth)
DELETE /api/properties/:id             - Disconnect property
GET    /api/properties/:id             - Get property details
GET    /api/properties/:id/metrics     - Get dashboard metrics
POST   /api/properties/compare         - Compare multiple properties
```

#### Analytics Data
```
GET    /api/analytics/:propertyId/traffic        - Traffic metrics
GET    /api/analytics/:propertyId/pages          - Top pages
GET    /api/analytics/:propertyId/sources        - Traffic sources
GET    /api/analytics/:propertyId/conversions    - Conversion data
GET    /api/analytics/:propertyId/behavior       - User behavior data
GET    /api/analytics/:propertyId/funnel         - Conversion funnel
```

#### Insights & Reports
```
GET    /api/insights/:propertyId                      - Get all insights for property
POST   /api/insights/:propertyId/generate             - Generate specific report type
GET    /api/insights/:id                              - Get single insight
POST   /api/insights/:id/rate                         - Rate an insight (feedback)
DELETE /api/insights/:id                              - Delete insight

# Preset report generation
POST   /api/insights/:propertyId/traffic-health       - Generate traffic health report
POST   /api/insights/:propertyId/conversion-funnel    - Generate funnel analysis
POST   /api/insights/:propertyId/content-performance  - Generate content review
POST   /api/insights/:propertyId/traffic-sources      - Generate source optimization
POST   /api/insights/:propertyId/user-behavior        - Generate behavior insights
```

#### Chat/Query Interface
```
POST   /api/chat/:propertyId/query     - Ask natural language question
GET    /api/chat/:propertyId/history   - Get conversation history
DELETE /api/chat/:propertyId/history   - Clear conversation history
POST   /api/chat/:propertyId/new       - Start new conversation
```

#### User Settings
```
GET    /api/settings                   - Get user settings
PATCH  /api/settings                   - Update settings
POST   /api/settings/daily-digest      - Toggle daily digest
```

### Google Analytics 4 Integration

#### OAuth Flow
1. User clicks "Connect Google Analytics"
2. Backend redirects to Google OAuth consent screen
3. User grants permissions for GA4 read access
4. Google redirects back with authorization code
5. Backend exchanges code for access + refresh tokens
6. Tokens encrypted and stored in database
7. Write comprehensive documentation
8. Test: Daily digests work, all features polished and production-ready

**Deliverables**:
- Daily digest emails sent automatically
- Users can manage settings and preferences
- Property comparison functionality
- All major bugs fixed
- App ready for beta testing

### Phase 6: Deployment & Testing (Week 11-12)
**Goal**: Deploy to production and conduct user testing

**Tasks**:
1. Set up production environment (AWS/Vercel/Railway)
2. Configure production database and Redis
3. Set up CI/CD pipeline
4. Implement monitoring and logging (e.g., Sentry, DataDog)
5. Deploy backend and frontend
6. Conduct end-to-end testing in production
7. Invite beta users and gather feedback
8. Iterate based on feedback

**Deliverables**:
- App deployed and accessible
- Monitoring and alerts configured
- Beta users testing the platform
- Initial feedback collected

---

## Caching Strategy (Detailed)

### Cache Layers

**Layer 1: Redis (Hot Cache)**
- Frequently accessed data
- Short TTLs (5 minutes - 1 hour)
- Examples: Dashboard metrics, current day data, user sessions

**Layer 2: PostgreSQL (Warm Cache)**
- Historical data and completed date ranges
- Longer TTLs (24 hours - 7 days)
- Examples: Last week's data, generated insights, conversation history

**Layer 3: Google Analytics (Cold/Source)**
- Original data source
- Only fetched when cache miss or data expired

### Cache Keys Structure
```typescript
// Format: {resourceType}:{propertyId}:{specifics}:{dateRange}
'traffic_metrics:GA-123456789:7d:2024-01-15_2024-01-22'
'top_pages:GA-123456789:limit=10:2024-01-15_2024-01-22'
'traffic_sources:GA-123456789:2024-01-15_2024-01-22'
```

### Cache Invalidation Rules
1. **Completed Date Ranges**: Never invalidate (data won't change)
2. **Current Day**: Invalidate every hour
3. **Yesterday**: Invalidate once when day rolls over
4. **User-Triggered Refresh**: Clear specific cache and fetch fresh
5. **Property Disconnect**: Clear all caches for that property

### Cache Implementation Example
```typescript
class CacheService {
  private redis: RedisClient;
  private db: PostgreSQLClient;
  
  async get(key: string): Promise<any | null> {
    // Try Redis first
    const cached = await this.redis.get(key);
    if (cached) return JSON.parse(cached);
    
    // Try PostgreSQL cache table
    const dbCached = await this.db.query(
      'SELECT data FROM analytics_cache WHERE cache_key = $1 AND expires_at > NOW()',
      [key]
    );
    if (dbCached.rows.length > 0) {
      // Store in Redis for faster next access
      await this.redis.setex(key, 3600, JSON.stringify(dbCached.rows[0].data));
      return dbCached.rows[0].data;
    }
    
    return null;
  }
  
  async set(key: string, data: any, ttl: number): Promise<void> {
    // Store in Redis
    await this.redis.setex(key, ttl, JSON.stringify(data));
    
    // If TTL > 1 hour, also store in PostgreSQL
    if (ttl > 3600) {
      await this.db.query(
        'INSERT INTO analytics_cache (cache_key, data, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'$3 seconds\') ON CONFLICT (cache_key) DO UPDATE SET data = $2, cached_at = NOW(), expires_at = NOW() + INTERVAL \'$3 seconds\'',
        [key, data, ttl]
      );
    }
  }
  
  async invalidate(pattern: string): Promise<void> {
    // Clear from Redis
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
    
    // Clear from PostgreSQL
    await this.db.query(
      'DELETE FROM analytics_cache WHERE cache_key LIKE $1',
      [pattern.replace('*', '%')]
    );
  }
}
```

---

## Rate Limiting Strategy

### Limits by Resource

**GA4 API Limits**:
- Free tier: 500 requests/day per property
- Track per property, not per user
- Warn users at 80% capacity
- Queue non-urgent requests

**LLM API Limits**:
- Development (local): No limits, only hardware constraints
- Production (OpenAI): Track tokens per user/day
- Free tier: 10 reports/day, 50 chat messages/day
- Paid tier: Unlimited

**Application API Limits**:
- Anonymous: 10 requests/hour
- Authenticated: 100 requests/hour
- Premium: 1000 requests/hour

### Rate Limiter Implementation
```typescript
import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per hour
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for resource-intensive operations
export const insightGenerationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // 10 reports per day for free tier
  message: 'Daily report limit reached. Upgrade to premium for unlimited reports.',
  keyGenerator: (req) => req.user.id, // Per user
});

// Custom GA4 rate limiter
export class GA4RateLimiter {
  private redis: RedisClient;
  
  async checkLimit(propertyId: string): Promise<boolean> {
    const key = `ga4_calls:${propertyId}:${new Date().toISOString().split('T')[0]}`;
    const calls = await this.redis.incr(key);
    
    if (calls === 1) {
      // First call of the day, set expiry
      await this.redis.expire(key, 86400); // 24 hours
    }
    
    if (calls > 500) {
      return false; // Limit exceeded
    }
    
    if (calls > 400) {
      // Approaching limit, log warning
      console.warn(`Property ${propertyId} has made ${calls}/500 GA4 API calls today`);
    }
    
    return true;
  }
}
```

---

## Testing Strategy

### Unit Tests
**Coverage Target**: >80% for business logic

**Key Areas**:
- Authentication logic (password hashing, JWT generation)
- Data transformation functions (GA4 response parsing)
- Prompt template generation
- Cache key generation
- Encryption/decryption utilities

**Tools**: Jest, ts-jest

**Example**:
```typescript
describe('GA4 Service', () => {
  describe('parseTrafficMetrics', () => {
    it('should correctly parse GA4 API response', () => {
      const mockResponse = {
        rows: [
          { metricValues: [{ value: '1234' }, { value: '5678' }] }
        ]
      };
      
      const result = ga4Service.parseTrafficMetrics(mockResponse);
      
      expect(result.users).toBe(1234);
      expect(result.sessions).toBe(5678);
    });
  });
});
```

### Integration Tests
**Coverage**: All API endpoints

**Key Scenarios**:
- Complete OAuth flow (mocked Google APIs)
- Fetching GA4 data and returning to client
- Generating insights with LLM
- Cache hit/miss scenarios
- Rate limiting behavior

**Tools**: Jest, Supertest, Testcontainers (for PostgreSQL)

**Example**:
```typescript
describe('POST /api/insights/:propertyId/traffic-health', () => {
  it('should generate traffic health report', async () => {
    const response = await request(app)
      .post('/api/insights/test-property-id/traffic-health')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ dateRange: { start: '2024-01-01', end: '2024-01-07' } });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('title');
    expect(response.body).toHaveProperty('content');
    expect(response.body).toHaveProperty('actionItems');
    expect(response.body.actionItems.length).toBeGreaterThan(0);
  });
});
```

### End-to-End Tests
**Coverage**: Critical user flows

**Flows to Test**:
1. User registration → GA connection → View dashboard
2. Generate traffic health report → View insights → Rate report
3. Ask natural language question → Get response → Ask follow-up
4. Connect multiple properties → Switch between them → Compare data
5. Enable daily digest → Receive email (check email queue)

**Tools**: Playwright or Cypress

**Example**:
```typescript
test('complete onboarding flow', async ({ page }) => {
  // Register
  await page.goto('/register');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');
  
  // Connect GA property
  await expect(page).toHaveURL('/properties');
  await page.click('text=Connect Google Analytics');
  // Mock OAuth flow...
  
  // View dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Total Users')).toBeVisible();
});
```

### Manual Testing Checklist
- [ ] All forms validate inputs correctly
- [ ] Error messages are user-friendly
- [ ] Loading states show appropriate spinners
- [ ] Charts render correctly on all screen sizes
- [ ] OAuth flow works with real Google account
- [ ] Generated insights make sense and are actionable
- [ ] Chat interface maintains context properly
- [ ] Email notifications arrive and format correctly
- [ ] App works on mobile devices
- [ ] All links and buttons function as expected

---

## Monitoring & Observability

### Key Metrics to Track

**Application Health**:
- Response times (p50, p95, p99)
- Error rates by endpoint
- Request volume
- Active users
- Database connection pool utilization

**Business Metrics**:
- Daily active users (DAU)
- Properties connected per user
- Insights generated per day
- Chat messages per day
- User retention (Day 1, Day 7, Day 30)
- Report ratings (satisfaction score)

**Cost Metrics**:
- GA4 API calls per day
- LLM tokens consumed per day
- AWS/hosting costs
- Cost per user per month

**Performance Metrics**:
- Cache hit rate
- Average insight generation time
- Database query performance
- LLM response latency

### Logging Strategy

**Log Levels**:
- ERROR: All errors, with full stack traces and context
- WARN: Rate limit approaching, slow queries, retries
- INFO: User actions (login, property connected, insight generated)
- DEBUG: Detailed flow information (development only)

**Structured Logging Format**:
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "service": "backend",
  "userId": "uuid",
  "propertyId": "GA-123456789",
  "action": "insight_generated",
  "insightType": "traffic_health",
  "duration_ms": 3421,
  "ga4_calls": 3,
  "llm_tokens": 1543
}
```

**Sensitive Data Handling**:
- Never log passwords, tokens, or API keys
- Redact email addresses in production logs
- Hash user IDs for GDPR compliance in analytics

### Error Tracking

**Tool**: Sentry or similar

**What to Track**:
- All unhandled exceptions
- Failed API calls (GA4, LLM)
- Database errors
- Authentication failures
- Rate limit exceeded events

**Error Context**:
```typescript
Sentry.captureException(error, {
  user: { id: userId, email: userEmail },
  tags: {
    propertyId,
    endpoint: req.path,
    insightType,
  },
  extra: {
    requestBody: req.body,
    gaApiCalls: apiCallCount,
  },
});
```

### Alerts to Configure

**Critical (Page immediately)**:
- Server down (health check fails)
- Database connection lost
- Error rate > 5%
- GA4 API quota exceeded

**Warning (Slack notification)**:
- Response time p95 > 2 seconds
- Cache hit rate < 70%
- Daily digest email failures
- LLM error rate > 1%

**Info (Email digest)**:
- Daily user activity summary
- Cost trends
- Performance trends

---

## Security Checklist

### Authentication & Authorization
- [ ] Passwords hashed with bcrypt (salt rounds >= 10)
- [ ] JWT tokens with short expiry (15 minutes access, 7 days refresh)
- [ ] Refresh tokens stored securely and rotated
- [ ] OAuth tokens encrypted at rest (AES-256-GCM)
- [ ] CSRF protection on state-changing requests
- [ ] Rate limiting on login attempts (max 5 per 15 minutes)
- [ ] Email verification for new accounts (optional but recommended)
- [ ] Password reset flow with expiring tokens

### API Security
- [ ] All inputs validated and sanitized
- [ ] SQL injection protection (parameterized queries only)
- [ ] XSS protection (React handles most, but validate user-generated content)
- [ ] CORS configured with whitelist (not wildcard in production)
- [ ] Rate limiting on all public endpoints
- [ ] API keys never exposed to frontend
- [ ] Helmet.js configured for security headers

### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] TLS/HTTPS enforced in production
- [ ] Database credentials in environment variables
- [ ] Regular database backups
- [ ] Soft delete for user accounts (retain data for recovery)
- [ ] GDPR compliance: user data export and deletion

### Infrastructure Security
- [ ] Principle of least privilege for database users
- [ ] Firewall rules restrict access to databases
- [ ] Secrets management (AWS Secrets Manager, Vault, etc.)
- [ ] Regular dependency updates (npm audit)
- [ ] Container image scanning for vulnerabilities
- [ ] DDoS protection (CloudFlare, AWS Shield)

### Code Security
- [ ] No hardcoded secrets or API keys
- [ ] Environment variables for all configuration
- [ ] .env files in .gitignore
- [ ] Code review for all changes
- [ ] Static analysis tools (ESLint security plugins)
- [ ] Regular penetration testing (after MVP)

---

## Environment Variables

### Backend (.env)
```bash
# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ga_insights
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Google OAuth & Analytics
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# Encryption
ENCRYPTION_KEY=your-32-byte-hex-encryption-key-for-tokens

# LLM
# Development (Local Ollama)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b

# Production (OpenAI/Anthropic - choose one)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
# OR
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Email (for daily digest)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
FROM_EMAIL=noreply@yourapp.com

# Monitoring
SENTRY_DSN=your-sentry-dsn

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3001/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## Deployment Guide

### Docker Setup

**docker-compose.yml** (Development):
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ga_insights
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/ga_insights
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3001/api
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

### Production Deployment (AWS Example)

**Architecture**:
```
Route 53 (DNS)
    ↓
CloudFront (CDN) → S3 (Frontend static files)
    ↓
ALB (Load Balancer)
    ↓
ECS Fargate (Backend containers)
    ↓
RDS PostgreSQL + ElastiCache Redis
```

**Steps**:
1. Build Docker images and push to ECR
2. Set up RDS PostgreSQL and ElastiCache Redis
3. Create ECS cluster and task definitions
4. Configure ALB with health checks
5. Deploy backend to ECS Fargate
6. Build frontend and upload to S3
7. Configure CloudFront distribution
8. Set up Route 53 DNS records
9. Configure SSL certificates (AWS ACM)
10. Set up CloudWatch alarms

### Alternative: Simplified Deployment

**Option 1: Vercel (Frontend) + Railway/Render (Backend)**
- Deploy frontend to Vercel (git push auto-deploy)
- Deploy backend to Railway or Render
- Use managed PostgreSQL and Redis from Railway/Render
- Simpler but potentially more expensive at scale

**Option 2: Single VPS (DigitalOcean, Linode)**
- Install Docker and docker-compose on VPS
- Use Nginx as reverse proxy
- SSL with Let's Encrypt
- Cheapest option for MVP
- Harder to scale later

---

## Success Metrics & KPIs

### Launch Goals (First 3 Months)

**User Acquisition**:
- Target: 100 beta users
- Metric: Signups per week
- Goal: 8-10 signups/week

**Engagement**:
- Target: 60% weekly active users (WAU/signups)
- Metric: Users who generate at least one insight per week
- Goal: Average 3 insights per user per week

**Quality**:
- Target: 4+ star average rating on insights
- Metric: User ratings on generated reports
- Goal: >70% of reports rated 4 or 5 stars

**Retention**:
- Target: 50% Day 7 retention
- Metric: Users who return after 7 days
- Goal: 70% Day 30 retention

**Technical Performance**:
- Target: <2s average insight generation time
- Metric: Time from request to display
- Goal: 95% uptime

### Growth Metrics (6-12 Months)

- 1000+ active users
- 10+ properties per user (power users)
- 50% month-over-month growth
- <5% churn rate
- Net Promoter Score (NPS) > 40

---

## Future Enhancements (Post-MVP)

### Phase 7+: Advanced Features

**A/B Testing Integration**:
- Connect to Google Optimize or similar
- LLM analyzes A/B test results
- Recommends winners and next tests

**Predictive Analytics**:
- Forecast traffic trends
- Predict conversion rate changes
- Alert on anomalies before they happen

**Competitor Analysis**:
- Compare metrics to industry benchmarks
- Identify gaps and opportunities
- Source data from SimilarWeb API or similar

**Custom Goals & Alerts**:
- User-defined KPIs
- Custom alert thresholds
- Slack/Discord webhook integrations

**Team Collaboration**:
- Multi-user accounts
- Shared insights and comments
- Role-based permissions

**White-Label Option**:
- Agencies can brand for clients
- Multi-tenant architecture
- Custom domains

**Mobile App**:
- React Native or Flutter
- Push notifications for alerts
- Quick insight generation on-the-go

**Advanced Visualizations**:
- Interactive dashboards
- Custom report builder
- Data export (CSV, PDF)

---

## Pricing Strategy (Future Consideration)

### Tier Structure

**Free Tier**:
- 1 GA property
- 5 insights per month
- 25 chat messages per month
- Community support

**Pro Tier** ($29/month):
- 5 GA properties
- Unlimited insights
- Unlimited chat messages
- Daily digest emails
- Priority support
- Property comparison

**Agency Tier** ($99/month):
- Unlimited properties
- White-label option
- Team collaboration (5 users)
- API access
- Custom integrations
- Dedicated support

**Enterprise** (Custom):
- Custom deployment
- SLA guarantees
- Custom features
- Training & onboarding

---

## Documentation Requirements

### For Development Team

1. **Setup Guide**: Getting local environment running
2. **Architecture Overview**: System design and data flows
3. **API Documentation**: All endpoints with examples
4. **Database Schema**: ERD and table descriptions
5. **LLM Prompt Library**: All prompt templates with examples
6. **Deployment Guide**: Step-by-step production deployment
7. **Troubleshooting**: Common issues and solutions

### For Users

1. **Getting Started Guide**: Account setup and first insight
2. **GA Connection Guide**: How to connect Google Analytics
3. **Feature Tutorials**: How to use each major feature
4. **FAQ**: Common questions and answers
5. **Best Practices**: How to get the most value from the platform

### For API Consumers (Future)

1. **API Reference**: Complete endpoint documentation
2. **Authentication Guide**: How to get and use API keys
3. **Rate Limits**: Usage limits and best practices
4. **Examples**: Code samples in multiple languages

---

## Risk Management

### Technical Risks

**Risk**: GA4 API rate limits hit too frequently
**Mitigation**: Aggressive caching, queue non-urgent requests, upgrade to paid tier if needed

**Risk**: LLM costs spiral out of control
**Mitigation**: Set per-user token limits, use cheaper models for simple tasks, cache common queries

**Risk**: Local Llama too slow for good UX
**Mitigation**: Have OpenAI fallback ready, budget for hosted inference

**Risk**: Database performance degrades with scale
**Mitigation**: Index optimization, query optimization, read replicas if needed

### Business Risks

**Risk**: Users don't find insights valuable
**Mitigation**: User testing, iterate on prompt engineering, collect feedback early

**Risk**: GA4 API terms of service violations
**Mitigation**: Read ToS carefully, consult legal if needed, stay within usage limits

**Risk**: Competition from larger players
**Mitigation**: Focus on ease of use for small businesses, fast iteration, niche down if needed

### Security Risks

**Risk**: OAuth token theft
**Mitigation**: Encryption at rest, short-lived access tokens, regular security audits

**Risk**: Prompt injection attacks
**Mitigation**: Input sanitization, separate system and user prompts, rate limiting

**Risk**: Data breach
**Mitigation**: Encryption, regular backups, incident response plan, insurance

---

## Open Questions & Decisions Needed

1. **LLM Choice for Production**: OpenAI, Anthropic, or hosted Llama?
   - Decision factors: Cost, quality, latency, function calling support
   - Recommendation: Start with OpenAI GPT-4o-mini, evaluate after 1 month

2. **Hosting Provider**: AWS, GCP, or simplified platforms?
   - Decision factors: Cost, complexity, scalability needs
   - Recommendation: Railway/Render for MVP, migrate to AWS if needed

3. **Pricing Launch**: Launch with free tier only, or paid tiers from day 1?
   - Recommendation: Free tier for first 3 months, introduce paid tiers after validation

4. **Email Provider**: SendGrid, Mailgun, or Amazon SES?
   - Recommendation: SendGrid free tier (100 emails/day) for MVP

5. **Analytics Provider**: Self-hosted analytics or use external (Mixpanel, Amplitude)?
   - Recommendation: Start with basic database logging, add Mixpanel if needed

---

## Success Criteria for MVP

### Must Have (Launch Blockers)
- [ ] Users can create accounts and login securely
- [ ] Users can connect at least one GA4 property
- [ ] Dashboard displays accurate GA metrics
- [ ] All 5 preset report types generate useful insights
- [ ] Chat interface answers basic questions accurately
- [ ] Error handling prevents crashes and shows user-friendly messages
- [ ] App is deployed and accessible via URL
- [ ] Data is cached to reduce API calls
- [ ] Security best practices implemented (encryption, rate limiting)

### Should Have (Post-Launch Priority)
- [ ] Daily digest emails working
- [ ] Property comparison feature
- [ ] User feedback/rating system
- [ ] Mobile responsive design perfected
- [ ] Monitoring and alerts configured
- [ ] Documentation complete

### Nice to Have (Future Iterations)
- [ ] A/B testing integration
- [ ] Competitor benchmarking
- [ ] Custom alerts
- [ ] Team collaboration features
- [ ] Mobile app

---

## Conclusion

This specification provides a complete blueprint for building an AI-powered Google Analytics insights platform. The phased approach allows for iterative development, with each phase building on the previous one.

**Key Success Factors**:
1. **User-Centric Design**: Focus on small business needs
2. **Actionable Insights**: Every insight must include concrete next steps
3. **Performance**: Fast responses and reliable uptime
4. **Cost Management**: Balance quality with sustainable costs
5. **Iteration**: Learn from user feedback and improve continuously

**Next Steps**:
1. Review and validate this spec with stakeholders
2. Set up development environment (Phase 1)
3. Begin implementation following the phase breakdown
4. Conduct weekly progress reviews and adjust as needed

Good luck building! 🚀 Backend fetches user's GA4 properties
8. User selects which property to connect

#### Required OAuth Scopes
```
https://www.googleapis.com/auth/analytics.readonly
```

#### GA4 Data API Integration

**Key Concepts**:
- GA4 uses "dimensions" (attributes like page, source) and "metrics" (numbers like users, sessions)
- Data is queried via runReport API with date ranges and dimension/metric combinations
- Responses can be large - implement pagination and caching
- Rate limits: 500 requests per day per property (free tier)

**Example API Call** (using @google-analytics/data):
```typescript
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: 'service-account@project.iam.gserviceaccount.com',
    private_key: process.env.GA_PRIVATE_KEY,
  },
});

async function getTrafficMetrics(propertyId: string, startDate: string, endDate: string) {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
    ],
  });
  
  return response;
}
```

**Caching Strategy**:
- Cache completed date ranges aggressively (e.g., last week's data won't change)
- Cache current day data for 1 hour
- Cache frequently accessed queries (dashboard metrics) for 30 minutes
- Use Redis for fast cache access
- Implement cache invalidation when user manually refreshes

**Rate Limiting**:
- Track API calls per property per day
- Warn users approaching limits
- Implement exponential backoff for retries
- Queue non-urgent requests during high usage

### LLM Integration

#### Development Setup (Local Llama)

**Installation**:
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull Llama 3.2 model
ollama pull llama3.2:3b  # or llama3.2:8b for better quality
```

**Integration**:
```typescript
import Ollama from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' });

async function generateInsight(prompt: string, context: AnalyticsContext) {
  const response = await ollama.chat({
    model: 'llama3.2:3b',
    messages: [
      {
        role: 'system',
        content: 'You are an analytics expert helping small businesses understand their Google Analytics data and take action.'
      },
      {
        role: 'user',
        content: `${prompt}\n\nAnalytics Data:\n${JSON.stringify(context, null, 2)}`
      }
    ],
    stream: false,
  });
  
  return response.message.content;
}
```

**Function Calling** (for intelligent data fetching):
```typescript
// Define available functions
const tools = [
  {
    type: 'function',
    function: {
      name: 'getTrafficMetrics',
      description: 'Get traffic metrics for a date range',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
          endDate: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        },
        required: ['startDate', 'endDate'],
      },
    },
  },
  // ... more functions
];

// LLM decides which functions to call
// Execute those functions
// Pass results back to LLM for final answer
```

**Note**: Llama 3.2 function calling may be limited. Consider fallback to OpenAI/Anthropic for this feature during development.

#### Production Options

**Option A: Hosted Llama (Cost-effective)**
- Use Groq, Together.ai, or Replicate for fast Llama inference
- Significantly cheaper than OpenAI/Anthropic
- May have quality trade-offs

**Option B: OpenAI/Anthropic (Highest Quality)**
- OpenAI GPT-4o or Anthropic Claude Sonnet
- Best function calling support
- More expensive but better results
- Easier to implement

**Option C: Hybrid**
- Use GPT-4o/Claude for complex queries and function calling
- Use Llama for simple preset reports
- Best cost/quality balance

**Recommendation**: Start with OpenAI GPT-4o-mini for development (cheap, good function calling), evaluate quality, then decide on production approach.

#### Prompt Engineering

**System Prompt Template**:
```
You are an analytics expert assistant helping small business owners understand their Google Analytics data and take actionable steps to improve their websites.

Your communication style:
- Clear and concise, avoiding jargon
- Always provide 2-5 specific, actionable recommendations
- Explain WHY something is happening, not just WHAT
- Include estimated impact when possible (e.g., "could increase conversions by ~15%")
- Be encouraging and supportive

When analyzing data:
- Look for significant changes (>20% shifts)
- Compare to industry benchmarks when relevant
- Identify quick wins vs long-term strategies
- Prioritize recommendations by potential impact

Data context:
{context}

User question: {question}
```

**Example Report Template** (Traffic Health Check):
```
Analyze the following GA4 data and create a traffic health check report:

1. Identify any significant changes in traffic (>20% increase or decrease)
2. Explain likely causes for these changes
3. Flag any concerning trends or anomalies
4. Provide 3-5 specific action items prioritized by impact

Format your response as:
## Traffic Health Summary
[Overall assessment in 2-3 sentences]

## Key Findings
- [Finding 1 with data]
- [Finding 2 with data]
- [Finding 3 with data]

## Recommended Actions
1. [Action item with expected impact]
2. [Action item with expected impact]
3. [Action item with expected impact]

Data:
{analytics_data}
```

### Frontend Architecture

#### Component Structure
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── GoogleOAuthButton.tsx
│   ├── dashboard/
│   │   ├── MetricsOverview.tsx      # Key metrics cards
│   │   ├── TrafficChart.tsx         # Line chart
│   │   ├── TopPages.tsx             # Table
│   │   ├── TrafficSources.tsx       # Pie chart
│   │   └── PropertySelector.tsx     # Dropdown
│   ├── insights/
│   │   ├── InsightCard.tsx          # Single insight display
│   │   ├── InsightsList.tsx         # All insights
│   │   ├── ReportGenerator.tsx      # Preset report buttons
│   │   └── ActionItems.tsx          # Action item checklist
│   ├── chat/
│   │   ├── ChatInterface.tsx        # Main chat UI
│   │   ├── MessageList.tsx          # Conversation history
│   │   ├── MessageInput.tsx         # Input box
│   │   └── SuggestedQuestions.tsx   # Quick buttons
│   ├── properties/
│   │   ├── PropertyList.tsx
│   │   ├── PropertyCard.tsx
│   │   └── ConnectPropertyButton.tsx
│   └── common/
│       ├── LoadingSpinner.tsx
│       ├── ErrorMessage.tsx
│       └── DateRangePicker.tsx
├── pages/
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Insights.tsx
│   ├── Chat.tsx
│   ├── Properties.tsx
│   └── Settings.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useProperties.ts
│   ├── useAnalytics.ts
│   └── useInsights.ts
├── services/
│   ├── api.ts                       # Axios instance
│   ├── authService.ts
│   ├── propertiesService.ts
│   ├── analyticsService.ts
│   └── insightsService.ts
├── types/
│   ├── user.ts
│   ├── property.ts
│   ├── analytics.ts
│   └── insight.ts
├── utils/
│   ├── formatters.ts                # Number/date formatting
│   ├── validators.ts
│   └── constants.ts
└── App.tsx
```

#### State Management
- Use React Context + useReducer for global state (auth, selected property)
- React Query (TanStack Query) for server state (API data fetching, caching)
- Local state for component-specific UI state

#### Key User Flows

**Flow 1: New User Onboarding**
1. User lands on homepage → Sign up
2. Create account → Email verification (optional)
3. Redirect to "Connect Google Analytics" page
4. Click "Connect" → OAuth flow → Select GA4 property
5. Land on dashboard with first property connected
6. See guided tour pointing to: Dashboard, Generate Report, Ask Question

**Flow 2: Generate Preset Report**
1. User selects property from dropdown
2. Navigate to "Insights" page
3. Click "Generate Traffic Health Check" button
4. Loading state (show progress: "Fetching data... Analyzing... Generating report...")
5. Report appears with: Summary, Findings, Action Items
6. User can rate report (thumbs up/down)
7. Action items have checkboxes to mark complete

**Flow 3: Natural Language Query**
1. User selects property
2. Navigate to "Chat" page
3. See suggested questions or type their own
4. Click send → Loading state
5. LLM response appears with relevant data visualizations
6. User can ask follow-up questions
7. Conversation context maintained

**Flow 4: Daily Digest**
1. User enables daily digest in settings
2. Each morning, system picks most relevant insight
3. Email sent with summary + link to full report
4. User clicks link → Lands on specific insight page

### Backend Architecture

#### Service Layer Structure
```
src/
├── routes/
│   ├── auth.routes.ts
│   ├── properties.routes.ts
│   ├── analytics.routes.ts
│   ├── insights.routes.ts
│   ├── chat.routes.ts
│   └── settings.routes.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── properties.controller.ts
│   ├── analytics.controller.ts
│   ├── insights.controller.ts
│   └── chat.controller.ts
├── services/
│   ├── auth.service.ts
│   ├── ga4.service.ts               # Google Analytics API
│   ├── llm.service.ts               # LLM integration
│   ├── insights.service.ts          # Report generation logic
│   ├── cache.service.ts             # Redis caching
│   └── email.service.ts             # Email notifications
├── middleware/
│   ├── auth.middleware.ts           # JWT validation
│   ├── rateLimiter.middleware.ts    # Rate limiting
│   └── errorHandler.middleware.ts   # Global error handler
├── models/
│   ├── user.model.ts
│   ├── property.model.ts
│   ├── insight.model.ts
│   └── conversation.model.ts
├── types/
│   ├── express.d.ts                 # Extended Express types
│   ├── ga4.types.ts
│   └── llm.types.ts
├── utils/
│   ├── encryption.ts                # Token encryption
│   ├── validators.ts
│   ├── logger.ts
│   └── errors.ts
├── config/
│   ├── database.ts
│   ├── oauth.ts
│   └── llm.ts
└── server.ts
```

#### Error Handling
- Use custom error classes (AuthError, GA4Error, LLMError)
- Global error handler middleware
- Proper HTTP status codes
- User-friendly error messages
- Detailed error logging (without exposing sensitive data)
- Retry logic for external API failures

#### Security Considerations
- Encrypt OAuth tokens before storing (AES-256)
- Use parameterized queries to prevent SQL injection
- Validate and sanitize all user inputs
- Implement rate limiting on all endpoints
- Use CORS with whitelist
- Store secrets in environment variables (never in code)
- Implement CSRF protection for state-changing operations
- Regular security audits of dependencies
