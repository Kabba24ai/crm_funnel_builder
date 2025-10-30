/*
  # Sales Funnel Automation System - Initial Schema

  ## Overview
  Creates the complete database schema for the Sales Funnel Automation Management System
  integrating with existing CRM and Message Management tables.

  ## New Tables

  ### sales_funnels
  - `id` (uuid, primary key) - Unique funnel identifier
  - `name` (text, not null) - Funnel name
  - `description` (text, nullable) - Funnel description
  - `is_active` (boolean, default false) - Whether funnel is active
  - `created_at` (timestamptz, default now()) - Creation timestamp
  - `updated_at` (timestamptz, default now()) - Last update timestamp

  ### funnel_steps
  - `id` (uuid, primary key) - Unique step identifier
  - `funnel_id` (uuid, foreign key) - References sales_funnels
  - `step_number` (integer, not null) - Order of step in funnel
  - `message_id` (uuid, not null) - References text_messages or email_messages
  - `message_type` (text, not null) - Either 'sms' or 'email'
  - `delay_days` (integer, default 0) - Days to wait before sending
  - `trigger_condition` (text, default 'rental_created') - Trigger event
  - `created_at` (timestamptz, default now()) - Creation timestamp

  ### customer_funnel_enrollments
  - `id` (uuid, primary key) - Unique enrollment identifier
  - `customer_id` (uuid, foreign key) - References customers
  - `rental_id` (uuid, nullable, foreign key) - References rentals
  - `funnel_id` (uuid, foreign key) - References sales_funnels
  - `enrolled_at` (timestamptz, default now()) - Enrollment timestamp
  - `status` (text, default 'active') - Status: active, completed, paused, cancelled
  - `created_at` (timestamptz, default now()) - Creation timestamp

  ### funnel_step_executions
  - `id` (uuid, primary key) - Unique execution identifier
  - `enrollment_id` (uuid, foreign key) - References customer_funnel_enrollments
  - `funnel_step_id` (uuid, foreign key) - References funnel_steps
  - `scheduled_date` (timestamptz, not null) - When to send message
  - `executed_date` (timestamptz, nullable) - When message was sent
  - `status` (text, default 'pending') - Status: pending, sent, failed, skipped
  - `created_at` (timestamptz, default now()) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users (to be configured based on auth setup)
*/

-- Create sales_funnels table
CREATE TABLE IF NOT EXISTS sales_funnels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create funnel_steps table
CREATE TABLE IF NOT EXISTS funnel_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id uuid NOT NULL REFERENCES sales_funnels(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  message_id uuid NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('sms', 'email')),
  delay_days integer DEFAULT 0,
  trigger_condition text DEFAULT 'rental_created',
  created_at timestamptz DEFAULT now()
);

-- Create customer_funnel_enrollments table
CREATE TABLE IF NOT EXISTS customer_funnel_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  rental_id uuid,
  funnel_id uuid NOT NULL REFERENCES sales_funnels(id) ON DELETE CASCADE,
  enrolled_at timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Create funnel_step_executions table
CREATE TABLE IF NOT EXISTS funnel_step_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES customer_funnel_enrollments(id) ON DELETE CASCADE,
  funnel_step_id uuid NOT NULL REFERENCES funnel_steps(id) ON DELETE CASCADE,
  scheduled_date timestamptz NOT NULL,
  executed_date timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_funnel_steps_funnel_id ON funnel_steps(funnel_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_customer_id ON customer_funnel_enrollments(customer_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_funnel_id ON customer_funnel_enrollments(funnel_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON customer_funnel_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_executions_enrollment_id ON funnel_step_executions(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON funnel_step_executions(status);
CREATE INDEX IF NOT EXISTS idx_executions_scheduled_date ON funnel_step_executions(scheduled_date);

-- Enable Row Level Security
ALTER TABLE sales_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_funnel_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_step_executions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now - adjust based on auth requirements)
CREATE POLICY "Allow all operations on sales_funnels"
  ON sales_funnels
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on funnel_steps"
  ON funnel_steps
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on customer_funnel_enrollments"
  ON customer_funnel_enrollments
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on funnel_step_executions"
  ON funnel_step_executions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
