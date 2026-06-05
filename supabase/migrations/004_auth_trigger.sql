-- =============================================
-- Migration 004: Auth Trigger for Users
-- Automatically syncs auth.users to public.users
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_role public.user_role;
  new_phone VARCHAR(20);
BEGIN
  -- Determine the role from metadata, default to 'contributor'
  new_role := COALESCE(
    (new.raw_user_meta_data->>'role')::public.user_role,
    'contributor'::public.user_role
  );
  
  -- Use a unique fallback if phone is not provided in metadata
  -- since the phone column in public.users has a UNIQUE and NOT NULL constraint.
  new_phone := COALESCE(
    new.raw_user_meta_data->>'phone',
    'TEMP_' || substring(new.id::text from 1 for 8)
  );

  INSERT INTO public.users (auth_user_id, email, full_name, phone, role, is_active)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new_phone,
    new_role,
    TRUE
  )
  ON CONFLICT (auth_user_id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(public.users.full_name, EXCLUDED.full_name),
    phone = CASE 
      WHEN public.users.phone LIKE 'TEMP_%' THEN EXCLUDED.phone 
      ELSE public.users.phone 
    END;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
