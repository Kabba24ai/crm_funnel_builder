# Contributing to Sales Funnel Automation CRM

Thank you for your interest in contributing to this project! This guide will help you get started.

## Code of Conduct

- Be respectful and constructive
- Focus on what is best for the project
- Show empathy towards other contributors
- Accept constructive criticism gracefully

## Getting Started

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env` and configure
5. Start the dev server: `npm run dev`

### Branch Naming

Use descriptive branch names:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

Examples:
- `feature/add-webhook-support`
- `fix/category-delete-error`
- `docs/update-api-endpoints`

## Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript for all new code
- **Components**: Use functional components with hooks
- **Naming**: Use PascalCase for components, camelCase for functions/variables
- **Props**: Define explicit TypeScript interfaces for component props
- **Imports**: Group imports: external libraries first, then internal modules

Example:
```typescript
import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { funnelsApi } from '../lib/api';
import type { Funnel } from '../types/funnel';

interface FunnelListProps {
  categoryId?: string;
  onEdit: (id: string) => void;
}

export const FunnelList: React.FC<FunnelListProps> = ({ categoryId, onEdit }) => {
  // Component implementation
};
```

### Component Structure

1. **Imports**
2. **Type definitions**
3. **Component function**
4. **State declarations**
5. **Effects**
6. **Event handlers**
7. **Render logic**
8. **Export**

### Styling Guidelines

- Use Tailwind CSS utility classes
- Keep custom CSS to a minimum
- Use consistent spacing scale (px-4, py-2, gap-3, etc.)
- Follow existing color scheme
- Ensure responsive design (mobile-first)

### Database Changes

When modifying the database:

1. Create a new migration file in `supabase/migrations/`
2. Use timestamp format: `YYYYMMDDHHMISS_description.sql`
3. Add detailed comments explaining changes
4. Use safe operations (`IF NOT EXISTS`, `IF EXISTS`)
5. Update RLS policies as needed
6. Update TypeScript types in `src/types/`

### Edge Functions

When creating or modifying Edge Functions:

1. Keep functions focused on single responsibility
2. Always include CORS headers
3. Handle OPTIONS requests for preflight
4. Validate input data
5. Use proper error handling
6. Return appropriate HTTP status codes
7. Test with different scenarios

Example structure:
```typescript
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Function logic here

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

## Pull Request Process

### Before Submitting

1. **Test your changes**
   - Run the dev server and test manually
   - Check console for errors
   - Test edge cases

2. **Code quality**
   - Run `npm run build` successfully
   - No TypeScript errors
   - Follow code style guidelines

3. **Documentation**
   - Update README if needed
   - Add comments for complex logic
   - Update API docs if endpoints changed

### Submitting a PR

1. **Title**: Clear, descriptive title
   - Good: "Add webhook support for funnel triggers"
   - Bad: "Update code"

2. **Description**: Include:
   - What changes were made
   - Why the changes were needed
   - Any breaking changes
   - Screenshots (for UI changes)
   - Related issue numbers

3. **Checklist**:
   - [ ] Code builds without errors
   - [ ] Manual testing completed
   - [ ] Documentation updated
   - [ ] No sensitive data in code
   - [ ] Follows code style guidelines

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List of changes
- Another change

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Closes #123
```

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance tasks

### Examples

```
feat(funnels): add webhook trigger support

Add ability to trigger funnels via webhook endpoint.
Creates new edge function to handle webhook requests.

Closes #45
```

```
fix(categories): resolve delete error when category has funnels

Prevent deletion of categories that have associated funnels.
Show error message to user with count of linked funnels.

Fixes #67
```

## Testing

### Manual Testing Checklist

When testing your changes:

- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test on mobile viewport
- [ ] Test error scenarios
- [ ] Test with empty data
- [ ] Test with lots of data
- [ ] Check browser console for errors
- [ ] Verify database operations work

### Future: Automated Tests

We plan to add:
- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Playwright

## Common Tasks

### Adding a New Component

1. Create file in `src/components/`
2. Define prop types interface
3. Implement component
4. Export component
5. Import and use in parent component

### Adding a New API Endpoint

1. Create/modify Edge Function in `supabase/functions/`
2. Add API method in `src/lib/api.ts`
3. Update TypeScript types if needed
4. Use in component

### Adding a Database Table

1. Create migration file
2. Define table schema with RLS
3. Update TypeScript types in `src/types/database.ts`
4. Create Edge Function if needed
5. Add API methods

## Getting Help

- Check existing documentation
- Search closed issues
- Ask in pull request comments
- Open a discussion for questions

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes
- Project documentation

Thank you for contributing!
