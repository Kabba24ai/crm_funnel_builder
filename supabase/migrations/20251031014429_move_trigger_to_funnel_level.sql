/*
  # Move Trigger to Funnel Level

  ## Overview
  Simplifies funnel logic by moving the trigger condition from individual steps to the funnel level.
  All steps within a funnel will execute based on delays from the single funnel trigger.

  ## Changes

  ### Modified Tables
  
  #### sales_funnels
  - Add `trigger_condition` (text) - The event that triggers the entire funnel
  
  #### funnel_steps
  - Remove `trigger_condition` field (no longer needed at step level)

  ## Notes
  - The funnel trigger (e.g., "rental_created", "rental_delivery") applies to all steps
  - Each step's delay is calculated from the funnel's trigger event
  - This simplifies the logic and makes funnels easier to understand
*/

-- Add trigger_condition to sales_funnels table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_funnels' AND column_name = 'trigger_condition'
  ) THEN
    ALTER TABLE sales_funnels ADD COLUMN trigger_condition text DEFAULT 'rental_created';
  END IF;
END $$;

-- Set default value for existing funnels
UPDATE sales_funnels 
SET trigger_condition = 'rental_created' 
WHERE trigger_condition IS NULL;

-- Remove trigger_condition from funnel_steps (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'funnel_steps' AND column_name = 'trigger_condition'
  ) THEN
    ALTER TABLE funnel_steps DROP COLUMN trigger_condition;
  END IF;
END $$;
