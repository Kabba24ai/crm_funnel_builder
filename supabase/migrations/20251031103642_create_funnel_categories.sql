/*
  # Create Funnel Categories Table

  ## Overview
  Creates a table for organizing sales funnels into categories for better organization and management.

  ## New Tables

  ### funnel_categories
  - `id` (uuid, primary key) - Unique category identifier
  - `name` (text, not null, unique) - Category name
  - `description` (text, nullable) - Category description
  - `color` (text, default '#3B82F6') - Category display color (hex code)
  - `created_at` (timestamptz, default now()) - Creation timestamp
  - `updated_at` (timestamptz, default now()) - Last update timestamp

  ## Changes to Existing Tables

  ### sales_funnels
  - Add `category_id` (uuid, nullable, foreign key) - References funnel_categories
  - This allows funnels to be optionally organized into categories

  ## Indexes
  - Index on `sales_funnels.category_id` for efficient filtering by category

  ## Security
  - Enable RLS on funnel_categories table
  - Add policies for public access (adjust based on auth requirements)

  ## Notes
  - Categories are optional for funnels (nullable foreign key)
  - Category colors are stored as hex codes for UI customization
  - Unique constraint on category name prevents duplicates
*/

-- Create funnel_categories table
CREATE TABLE IF NOT EXISTS funnel_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add category_id to sales_funnels table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_funnels' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE sales_funnels
      ADD COLUMN category_id uuid REFERENCES funnel_categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index on category_id for better query performance
CREATE INDEX IF NOT EXISTS idx_sales_funnels_category_id ON sales_funnels(category_id);

-- Enable Row Level Security
ALTER TABLE funnel_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public access
CREATE POLICY "Allow all operations on funnel_categories"
  ON funnel_categories
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
