/*
  # Add Message Category

  ## Overview
  Adds a category field to message_templates to help organize and filter messages.

  ## Changes

  ### Modified Tables
  - `message_templates`
    - Add `category` (text, nullable) - Optional category for organizing messages
    
  ## Notes
  - Category is optional to maintain backward compatibility
  - Common categories might include: Welcome, Reminder, Follow-up, Confirmation, etc.
*/

-- Add category field to message_templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'message_templates' AND column_name = 'category'
  ) THEN
    ALTER TABLE message_templates ADD COLUMN category text;
  END IF;
END $$;
