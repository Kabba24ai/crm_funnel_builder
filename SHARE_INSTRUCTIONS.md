# Instructions for Recipients

Thank you for receiving the Sales Funnel Automation CRM project!

## Quick Start (5 Minutes)

### 1. Extract the Project

If you received a ZIP file:
```bash
unzip sales-funnel-crm.zip
cd sales-funnel-crm
```

If you received via Git:
```bash
git clone <repository-url>
cd sales-funnel-crm
```

### 2. Install Dependencies

Make sure you have Node.js 18+ installed, then run:

```bash
npm install
```

This will take 1-2 minutes to download all dependencies.

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

The `.env` file is already configured with development credentials. You can use it as-is to get started.

### 4. Start Development Server

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

## What to Read First

1. **QUICKSTART.md** - Get running in 5 minutes
2. **README.md** - Complete project overview
3. **ARCHITECTURE.md** - Understand the system design
4. **CONTRIBUTING.md** - How to contribute code

## Project Structure

```
sales-funnel-crm/
├── src/                 # React application source code
├── supabase/           # Backend (Edge Functions & Migrations)
├── *.md                # Documentation files
└── package.json        # Dependencies
```

## Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run typecheck    # Check TypeScript errors
npm run lint         # Run ESLint
```

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Icons**: Lucide React

## What's Included

✅ Complete funnel management system
✅ Category organization
✅ Message templates (SMS/Email)
✅ Timeline visualization
✅ Edge Functions (backend API)
✅ Database migrations
✅ Comprehensive documentation

## Common Issues

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 5173 already in use
```bash
npm run dev -- --port 3000
```

### Build errors
```bash
rm -rf dist
npm run build
```

## Getting Help

1. Check the documentation in the root directory
2. Read error messages in the browser console
3. Search through the code comments
4. Ask the person who shared this with you

## Next Steps

1. Run through the examples in `QUICKSTART.md`
2. Explore the code in `src/components/`
3. Check out the database structure in `supabase/migrations/`
4. Try making a small change to see hot-reload in action

## Contributing

If you plan to contribute:
1. Read `CONTRIBUTING.md` thoroughly
2. Follow the code style guidelines
3. Use the commit message template
4. Test your changes before submitting

## Questions?

- **Setup Issues**: Check `QUICKSTART.md`
- **Architecture Questions**: See `ARCHITECTURE.md`
- **Contributing**: Read `CONTRIBUTING.md`
- **Deployment**: See `DEPLOYMENT.md`

Enjoy building with the Sales Funnel Automation CRM!
