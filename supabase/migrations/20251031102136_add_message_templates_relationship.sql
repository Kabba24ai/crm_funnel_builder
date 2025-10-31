/*
  # Add Foreign Key Relationship and Rename Column

  ## Changes
  
  1. Column Rename
    - Rename `body` to `content` in `message_templates` table for consistency with application code
  
  2. Foreign Key Relationship
    - Add foreign key constraint from `funnel_steps.message_id` to `message_templates.id`
    - This enables Supabase to automatically join these tables in queries
    - Uses ON DELETE RESTRICT to prevent deletion of templates in use
  
  ## Notes
  - The foreign key relationship is essential for Supabase's automatic join functionality
  - Renaming body to content aligns database schema with TypeScript interfaces
*/

-- Rename body column to content in message_templates
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'message_templates' AND column_name = 'body'
  ) THEN
    ALTER TABLE message_templates RENAME COLUMN body TO content;
  END IF;
END $$;

-- Add foreign key relationship from funnel_steps to message_templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'funnel_steps_message_id_fkey'
    AND table_name = 'funnel_steps'
  ) THEN
    ALTER TABLE funnel_steps
      ADD CONSTRAINT funnel_steps_message_id_fkey
      FOREIGN KEY (message_id)
      REFERENCES message_templates(id)
      ON DELETE RESTRICT;
  END IF;
END $$;

-- Create index on message_id for better join performance
CREATE INDEX IF NOT EXISTS idx_funnel_steps_message_id ON funnel_steps(message_id);
