import { supabase } from "./supabase-client"

export async function setupDatabase() {
  try {
    // Check if the user_profiles table exists
    const { error: checkError } = await supabase.from("user_profiles").select("count").limit(1).single()

    // If the table doesn't exist, create it
    if (checkError) {
      console.log("Creating user_profiles table...")

      // Create the user_profiles table
      const { error: createError } = await supabase.rpc("create_user_profiles_table")

      if (createError) {
        console.error("Error creating user_profiles table:", createError)

        // Try direct SQL if RPC fails
        const { error: sqlError } = await supabase.auth.admin.executeRaw(`
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
        `)

        if (sqlError) {
          console.error("Error creating user_profiles table with SQL:", sqlError)
        }
      }
    } else {
      console.log("user_profiles table already exists")
    }

    // Create the confirm user function
    await createConfirmUserFunction()

    return { success: true }
  } catch (error) {
    console.error("Error setting up database:", error)
    return { success: false, error }
  }
}

export async function createConfirmUserFunction() {
  try {
    const { error } = await supabase.rpc("create_confirm_user_function")

    if (error) {
      // Try direct SQL if RPC fails
      const { error: sqlError } = await supabase.auth.admin.executeRaw(`
        -- Function to confirm a user's email
        CREATE OR REPLACE FUNCTION confirm_user_email(user_email TEXT)
        RETURNS VOID AS $$
        BEGIN
          UPDATE auth.users
          SET email_confirmed_at = NOW(),
              confirmed_at = NOW(),
              email_confirmation_token = NULL
          WHERE email = user_email;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Grant execute permission
        GRANT EXECUTE ON FUNCTION confirm_user_email TO authenticated;
        GRANT EXECUTE ON FUNCTION confirm_user_email TO service_role;
      `)

      if (sqlError) {
        console.error("Error creating confirm_user_email function:", sqlError)
        return { success: false, error: sqlError }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error creating confirm_user_email function:", error)
    return { success: false, error }
  }
}

