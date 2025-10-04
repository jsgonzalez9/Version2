/*
  # Add gender field to profiles

  1. Changes
    - Add `gender` column to profiles table to store user's gender preference
    - Uses text type to support various gender identities
  
  2. Notes
    - Field is optional (nullable) to respect user privacy
    - Existing records will have NULL gender value
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'gender'
  ) THEN
    ALTER TABLE profiles ADD COLUMN gender text;
  END IF;
END $$;