/*
  # Message Management System

  ## Overview
  Creates tables for managing SMS and Email message templates used in sales funnels.

  ## New Tables

  ### message_templates
  - `id` (uuid, primary key) - Unique message identifier
  - `name` (text, not null) - Template name for identification
  - `message_type` (text, not null) - Either 'sms' or 'email'
  - `subject` (text, nullable) - Email subject line (only for email type)
  - `body` (text, not null) - Message content/body
  - `is_active` (boolean, default true) - Whether template is active
  - `created_at` (timestamptz, default now()) - Creation timestamp
  - `updated_at` (timestamptz, default now()) - Last update timestamp

  ## Security
  - Enable RLS on message_templates table
  - Add policies for public access (adjust based on auth requirements)
*/

-- Create message_templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('sms', 'email')),
  subject text,
  body text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_message_templates_type ON message_templates(message_type);
CREATE INDEX IF NOT EXISTS idx_message_templates_active ON message_templates(is_active);

-- Enable Row Level Security
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public access
CREATE POLICY "Allow all operations on message_templates"
  ON message_templates
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
