/*
  # Add Premium Features Schema

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `tier` (text) - 'free', 'premium', 'lifetime'
      - `status` (text) - 'active', 'cancelled', 'expired'
      - `started_at` (timestamptz)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `cravings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `intensity` (integer) - 1-10 scale
      - `trigger` (text)
      - `notes` (text)
      - `recorded_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `health_milestones`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `milestone_type` (text)
      - `achieved_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Changes to Profiles
    - Add `cost_per_device` (numeric) - cost of vape device
    - Add `devices_per_week` (numeric) - consumption rate
    - Add `quit_date` (date) - actual quit date (different from goal)
    - Add `longest_streak` (integer) - longest streak without vaping

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own data
*/

-- Add new columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'cost_per_device'
  ) THEN
    ALTER TABLE profiles ADD COLUMN cost_per_device numeric DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'devices_per_week'
  ) THEN
    ALTER TABLE profiles ADD COLUMN devices_per_week numeric DEFAULT 0;
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'longest_streak'
  ) THEN
    ALTER TABLE profiles ADD COLUMN longest_streak integer DEFAULT 0;
  END IF;
END $$;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create cravings table
CREATE TABLE IF NOT EXISTS cravings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  intensity integer NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  trigger text,
  notes text,
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cravings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cravings"
  ON cravings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cravings"
  ON cravings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cravings"
  ON cravings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cravings"
  ON cravings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create health_milestones table
CREATE TABLE IF NOT EXISTS health_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  milestone_type text NOT NULL,
  achieved_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE health_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health milestones"
  ON health_milestones FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health milestones"
  ON health_milestones FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_cravings_user_id ON cravings(user_id);
CREATE INDEX IF NOT EXISTS idx_cravings_recorded_at ON cravings(recorded_at);
CREATE INDEX IF NOT EXISTS idx_health_milestones_user_id ON health_milestones(user_id);