# Changelog

All notable changes to the Sales Funnel Automation CRM will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- User authentication with Supabase Auth
- Contact/customer management system
- Manual enrollment interface
- Enrollment tracking dashboard
- Execution queue visualization
- SMS and Email integration
- Analytics and reporting
- A/B testing for messages

## [0.2.0] - 2025-12-26

### Added
- Edge Functions architecture for all database operations
  - `categories` function for category CRUD operations
  - `funnels` function for funnel management
  - `funnel-steps` function for step management
  - `messages` function for message template management
- API client layer (`src/lib/api.ts`) for centralized API calls
- Comprehensive documentation
  - Enhanced README.md with full setup instructions
  - CONTRIBUTING.md with development guidelines
  - ARCHITECTURE.md with technical deep dive
- Sample message templates for testing (SMS and Email)
- Proper CORS handling in all Edge Functions

### Changed
- Migrated from direct Supabase client to Edge Functions architecture
- Updated all components to use API client instead of direct database calls
- Improved error handling across the application
- Enhanced code organization and separation of concerns

### Fixed
- Database connection issues in browser environment
- CORS errors when calling database operations
- Category field name inconsistencies in message templates
- Build errors and TypeScript issues

### Technical
- All database operations now go through Edge Functions
- Improved security with server-side database access
- Better separation between frontend and backend
- Scalable architecture ready for authentication

## [0.1.0] - 2025-10-31

### Added

#### Core Features
- Funnel Builder interface for creating and managing sales funnels
- Category Management system for organizing funnels
- Message Template system for SMS and Email
- Funnel Timeline visualization
- Multi-step funnel configuration

#### Database Schema
- `sales_funnels` table with trigger conditions and timing
- `funnel_steps` table for individual funnel steps
- `funnel_categories` table for funnel organization
- `message_templates` table for reusable message content
- `customer_funnel_enrollments` table (prepared for future use)
- `funnel_step_executions` table (prepared for future use)
- Row Level Security (RLS) enabled on all tables

#### Frontend Components
- `App.tsx` - Main application with tab navigation
- `FunnelBuilder.tsx` - Funnel management interface
- `FunnelForm.tsx` - Create/edit funnel modal
- `FunnelStepModal.tsx` - Create/edit funnel step modal
- `FunnelTimeline.tsx` - Visual timeline of funnel steps
- `CategoryManagement.tsx` - Category CRUD interface
- `EnrollmentsDashboard.tsx` - Prepared for future use
- `ExecutionQueue.tsx` - Prepared for future use
- `ManualEnrollmentForm.tsx` - Prepared for future use

#### UI/UX Features
- Responsive design with Tailwind CSS
- Category-based filtering for funnels
- Color-coded categories for visual organization
- Drag-and-drop ready timeline interface
- Active/inactive toggle for funnels
- Funnel duplication functionality
- Modal-based forms for better UX

#### Developer Experience
- TypeScript for type safety
- Vite for fast development and builds
- ESLint for code quality
- Organized project structure
- Comprehensive type definitions

### Database Migrations

1. **20251030110819** - Initial sales funnel tables
   - Created `sales_funnels` table
   - Created `funnel_steps` table
   - Created `customer_funnel_enrollments` table
   - Created `funnel_step_executions` table
   - Set up relationships and constraints

2. **20251031005319** - Message management tables
   - Created `message_templates` table
   - Created `message_categories` table
   - Set up message template system

3. **20251031010142** - Flexible delay units
   - Added support for minutes, hours, days, weeks
   - Enhanced timing flexibility

4. **20251031014429** - Trigger conditions refactor
   - Moved trigger logic to funnel level
   - Improved trigger configuration

5. **20251031015048** - Negative delays support
   - Enabled before/after trigger timing
   - Added negative delay values

6. **20251031020338** - Funnel-level delays
   - Added trigger delay configuration
   - Enhanced start timing options

7. **20251031022144** - Message categories
   - Added category field to message templates
   - Improved message organization

8. **20251031102136** - Message template relationships
   - Enhanced funnel step to message template relationship
   - Improved data integrity

9. **20251031103642** - Funnel categories
   - Created `funnel_categories` table
   - Added category relationships to funnels
   - Color coding support

### Technical Details
- **Frontend**: React 18.3.1 + TypeScript 5.5.3
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React 0.344.0
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Prepared (not implemented)

### Known Limitations
- No user authentication (public access)
- No actual message sending capability
- No enrollment automation
- No execution scheduling
- Development-only RLS policies

## Version History Summary

- **v0.2.0** - Edge Functions architecture, API client, enhanced documentation
- **v0.1.0** - Initial release with core funnel management features

---

## How to Read This Changelog

### Categories

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements

### Version Numbers

Given a version number MAJOR.MINOR.PATCH:

- **MAJOR** - Incompatible API changes
- **MINOR** - New functionality (backwards compatible)
- **PATCH** - Bug fixes (backwards compatible)

### Links

[Unreleased]: https://github.com/yourusername/sales-funnel-crm/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/yourusername/sales-funnel-crm/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/yourusername/sales-funnel-crm/releases/tag/v0.1.0
