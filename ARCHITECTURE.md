# Architecture Documentation

## System Overview

The Sales Funnel Automation CRM is built as a modern web application with a React frontend and Supabase backend. The architecture follows a serverless pattern using Edge Functions for backend logic.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            React Application (Vite)                   │  │
│  │  - TypeScript                                         │  │
│  │  - Tailwind CSS                                       │  │
│  │  - React Hooks for state management                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Edge Functions)              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Categories │  │  Funnels   │  │   Steps    │  ...      │
│  │  Function  │  │  Function  │  │  Function  │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│       │                │                │                   │
│       └────────────────┴────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ PostgreSQL Protocol
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer (Supabase)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                      │  │
│  │  - Row Level Security (RLS)                          │  │
│  │  - Triggers & Functions                              │  │
│  │  - Relations & Constraints                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
App.tsx (Root)
├── CategoryManagement.tsx
│   ├── Category List
│   ├── Category Modal (Create/Edit)
│   └── Color Selector
│
└── FunnelBuilder.tsx
    ├── Funnel List
    │   ├── Category Filter
    │   └── Funnel Cards
    │
    ├── FunnelForm.tsx (Modal)
    │   ├── Basic Info
    │   ├── Category Selector
    │   └── Trigger Configuration
    │
    ├── FunnelTimeline.tsx
    │   ├── Step Cards
    │   ├── Add Step Button
    │   └── Timing Visualization
    │
    └── FunnelStepModal.tsx
        ├── Message Type Selector
        ├── Message Template Selector
        └── Delay Configuration
```

### Component Responsibilities

#### App.tsx
- Root component
- Tab navigation
- Layout structure

#### CategoryManagement.tsx
- Display all categories
- Create/edit/delete categories
- Color selection
- Category listing with filtering

#### FunnelBuilder.tsx
- Display all funnels
- Filter by category
- Funnel CRUD operations
- Load and cache funnel steps
- Coordinate child components

#### FunnelForm.tsx
- Funnel creation/editing form
- Trigger configuration
- Category assignment
- Timing setup (before/after)

#### FunnelTimeline.tsx
- Visual representation of funnel steps
- Step ordering
- Timing display
- Quick actions (edit, delete)

#### FunnelStepModal.tsx
- Step creation/editing
- Message template selection
- Delay configuration
- Message type (SMS/Email)

## Data Flow

### Read Operations (Example: Loading Funnels)

```
1. Component Mount
   └─> FunnelBuilder.useEffect()

2. API Call
   └─> funnelsApi.getAll()
       └─> fetch('/functions/v1/funnels')

3. Edge Function
   └─> funnels/index.ts
       └─> supabase.from('sales_funnels').select()
       └─> Load step counts
       └─> Return combined data

4. State Update
   └─> setFunnels(data)

5. Re-render
   └─> Display updated UI
```

### Write Operations (Example: Creating a Category)

```
1. User Action
   └─> Form submission

2. API Call
   └─> categoriesApi.create({ name, color, description })
       └─> fetch('/functions/v1/categories', { method: 'POST' })

3. Edge Function
   └─> categories/index.ts
       └─> Validate input
       └─> supabase.from('funnel_categories').insert()
       └─> Return created record

4. State Update
   └─> Reload categories
   └─> Close modal

5. Re-render
   └─> Display new category in list
```

## Edge Functions Architecture

### Function Structure

Each Edge Function follows this pattern:

```typescript
// 1. Import dependencies
import { createClient } from 'npm:@supabase/supabase-js@2';

// 2. Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

// 3. Main handler
Deno.serve(async (req: Request) => {
  // 4. Handle OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // 5. Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    // 6. Route by HTTP method
    if (req.method === 'GET') { /* ... */ }
    if (req.method === 'POST') { /* ... */ }
    if (req.method === 'PUT') { /* ... */ }
    if (req.method === 'DELETE') { /* ... */ }

    // 7. Success response
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // 8. Error handling
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
```

### Function Responsibilities

#### categories/index.ts
- CRUD operations for funnel categories
- Color validation
- Name uniqueness checking

#### funnels/index.ts
- CRUD operations for funnels
- Enriches data with step counts
- Handles category relationships

#### funnel-steps/index.ts
- CRUD operations for funnel steps
- Joins with message templates
- Maintains step ordering

#### messages/index.ts
- CRUD operations for message templates
- Category filtering
- Message type filtering

## Database Design

### Entity Relationship

```
funnel_categories
    │
    └─┐ (1:N)
      │
sales_funnels ─────┐
    │              │
    └─┐ (1:N)      │ (N:1)
      │            │
funnel_steps       │
    │              │
    └─┐ (N:1)      │
      │            │
message_templates──┘
```

### Key Design Decisions

#### UUID Primary Keys
- Better for distributed systems
- Prevents ID enumeration
- Safe for client-side generation

#### Timestamp Columns
- `created_at` - Record creation time
- `updated_at` - Last modification time
- Both use `timestamptz` for timezone awareness

#### Soft vs Hard Deletes
Currently using hard deletes. Consider soft deletes for:
- Audit trail requirements
- Data recovery needs
- Compliance requirements

#### Nullable Foreign Keys
- `category_id` is nullable in both funnels and messages
- Allows uncategorized items
- Prevents orphaned records on category delete

### Row Level Security (RLS)

#### Current Implementation (Development)

```sql
CREATE POLICY "Allow all operations"
  ON table_name
  FOR ALL
  TO public
  USING (true);
```

This allows unrestricted access for development.

#### Production Implementation (Required)

```sql
-- Add user_id column
ALTER TABLE sales_funnels ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Secure policies
CREATE POLICY "Users view own funnels"
  ON sales_funnels FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own funnels"
  ON sales_funnels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own funnels"
  ON sales_funnels FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own funnels"
  ON sales_funnels FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

## State Management

### Current Approach: Local Component State

Using React's `useState` and `useEffect` hooks:

**Pros:**
- Simple and straightforward
- No additional dependencies
- Easy to understand

**Cons:**
- State scattered across components
- Prop drilling for shared state
- No centralized cache

### Future Considerations

For scaling, consider:

1. **React Query / TanStack Query**
   - Automatic caching
   - Background refetching
   - Optimistic updates

2. **Zustand**
   - Lightweight global state
   - TypeScript support
   - Easy to use

3. **Redux Toolkit**
   - Comprehensive solution
   - DevTools support
   - More boilerplate

## API Client Design

Located in `src/lib/api.ts`, the API client provides:

### Benefits

1. **Centralized Configuration**
   - Single place for base URL
   - Consistent headers
   - Error handling

2. **Type Safety**
   - TypeScript return types
   - Parameter validation
   - IDE autocomplete

3. **Easy Testing**
   - Mock individual API methods
   - Swap implementations
   - Test error scenarios

### Structure

```typescript
// Base fetch wrapper
async function apiFetch(endpoint, options) {
  // Handles:
  // - URL construction
  // - Headers
  // - Error handling
  // - Response parsing
}

// Specific API groups
export const categoriesApi = {
  getAll: () => apiFetch('categories'),
  create: (data) => apiFetch('categories', { method: 'POST', body }),
  // ...
};
```

## Error Handling Strategy

### Frontend

1. **Try-Catch Blocks**
   - Wrap all async operations
   - Log errors to console
   - Show user-friendly messages

2. **User Feedback**
   - Alert dialogs for critical errors
   - Inline error messages for forms
   - Toast notifications (future)

### Backend (Edge Functions)

1. **Validation**
   - Check required parameters
   - Validate data types
   - Return 400 for bad requests

2. **Error Responses**
   - Consistent JSON format: `{ error: "message" }`
   - Appropriate HTTP status codes
   - Include CORS headers

3. **Logging**
   - Console.error for debugging
   - Future: Centralized logging service

## Performance Considerations

### Current Optimizations

1. **Lazy Loading**
   - Funnel steps loaded on demand
   - Modal components loaded when opened

2. **Conditional Rendering**
   - Hide/show instead of mount/unmount where appropriate
   - Reduce unnecessary re-renders

3. **Database Queries**
   - Select only needed columns
   - Use indexes on foreign keys
   - Batch operations where possible

### Future Optimizations

1. **Caching**
   - Implement React Query
   - Cache categories globally
   - Stale-while-revalidate pattern

2. **Pagination**
   - Limit funnels per page
   - Infinite scroll for lists
   - Virtual scrolling for large lists

3. **Code Splitting**
   - Route-based splitting
   - Component lazy loading
   - Tree shaking optimization

## Security Architecture

### Current State (Development)

- Public access to all data
- No authentication required
- Suitable for development only

### Production Requirements

1. **Authentication**
   - Implement Supabase Auth
   - Email/password or OAuth
   - Session management

2. **Authorization**
   - User-based RLS policies
   - Role-based access control (future)
   - API key management

3. **Data Protection**
   - Input sanitization
   - SQL injection prevention (handled by Supabase)
   - XSS protection (React handles)

4. **Secrets Management**
   - Environment variables for keys
   - Never commit secrets
   - Rotate keys regularly

## Deployment Architecture

### Current Setup

- Development: `npm run dev` (Vite dev server)
- Build: `npm run build` (Static files)
- Database: Supabase hosted
- Edge Functions: Supabase platform

### Production Deployment Options

1. **Static Hosting** (Recommended)
   - Netlify
   - Vercel
   - AWS S3 + CloudFront

2. **Requirements**
   - Serve static files from `dist/`
   - Configure environment variables
   - HTTPS only
   - CDN for performance

3. **CI/CD Pipeline**
   - Run on: Push to main
   - Steps:
     1. Install dependencies
     2. Run build
     3. Run tests (when added)
     4. Deploy to hosting
     5. Run smoke tests

## Scalability Considerations

### Current Capacity

- Designed for: Small to medium teams
- Limitations: None identified yet
- Bottlenecks: Database queries, no caching

### Scaling Strategies

1. **Vertical Scaling**
   - Upgrade Supabase tier
   - More database resources
   - Faster Edge Functions

2. **Horizontal Scaling**
   - Read replicas for database
   - CDN for static assets
   - Multiple Edge Function regions

3. **Application Optimization**
   - Implement caching
   - Optimize queries
   - Reduce payload sizes

## Testing Strategy

### Current State

- Manual testing only
- No automated tests

### Recommended Testing Pyramid

```
      ╱╲
     ╱  ╲     E2E Tests (5%)
    ╱────╲
   ╱      ╲   Integration Tests (15%)
  ╱────────╲
 ╱          ╲ Unit Tests (80%)
╱────────────╲
```

### Test Coverage Goals

1. **Unit Tests**
   - API client functions
   - Utility functions
   - Custom hooks

2. **Component Tests**
   - Render tests
   - User interaction
   - State changes

3. **Integration Tests**
   - API + Component
   - Multi-component flows
   - Database operations

4. **E2E Tests**
   - Critical user flows
   - Complete funnel creation
   - Category management

## Monitoring & Observability

### Future Implementation

1. **Logging**
   - Structured logs
   - Log aggregation service
   - Error tracking (Sentry)

2. **Metrics**
   - API response times
   - Error rates
   - User activity

3. **Alerts**
   - High error rates
   - Slow queries
   - Service outages

## Development Tools

### Essential Tools

- **VS Code** - Recommended IDE
- **React DevTools** - Component inspection
- **Supabase Studio** - Database management
- **Postman/Thunder Client** - API testing

### VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Importer
- GitLens

## Future Architecture Improvements

1. **Real-time Updates**
   - Use Supabase Realtime
   - Live funnel execution status
   - Collaborative editing

2. **Background Jobs**
   - Message scheduling
   - Enrollment processing
   - Analytics generation

3. **Microservices**
   - Separate message sending service
   - Analytics service
   - Webhook handler service

4. **Event-Driven Architecture**
   - Event bus for triggers
   - Async processing
   - Better scalability
