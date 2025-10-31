/*
  # Add Funnel-Level Delay

  ## Overview
  Adds delay fields to the sales_funnels table to control when the funnel starts
  relative to the trigger event.

  ## Changes

  ### Modified Tables
  - `sales_funnels`
    - Add `trigger_delay_value` (integer, default 0) - The delay amount
    - Add `trigger_delay_unit` (text, default 'days') - The delay unit (minutes/hours/days)
    - Add `trigger_delay_days` (integer, default 0) - Computed field for sorting/filtering

  ## Example Usage
  - Trigger: "Rental Start Date"
  - Trigger Delay: -1 day
  - Result: Funnel starts 1 day before rental start date
  
  Then steps execute relative to the funnel start:
  - Step 1: 0 hours → Executes at funnel start (1 day before rental)
  - Step 2: +2 hours → Executes 2 hours after funnel start
  - Step 3: +1 day → Executes 1 day after funnel start (same day as rental start)
*/

-- Add funnel-level delay fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_funnels' AND column_name = 'trigger_delay_value'
  ) THEN
    ALTER TABLE sales_funnels ADD COLUMN trigger_delay_value integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_funnels' AND column_name = 'trigger_delay_unit'
  ) THEN
    ALTER TABLE sales_funnels ADD COLUMN trigger_delay_unit text DEFAULT 'days';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_funnels' AND column_name = 'trigger_delay_days'
  ) THEN
    ALTER TABLE sales_funnels ADD COLUMN trigger_delay_days integer DEFAULT 0;
  END IF;
END $$;

-- Create function to calculate funnel trigger delay in days
CREATE OR REPLACE FUNCTION calculate_funnel_trigger_delay_days()
RETURNS TRIGGER AS $func$
BEGIN
  CASE NEW.trigger_delay_unit
    WHEN 'minutes' THEN
      IF NEW.trigger_delay_value < 0 THEN
        NEW.trigger_delay_days := FLOOR(NEW.trigger_delay_value::decimal / 1440);
      ELSE
        NEW.trigger_delay_days := CEIL(NEW.trigger_delay_value::decimal / 1440);
      END IF;
    WHEN 'hours' THEN
      IF NEW.trigger_delay_value < 0 THEN
        NEW.trigger_delay_days := FLOOR(NEW.trigger_delay_value::decimal / 24);
      ELSE
        NEW.trigger_delay_days := CEIL(NEW.trigger_delay_value::decimal / 24);
      END IF;
    WHEN 'days' THEN
      NEW.trigger_delay_days := NEW.trigger_delay_value;
    ELSE
      NEW.trigger_delay_days := NEW.trigger_delay_value;
  END CASE;
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- Create trigger for funnel delay calculation
DROP TRIGGER IF EXISTS set_funnel_trigger_delay_days ON sales_funnels;
CREATE TRIGGER set_funnel_trigger_delay_days
  BEFORE INSERT OR UPDATE OF trigger_delay_value, trigger_delay_unit
  ON sales_funnels
  FOR EACH ROW
  EXECUTE FUNCTION calculate_funnel_trigger_delay_days();

-- Update existing funnels with default values
UPDATE sales_funnels 
SET trigger_delay_value = 0, 
    trigger_delay_unit = 'days',
    trigger_delay_days = 0
WHERE trigger_delay_value IS NULL;
