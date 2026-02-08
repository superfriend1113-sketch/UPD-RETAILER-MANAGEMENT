-- Fix duplicate email constraint in user registration
-- This migration updates the create_retailer_account function to check for existing emails

CREATE OR REPLACE FUNCTION create_retailer_account(
  p_user_id UUID,
  p_email TEXT,
  p_business_name TEXT,
  p_slug TEXT,
  p_website_url TEXT,
  p_commission NUMERIC
)
RETURNS UUID AS $$
DECLARE
  v_retailer_id UUID;
  v_existing_profile BOOLEAN;
BEGIN
  -- Check if email already exists in user_profiles
  SELECT EXISTS(SELECT 1 FROM user_profiles WHERE email = p_email) INTO v_existing_profile;
  
  IF v_existing_profile THEN
    RAISE EXCEPTION 'User already registered'
      USING HINT = 'This email address is already registered. Please sign in instead.';
  END IF;
  
  -- Create user profile
  INSERT INTO user_profiles (id, email, role, retailer_id)
  VALUES (p_user_id, p_email, 'retailer', NULL);
  
  -- Check if retailer already exists for this user
  SELECT id INTO v_retailer_id
  FROM retailers
  WHERE user_id = p_user_id;
  
  -- Only create retailer if doesn't exist
  IF v_retailer_id IS NULL THEN
    -- Create retailer record
    INSERT INTO retailers (name, slug, website_url, commission, user_id, status, is_active, deal_count, logo_url)
    VALUES (p_business_name, p_slug, p_website_url, p_commission, p_user_id, 'pending', false, 0, '')
    RETURNING id INTO v_retailer_id;
    
    -- Update user profile with retailer_id
    UPDATE user_profiles
    SET retailer_id = v_retailer_id
    WHERE id = p_user_id;
  END IF;
  
  RETURN v_retailer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the function can be executed by authenticated users
GRANT EXECUTE ON FUNCTION create_retailer_account TO authenticated;
