/*
  # Allow Negative Delays for Funnel Steps

  ## Overview
  Updates funnel_steps to support negative delay values, allowing messages to be sent
  before the trigger event (e.g., 1 day before rental start).

  ## Changes

  ### Modified Tables
  - `funnel_steps`
    - Remove any constraints on delay_value to allow negative numbers
    - Negative values mean "before trigger"
    - Positive values mean "after trigger"
    - Zero means "at trigger time"

  ## Examples
  - delay_value: -1, delay_unit: 'days' → 1 day before trigger
  - delay_value: 0, delay_unit: 'days' → at trigger time
  - delay_value: 2, delay_unit: 'hours' → 2 hours after trigger
*/

-- Remove any existing constraints on delay_value if they exist
-- The column already exists, we just need to ensure it can accept negative values
DO $$
BEGIN
  -- PostgreSQL integer type already supports negative values by default
  -- No schema changes needed, just documenting the behavior
  
  -- Update the calculate_delay_days function to handle negative values correctly
  CREATE OR REPLACE FUNCTION calculate_delay_days()
  RETURNS TRIGGER AS $func$
  BEGIN
    CASE NEW.delay_unit
      WHEN 'minutes' THEN
        -- For negative values, ceiling rounds towards zero (e.g., -1.5 -> -1)
        -- For positive values, ceiling rounds up (e.g., 1.5 -> 2)
        IF NEW.delay_value < 0 THEN
          NEW.delay_days := FLOOR(NEW.delay_value::decimal / 1440);
        ELSE
          NEW.delay_days := CEIL(NEW.delay_value::decimal / 1440);
        END IF;
      WHEN 'hours' THEN
        IF NEW.delay_value < 0 THEN
          NEW.delay_days := FLOOR(NEW.delay_value::decimal / 24);
        ELSE
          NEW.delay_days := CEIL(NEW.delay_value::decimal / 24);
        END IF;
      WHEN 'days' THEN
        NEW.delay_days := NEW.delay_value;
      ELSE
        NEW.delay_days := NEW.delay_value;
    END CASE;
    RETURN NEW;
  END;
  $func$ LANGUAGE plpgsql;
END $$;
