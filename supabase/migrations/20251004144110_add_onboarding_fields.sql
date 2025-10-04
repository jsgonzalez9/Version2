/*
  # Add Onboarding Fields to Profiles

  1. Changes
    - Add `onboarding_completed` (boolean) to profiles table
    - Add `current_daily_puffs` (integer) to track user's current usage
    - Default onboarding_completed to false for new users
    
  2. Purpose
    - Track whether user has completed onboarding
    - Store current usage to calculate reduction goals
    - Enable personalized onboarding experience
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'current_daily_puffs'
  ) THEN
    ALTER TABLE profiles ADD COLUMN current_daily_puffs integer DEFAULT 0;
  END IF;
END $$;