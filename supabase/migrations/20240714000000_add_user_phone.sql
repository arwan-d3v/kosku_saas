-- Add phone column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;

-- Enable users to update their own profile data (e.g. for onboarding to update role and phone)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile" 
        ON public.users
        FOR UPDATE USING (auth.uid() = id);
    END IF;
END$$;
