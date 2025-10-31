/*
  # Add Flexible Delay Units to Funnel Steps

  ## Overview
  Updates the funnel_steps table to support flexible delay timing (minutes, hours, days).

  ## Changes

  ### Modified Tables
  - `funnel_steps`
    - Add `delay_value` (integer) - The numeric value of the delay
    - Add `delay_unit` (text) - The unit of time ('minutes', 'hours', 'days')
    - Keep `delay_days` for backward compatibility (will be calculated)

  ## Notes
  - delay_days will be auto-calculated from delay_value and delay_unit for sorting
  - Minutes options: 15, 30, 45
  - Hours options: 1-23
  - Days options: any positive integer
*/

-- Add new columns for flexible delays
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'funnel_steps' AND column_name = 'delay_value'
  ) THEN
    ALTER TABLE funnel_steps ADD COLUMN delay_value integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'funnel_steps' AND column_name = 'delay_unit'
  ) THEN
    ALTER TABLE funnel_steps ADD COLUMN delay_unit text DEFAULT 'days' CHECK (delay_unit IN ('minutes', 'hours', 'days'));
  END IF;
END $$;

-- Update existing records to use new format
UPDATE funnel_steps 
SET delay_value = delay_days, delay_unit = 'days'
WHERE delay_value IS NULL OR delay_unit IS NULL;

-- Create function to calculate delay_days from delay_value and delay_unit
CREATE OR REPLACE FUNCTION calculate_delay_days()
RETURNS TRIGGER AS $$
BEGIN
  CASE NEW.delay_unit
    WHEN 'minutes' THEN
      NEW.delay_days := CEIL(NEW.delay_value::decimal / 1440); -- minutes to days
    WHEN 'hours' THEN
      NEW.delay_days := CEIL(NEW.delay_value::decimal / 24); -- hours to days
    WHEN 'days' THEN
      NEW.delay_days := NEW.delay_value;
    ELSE
      NEW.delay_days := NEW.delay_value;
  END CASE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate delay_days
DROP TRIGGER IF EXISTS trigger_calculate_delay_days ON funnel_steps;
CREATE TRIGGER trigger_calculate_delay_days
  BEFORE INSERT OR UPDATE ON funnel_steps
  FOR EACH ROW
  EXECUTE FUNCTION calculate_delay_days();
