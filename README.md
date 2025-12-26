# Sales Funnel Automation CRM

A comprehensive sales funnel management system with automated message scheduling, execution tracking, and flexible timing controls. Built with React, TypeScript, and Supabase.

## Overview

This CRM system allows you to create multi-step sales funnels that automatically send SMS and email messages to contacts based on trigger events. Funnels can be organized into categories, and each step supports flexible timing with customizable delays.

## Features

### Funnel Management
- Create and manage multi-step sales funnels with custom triggers
- Support for multiple trigger types (rental start date, new lead added)
- Flexible start timing: before or after trigger events
- Time units: minutes, hours, days
- Active/inactive toggle for funnels
- Funnel duplication for quick setup
- Category-based organization

### Category System
- Create custom categories with color coding
- Organize funnels by category for better management
- Filter funnels by category in the main view
- View uncategorized funnels separately

### Message Templates
- Reusable SMS and email templates
- Category-based organization for messages
- Subject line support for emails
- Active/inactive status for templates

### Funnel Steps
- Add unlimited steps to each funnel
- Configure delay timing for each step
- Choose between SMS or email for each step
- Select from pre-built message templates
- Edit and delete steps
- Visual timeline view of funnel progression

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Backend**: Supabase Edge Functions (Deno)
- **State Management**: React Hooks

## Architecture

### Frontend Architecture

The application follows a component-based architecture with clear separation of concerns:

```
src/
├── components/          # React components
│   ├── CategoryManagement.tsx
│   ├── FunnelBuilder.tsx
│   ├── FunnelForm.tsx
│   ├── FunnelStepModal.tsx
│   ├── FunnelTimeline.tsx
│   └── ...
├── lib/                # Utility libraries
│   ├── api.ts          # API client for Edge Functions
│   └── supabase.ts     # Supabase client configuration
├── types/              # TypeScript type definitions
│   ├── database.ts
│   └── funnel.ts
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

### Backend Architecture

The backend uses Supabase Edge Functions to handle all database operations:

```
supabase/
├── functions/          # Edge Functions
│   ├── categories/     # Category CRUD operations
│   ├── funnels/        # Funnel CRUD operations
│   ├── funnel-steps/   # Funnel step CRUD operations
│   └── messages/       # Message template CRUD operations
└── migrations/         # Database migrations
```

### API Layer

All frontend-to-database communication goes through Edge Functions via the API client (`src/lib/api.ts`):

- `categoriesApi` - Category management
- `funnelsApi` - Funnel management
- `funnelStepsApi` - Funnel step management
- `messagesApi` - Message template management

## Database Schema

### Core Tables

#### sales_funnels
Main funnel definitions with trigger conditions and timing.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Funnel name |
| description | text | Funnel description |
| trigger_condition | text | Event that triggers the funnel |
| trigger_delay_value | integer | Delay before/after trigger |
| trigger_delay_unit | text | Unit: minutes, hours, days |
| category_id | uuid | Foreign key to funnel_categories |
| is_active | boolean | Active status |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

#### funnel_steps
Individual steps within each funnel.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| funnel_id | uuid | Foreign key to sales_funnels |
| step_number | integer | Step order (1, 2, 3...) |
| message_id | uuid | Foreign key to message_templates |
| message_type | text | 'sms' or 'email' |
| delay_value | integer | Delay after previous step |
| delay_unit | text | Unit: minutes, hours, days |
| created_at | timestamptz | Creation timestamp |

#### funnel_categories
Organization for funnels.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Category name |
| description | text | Category description |
| color | text | Hex color code |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

#### message_templates
Reusable message content.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Template name |
| message_type | text | 'sms' or 'email' |
| subject | text | Email subject (null for SMS) |
| content | text | Message content |
| category | text | Message category |
| is_active | boolean | Active status |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### Row Level Security (RLS)

All tables have RLS enabled with public access policies. For production use, these should be updated to restrict access based on authentication:

```sql
-- Example of secure policy
CREATE POLICY "Users can view own funnels"
  ON sales_funnels
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Basic knowledge of React and TypeScript

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sales-funnel-automation
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from your Supabase project settings.

### 4. Database Setup

The database is already configured with:
- All necessary tables created via migrations
- RLS policies enabled
- Edge Functions deployed

If you need to recreate the database:

1. Go to your Supabase project dashboard
2. Navigate to the SQL editor
3. Run each migration file in order from `supabase/migrations/`

### 5. Edge Functions

The following Edge Functions are deployed and ready:

- `/functions/v1/categories` - Category management
- `/functions/v1/funnels` - Funnel management
- `/functions/v1/funnel-steps` - Step management
- `/functions/v1/messages` - Message template management

These functions handle all CRUD operations with proper CORS headers.

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 7. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage Guide

### Creating a Category

1. Navigate to the "Categories" tab
2. Click "Add Category"
3. Enter a name, description (optional), and choose a color
4. Click "Add Category"

### Creating a Funnel

1. Navigate to the "Funnel Builder" tab
2. Click "Create Funnel"
3. Fill in the form:
   - **Name**: Give your funnel a descriptive name
   - **Description**: Add details about the funnel's purpose
   - **Category**: Choose an existing category or create a new one
   - **Trigger Event**: Select when the funnel should start
   - **Start Timing**: Choose before/after the trigger and set delay
4. Click "Create"

### Adding Steps to a Funnel

1. Click on a funnel to expand it
2. Click "Add Step" or the "+" button
3. Configure the step:
   - **Message Type**: SMS or Email
   - **Message Template**: Select from available templates
   - **Delay**: Set timing after the previous step (0 = immediately)
4. Click "Add Step"

### Managing Funnels

- **Edit**: Click the pencil icon to modify funnel settings
- **Toggle Active**: Click the power icon to activate/deactivate
- **Duplicate**: Click the copy icon to create a copy
- **Delete**: Click the trash icon to remove the funnel

## API Documentation

### Edge Functions Endpoints

All endpoints support CORS and accept JSON payloads.

#### Categories API

**GET** `/functions/v1/categories`
- Returns all categories

**POST** `/functions/v1/categories`
- Create a new category
- Body: `{ name, description?, color }`

**PUT** `/functions/v1/categories?id=<id>`
- Update a category
- Body: `{ name?, description?, color?, updated_at }`

**DELETE** `/functions/v1/categories?id=<id>`
- Delete a category

#### Funnels API

**GET** `/functions/v1/funnels`
- Returns all funnels with step counts

**GET** `/functions/v1/funnels?id=<id>`
- Returns a single funnel

**POST** `/functions/v1/funnels`
- Create a new funnel
- Body: `{ name, description?, category_id?, trigger_condition, trigger_delay_value, trigger_delay_unit, is_active }`

**PUT** `/functions/v1/funnels?id=<id>`
- Update a funnel
- Body: Same as POST

**DELETE** `/functions/v1/funnels?id=<id>`
- Delete a funnel

#### Funnel Steps API

**GET** `/functions/v1/funnel-steps?funnel_id=<id>`
- Returns all steps for a funnel

**POST** `/functions/v1/funnel-steps`
- Create a new step
- Body: `{ funnel_id, step_number, message_id, message_type, delay_value, delay_unit }`

**PUT** `/functions/v1/funnel-steps?id=<id>`
- Update a step
- Body: Same as POST

**DELETE** `/functions/v1/funnel-steps?id=<id>`
- Delete a step

#### Messages API

**GET** `/functions/v1/messages`
- Returns all message templates

**GET** `/functions/v1/messages?id=<id>`
- Returns a single message template

**GET** `/functions/v1/messages?category=<category>`
- Returns messages in a category

**POST** `/functions/v1/messages`
- Create a new message template
- Body: `{ name, message_type, subject?, content, category?, is_active }`

**PUT** `/functions/v1/messages?id=<id>`
- Update a message template
- Body: Same as POST

**DELETE** `/functions/v1/messages?id=<id>`
- Delete a message template

## Development Workflow

### Code Style

- Use TypeScript for type safety
- Follow React hooks best practices
- Use functional components
- Keep components focused and single-purpose
- Use Tailwind CSS for styling

### Adding New Features

1. Create necessary database migrations in `supabase/migrations/`
2. Update or create Edge Functions if needed
3. Update the API client in `src/lib/api.ts`
4. Create or modify React components
5. Update TypeScript types in `src/types/`
6. Test thoroughly
7. Update documentation

### Database Migrations

When creating new migrations:

1. Use descriptive filenames with timestamps
2. Include detailed comments explaining changes
3. Use `IF NOT EXISTS` and `IF EXISTS` for safety
4. Always enable RLS on new tables
5. Create appropriate policies

Example:
```sql
/*
  # Description of changes

  1. New Tables
     - table_name (columns...)

  2. Changes
     - What was modified

  3. Security
     - RLS policies added
*/

CREATE TABLE IF NOT EXISTS table_name (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- columns...
);

ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "policy_name"
  ON table_name
  FOR ALL
  TO public
  USING (true);
```

## Troubleshooting

### Build Errors

If you encounter build errors:

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Database Connection Issues

1. Verify your `.env` file has correct Supabase credentials
2. Check that Edge Functions are deployed
3. Verify RLS policies are configured correctly
4. Check browser console for CORS errors

### Edge Function Issues

Edge Functions should handle CORS automatically. If you see CORS errors:

1. Verify the function includes proper CORS headers
2. Check that OPTIONS requests are handled
3. Ensure the function is deployed correctly

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Message Guidelines

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests after the first line

## Security Considerations

### Current State

The application currently uses public RLS policies for development. **This is not suitable for production.**

### Production Security Checklist

- [ ] Implement authentication with Supabase Auth
- [ ] Update RLS policies to restrict access by user
- [ ] Add row-level ownership to all tables
- [ ] Implement API rate limiting
- [ ] Add input validation and sanitization
- [ ] Enable HTTPS only
- [ ] Implement audit logging
- [ ] Add data encryption for sensitive fields

### Recommended RLS Policy Updates

```sql
-- Example secure policy for funnels
CREATE POLICY "Users can view own funnels"
  ON sales_funnels FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own funnels"
  ON sales_funnels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own funnels"
  ON sales_funnels FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own funnels"
  ON sales_funnels FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);
```

## Roadmap

### Phase 1 (Current)
- ✅ Basic funnel creation and management
- ✅ Category system for organization
- ✅ Message template management
- ✅ Funnel step configuration
- ✅ Edge Functions architecture

### Phase 2 (Planned)
- [ ] Authentication and user management
- [ ] Contact/customer management
- [ ] Manual enrollment system
- [ ] Enrollment tracking dashboard
- [ ] Execution queue visualization

### Phase 3 (Future)
- [ ] Actual message sending (SMS/Email integration)
- [ ] Analytics and reporting
- [ ] A/B testing for messages
- [ ] Advanced trigger conditions
- [ ] Webhook integrations

## License

This project is proprietary software. All rights reserved.

## Support

For issues and questions:
1. Check the documentation above
2. Review closed issues in the repository
3. Open a new issue with detailed information

## Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
