# Deployment Guide

This guide covers deploying the Sales Funnel Automation CRM to production.

## Prerequisites

- Supabase project (production instance)
- Hosting platform account (Netlify, Vercel, or similar)
- Git repository
- Node.js 18+ installed locally

## Pre-Deployment Checklist

### 1. Code Review

- [ ] All tests pass (when implemented)
- [ ] No console.log statements in production code
- [ ] No hardcoded credentials or API keys
- [ ] Build completes without errors: `npm run build`
- [ ] No TypeScript errors: `npm run typecheck`

### 2. Security Review

- [ ] Environment variables configured correctly
- [ ] RLS policies updated for production (see Security section)
- [ ] CORS configured appropriately
- [ ] Input validation in place
- [ ] No sensitive data in code

### 3. Database Review

- [ ] All migrations applied
- [ ] Indexes created on foreign keys
- [ ] RLS enabled on all tables
- [ ] Backup strategy in place

## Supabase Setup (Production)

### 1. Create Production Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose organization and region (close to users)
4. Set a strong database password
5. Wait for project initialization

### 2. Run Database Migrations

1. Navigate to SQL Editor in Supabase Dashboard
2. Run migrations in order from `supabase/migrations/`:
   - `20251030110819_create_sales_funnel_tables.sql`
   - `20251031005319_create_message_management_tables.sql`
   - `20251031010142_add_flexible_delay_units.sql`
   - `20251031014429_move_trigger_to_funnel_level.sql`
   - `20251031015048_allow_negative_delays.sql`
   - `20251031020338_add_funnel_level_delay.sql`
   - `20251031022144_add_message_category.sql`
   - `20251031102136_add_message_templates_relationship.sql`
   - `20251031103642_create_funnel_categories.sql`

3. Verify all tables created:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 3. Deploy Edge Functions

The Edge Functions are already deployed in development. For production:

1. Ensure you have the Supabase CLI installed
2. Link to your production project:
```bash
supabase link --project-ref your-production-project-id
```

3. Deploy functions:
```bash
supabase functions deploy categories
supabase functions deploy funnels
supabase functions deploy funnel-steps
supabase functions deploy messages
```

Or deploy all at once:
```bash
supabase functions deploy
```

### 4. Configure Environment Variables

Get your production credentials:

1. Go to Project Settings > API
2. Copy your project URL
3. Copy your `anon` (public) key

You'll use these in your hosting platform.

## Update RLS Policies for Production

**CRITICAL**: The current RLS policies allow public access. Update them for production.

### Option 1: Require Authentication (Recommended)

```sql
-- Example for sales_funnels table
-- Repeat for other tables

-- Drop existing policy
DROP POLICY IF EXISTS "Allow all operations on sales_funnels" ON sales_funnels;

-- Create user-based policies
CREATE POLICY "Users can view own funnels"
  ON sales_funnels FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own funnels"
  ON sales_funnels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own funnels"
  ON sales_funnels FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own funnels"
  ON sales_funnels FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

Note: You'll need to add a `user_id` column to tables first:

```sql
ALTER TABLE sales_funnels ADD COLUMN user_id uuid REFERENCES auth.users(id);
ALTER TABLE funnel_categories ADD COLUMN user_id uuid REFERENCES auth.users(id);
ALTER TABLE message_templates ADD COLUMN user_id uuid REFERENCES auth.users(id);
```

### Option 2: Keep Public Access (Not Recommended)

If you must keep public access:
- Implement rate limiting
- Add application-level access controls
- Monitor for abuse
- Have a rollback plan

## Deployment to Netlify

### 1. Prepare Repository

```bash
# Ensure .env is in .gitignore
echo ".env" >> .gitignore

# Commit all changes
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 2. Connect to Netlify

1. Go to [Netlify](https://netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Connect your Git repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18

### 3. Configure Environment Variables

In Netlify dashboard:

1. Go to Site settings > Environment variables
2. Add variables:
   - `VITE_SUPABASE_URL` = Your production Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your production anon key

### 4. Deploy

1. Click "Deploy site"
2. Wait for build to complete
3. Visit your site URL

### 5. Configure Domain (Optional)

1. Go to Domain settings
2. Add custom domain
3. Configure DNS
4. Enable HTTPS (automatic with Netlify)

## Deployment to Vercel

### 1. Prepare Repository

Same as Netlify section above.

### 2. Connect to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. Configure Environment Variables

In Vercel dashboard:

1. Go to Settings > Environment Variables
2. Add variables:
   - `VITE_SUPABASE_URL` = Your production Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your production anon key

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Visit your deployment URL

## Deployment to AWS S3 + CloudFront

### 1. Build Locally

```bash
npm run build
```

### 2. Create S3 Bucket

```bash
aws s3 mb s3://your-app-name
```

### 3. Configure Bucket for Static Hosting

```bash
aws s3 website s3://your-app-name \
  --index-document index.html \
  --error-document index.html
```

### 4. Upload Files

```bash
aws s3 sync dist/ s3://your-app-name --delete
```

### 5. Set Up CloudFront

1. Create CloudFront distribution
2. Set origin to S3 bucket
3. Configure error pages (404 → index.html)
4. Enable HTTPS
5. Note the CloudFront URL

### 6. Environment Variables

For client-side apps, environment variables must be embedded at build time:

```bash
VITE_SUPABASE_URL=your-url \
VITE_SUPABASE_ANON_KEY=your-key \
npm run build
```

## Post-Deployment Tasks

### 1. Smoke Testing

Test critical functionality:

- [ ] Categories: Create, edit, delete
- [ ] Funnels: Create, edit, delete
- [ ] Funnel Steps: Add, edit, delete
- [ ] Category filtering works
- [ ] Forms validate correctly
- [ ] API calls succeed
- [ ] No console errors

### 2. Performance Check

- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 90
- [ ] No unnecessary network requests
- [ ] Images optimized

### 3. Security Verification

- [ ] HTTPS enabled
- [ ] Security headers present
- [ ] No API keys exposed
- [ ] RLS working correctly

### 4. Set Up Monitoring

- [ ] Error tracking (Sentry, etc.)
- [ ] Analytics (Google Analytics, Plausible)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Performance monitoring (Lighthouse CI)

## Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      run: npm run build

    - name: Deploy to Netlify
      uses: netlify/actions/cli@master
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
      with:
        args: deploy --prod --dir=dist
```

Configure secrets in GitHub repository settings.

## Rollback Procedure

If issues occur after deployment:

### Immediate Rollback (Hosting)

**Netlify/Vercel:**
1. Go to Deployments
2. Find previous working deployment
3. Click "Publish deploy"

**AWS:**
```bash
# Revert to previous build
aws s3 sync previous-build/ s3://your-app-name --delete
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### Database Rollback

If you need to rollback database changes:

1. **Never** drop tables in production
2. Create a new migration to undo changes
3. Add backward-compatible changes when possible
4. Test rollback procedures in staging first

## Staging Environment

Before deploying to production, use a staging environment:

1. Create separate Supabase project for staging
2. Deploy to staging URL (e.g., staging.example.com)
3. Run full test suite
4. Verify with stakeholders
5. Then deploy to production

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Working

- Verify variable names start with `VITE_`
- Check they're set in hosting platform
- Rebuild after adding variables
- Clear browser cache

### Edge Functions Not Working

```bash
# Verify deployment
supabase functions list

# Check function logs
supabase functions logs function-name

# Redeploy specific function
supabase functions deploy function-name
```

### CORS Errors

- Verify Edge Functions return proper CORS headers
- Check Supabase project URL is correct
- Ensure OPTIONS method handled

## Maintenance

### Regular Tasks

**Weekly:**
- Review error logs
- Check performance metrics
- Monitor uptime

**Monthly:**
- Update dependencies: `npm update`
- Review security advisories
- Database backup verification

**Quarterly:**
- Full security audit
- Performance optimization review
- Capacity planning

### Database Maintenance

```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Vacuum analyze (improves performance)
VACUUM ANALYZE;
```

## Support

For deployment issues:
1. Check application logs
2. Review Supabase logs
3. Consult hosting platform docs
4. Open issue in repository

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
