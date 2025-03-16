-- Create the user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  email TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);
  
-- Policy for users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);
  
-- Policy for users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create the journal_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their own journals
CREATE POLICY "Users can view their own journals"
  ON journal_entries
  FOR SELECT
  USING (auth.uid() = user_id);
  
-- Policy for users to update their own journals
CREATE POLICY "Users can update their own journals"
  ON journal_entries
  FOR UPDATE
  USING (auth.uid() = user_id);
  
-- Policy for users to insert their own journals
CREATE POLICY "Users can insert their own journals"
  ON journal_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  
-- Policy for users to delete their own journals
CREATE POLICY "Users can delete their own journals"
  ON journal_entries
  FOR DELETE
  USING (auth.uid() = user_id);

