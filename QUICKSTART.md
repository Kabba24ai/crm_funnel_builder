# Quick Start Guide

Get the Sales Funnel Automation CRM running on your local machine in 5 minutes.

## Prerequisites

Make sure you have:
- Node.js 18 or higher ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- Git
- A code editor (VS Code recommended)

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd sales-funnel-automation
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including React, TypeScript, Tailwind CSS, and more.

## Step 3: Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

The `.env` file is already configured with development credentials. You can use it as-is.

## Step 4: Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

## Step 5: Explore the Application

Open your browser and navigate to `http://localhost:5173`

### Try These Features:

#### 1. Create a Category
- Click on the "Categories" tab
- Click "Add Category" button
- Fill in:
  - Name: "Onboarding"
  - Description: "New customer onboarding funnels"
  - Color: Choose blue
- Click "Add Category"

#### 2. Create Your First Funnel
- Click on the "Funnel Builder" tab
- Click "Create Funnel" button
- Fill in:
  - Name: "Welcome Series"
  - Description: "Welcome new leads with automated messages"
  - Category: Select "Onboarding"
  - Trigger Event: "New Lead Added"
  - Start Timing: "After Event", "0 days"
  - Check "Set as active"
- Click "Create"

#### 3. Add Steps to Your Funnel
- Click on your newly created funnel to expand it
- Click "Add Step" button
- Configure first step:
  - Message Type: SMS
  - Message Template: "Welcome SMS"
  - Delay: 0 days (immediate)
- Click "Add Step"

- Add a second step:
  - Message Type: Email
  - Message Template: "Welcome Email"
  - Delay: 1 day
- Click "Add Step"

Congratulations! You've created your first automated funnel.

## Project Structure Overview

```
sales-funnel-automation/
├── src/
│   ├── components/         # React components
│   ├── lib/               # Utilities and API client
│   ├── types/             # TypeScript definitions
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── supabase/
│   ├── functions/         # Edge Functions (backend)
│   └── migrations/        # Database migrations
├── public/                # Static assets
└── dist/                  # Build output (generated)
```

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run TypeScript type checking
npm run typecheck

# Run ESLint
npm run lint
```

## Key Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Supabase** - Backend and database
- **Lucide React** - Icons

## Development Workflow

### Making Changes

1. **Edit components** in `src/components/`
2. **Save** - Vite will hot-reload automatically
3. **Check browser** - Changes appear instantly

### Adding New Features

1. Read `ARCHITECTURE.md` to understand the system
2. Follow guidelines in `CONTRIBUTING.md`
3. Update documentation as needed

## Common Tasks

### Adding a New Component

```bash
# Create new component file
touch src/components/MyComponent.tsx
```

```typescript
// src/components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
  );
};

export default MyComponent;
```

### Using the API Client

```typescript
import { funnelsApi } from '../lib/api';

// In your component
const loadData = async () => {
  try {
    const funnels = await funnelsApi.getAll();
    setFunnels(funnels);
  } catch (error) {
    console.error('Error loading funnels:', error);
  }
};
```

### Adding Tailwind Classes

Just use utility classes in your JSX:

```jsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Click me
</button>
```

## Troubleshooting

### Port 5173 Already in Use

```bash
# Kill the process using the port
npx kill-port 5173

# Or use a different port
npm run dev -- --port 3000
```

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf dist
npm run build
```

### Edge Functions Not Working

The Edge Functions should work out of the box with the provided credentials. If you see errors:

1. Check browser console for specific error messages
2. Verify `.env` file exists and has correct values
3. Clear browser cache and reload

## Understanding the Data Flow

### When You Create a Funnel:

```
User clicks "Create Funnel"
    ↓
FunnelForm component opens
    ↓
User fills form and submits
    ↓
funnelsApi.create() called
    ↓
POST request to /functions/v1/funnels
    ↓
Edge Function receives request
    ↓
Validates data and inserts to database
    ↓
Returns created funnel
    ↓
Component updates state
    ↓
UI refreshes with new funnel
```

## Next Steps

Now that you have the app running:

1. **Explore the Code**
   - Read `ARCHITECTURE.md` for system design
   - Check `src/components/` to see how components work
   - Look at `src/lib/api.ts` to understand API calls

2. **Learn the Database**
   - Open Supabase Studio (URL in your `.env`)
   - Explore the tables and relationships
   - Check out the migrations in `supabase/migrations/`

3. **Try Making Changes**
   - Modify a component
   - Change some styling
   - Add a console.log to see data flow

4. **Read Documentation**
   - `README.md` - Complete project overview
   - `CONTRIBUTING.md` - How to contribute
   - `ARCHITECTURE.md` - Technical deep dive

## Getting Help

- **Documentation** - Check the docs folder
- **Code Comments** - Read inline comments in code
- **Issues** - Search existing issues in repository
- **Console** - Check browser console for errors

## Tips for Success

1. **Keep Dev Server Running**
   - Saves time with hot reload
   - Instant feedback on changes

2. **Use Browser DevTools**
   - React DevTools extension
   - Network tab for API calls
   - Console for debugging

3. **Follow the Patterns**
   - Look at existing components
   - Copy similar functionality
   - Maintain consistency

4. **Commit Often**
   - Small, focused commits
   - Descriptive messages
   - Easy to revert if needed

## VS Code Extensions (Recommended)

Install these for better development experience:

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **TypeScript Importer** - Auto-import suggestions
- **ES7+ React/Redux/React-Native snippets** - Code snippets

## Quick Reference

### Important Files

- `src/App.tsx` - Main application
- `src/lib/api.ts` - API client
- `src/types/funnel.ts` - Type definitions
- `.env` - Environment variables

### Important Commands

```bash
npm run dev          # Start development
npm run build        # Build for production
npm install <pkg>    # Add new package
git status          # Check git status
git add .           # Stage changes
git commit -m "msg" # Commit changes
```

### Keyboard Shortcuts (VS Code)

- `Ctrl/Cmd + P` - Quick file open
- `Ctrl/Cmd + Shift + P` - Command palette
- `Ctrl/Cmd + /` - Toggle comment
- `Ctrl/Cmd + D` - Select next occurrence
- `Alt + Up/Down` - Move line up/down

## You're Ready!

You now have the Sales Funnel Automation CRM running locally. Start exploring, making changes, and building features!

For more detailed information, check out the other documentation files:
- `README.md` - Full project documentation
- `ARCHITECTURE.md` - Technical architecture
- `CONTRIBUTING.md` - Contribution guidelines
- `DEPLOYMENT.md` - Deployment instructions

Happy coding!
