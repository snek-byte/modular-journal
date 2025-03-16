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

