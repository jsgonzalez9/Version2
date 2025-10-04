/*
  # Extended Onboarding Fields Migration

  ## New Fields Added to Profiles Table
  
  1. **Motivation & Background**
    - `motivation` (text) - Primary reason for quitting/reducing
    - `vaping_duration_months` (integer) - How long they've been vaping
    - `previous_quit_attempts` (integer) - Number of times tried to quit before
    - `support_system` (text) - Who's supporting them (friends, family, etc)
    
  2. **Financial Tracking**
    - `cost_per_device` (decimal) - How much each vape device costs
    - `devices_per_week` (decimal) - How many devices used per week
    - `quit_date` (date) - When they actually quit (different from quit_goal_date)
    
  3. **Personal Details**
    - `age_range` (text) - Age bracket for demographics
    - `biggest_challenge` (text) - Main challenge they face
    - `success_metric` (text) - How they define success
    
  4. **Preferences**
    - `notification_preferences` (jsonb) - Customized notification settings
    - `preferred_reminder_times` (time[]) - When to send reminders

  ## Security
  - All fields are optional to maintain backward compatibility
  - RLS policies remain unchanged (users can only access their own data)
*/

-- Add motivation and background fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'motivation'
  ) THEN
    ALTER TABLE profiles ADD COLUMN motivation text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'vaping_duration_months'
  ) THEN
    ALTER TABLE profiles ADD COLUMN vaping_duration_months integer;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'previous_quit_attempts'
  ) THEN
    ALTER TABLE profiles ADD COLUMN previous_quit_attempts integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'support_system'
  ) THEN
    ALTER TABLE profiles ADD COLUMN support_system text;
  END IF;
END $$;

-- Add financial tracking fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'cost_per_device'
  ) THEN
    ALTER TABLE profiles ADD COLUMN cost_per_device decimal(10,2);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'devices_per_week'
  ) THEN
    ALTER TABLE profiles ADD COLUMN devices_per_week decimal(10,2);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'quit_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN quit_date date;
  END IF;
END $$;

-- Add personal details fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'age_range'
  ) THEN
    ALTER TABLE profiles ADD COLUMN age_range text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'biggest_challenge'
  ) THEN
    ALTER TABLE profiles ADD COLUMN biggest_challenge text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'success_metric'
  ) THEN
    ALTER TABLE profiles ADD COLUMN success_metric text;
  END IF;
END $$;

-- Add preference fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE profiles ADD COLUMN notification_preferences jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferred_reminder_times'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferred_reminder_times time[];
  END IF;
END $$;