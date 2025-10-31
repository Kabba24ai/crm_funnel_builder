# CRM Funnel Builder

A sales funnel management system with automated message scheduling and execution tracking.

## Features

- **Funnel Management**: Create and manage multi-step sales funnels with flexible timing
- **Message Templates**: Organize messages by category with reusable templates
- **Category System**: Categorize both funnels and messages for better organization
- **Enrollment Tracking**: Track contacts through funnel steps with detailed progress monitoring
- **Execution Queue**: View and manage scheduled message deliveries
- **Manual Enrollment**: Add contacts to funnels manually with custom start dates
- **Flexible Timing**: Support for minutes, hours, days, and weeks with positive/negative delays

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth ready (not currently implemented)

## Database Schema

- `sales_funnels`: Main funnel definitions with trigger conditions
- `funnel_steps`: Individual steps within each funnel
- `funnel_enrollments`: Contact enrollment tracking
- `execution_queue`: Scheduled message deliveries
- `message_templates`: Reusable message content
- `message_categories`: Organization for message templates
- `funnel_categories`: Organization for funnels

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run migrations in Supabase to set up the database schema

4. Start development server:
```bash
npm run dev
```

## Build

```bash
npm run build
```

## Project Structure

- `/src/components` - React components
- `/src/lib` - Supabase client configuration
- `/src/types` - TypeScript type definitions
- `/supabase/migrations` - Database migrations
