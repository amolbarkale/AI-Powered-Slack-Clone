# Migration Instructions

## EMERGENCY FIX: Apply Immediately

To fix the critical issues with user creation and authentication:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `14_emergency_fix.sql` into the editor
4. Run the SQL query to apply the emergency fix

This emergency fix:
- Ensures all required columns exist in the users table
- Replaces the complex trigger with a simpler, more reliable version
- Fixes permissions to ensure the trigger can access all necessary tables
- Creates a helper function to manually create users if needed
- Handles the circular dependency between users and workspaces properly

## Verify the Fix

After running the emergency fix, you can verify it was successful by running:

```sql
-- Check if the trigger exists
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'users' AND trigger_schema = 'auth';

-- Check if the helper function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'create_user_manually' AND routine_schema = 'public';

-- Check permissions
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY grantee, privilege_type;
```

## Testing the Fix

1. Sign up a new user through the application
2. After confirming your email, you should be able to log in successfully
3. The application should load properly without getting stuck in a loading state

If you encounter any issues with existing users:
1. Go to the Authentication section in Supabase
2. Find the user in the Users list
3. Get the user's UUID
4. Run this SQL to manually create their user record:

```sql
SELECT create_user_manually(
  '00000000-0000-0000-0000-000000000000', -- Replace with the user's UUID
  'user@example.com', -- Replace with the user's email
  'User Name' -- Replace with the user's name (or NULL to use email)
);
```

## Apply Enhanced Auth Trigger Fix

To fix all the issues with the signup and login process, run the enhanced trigger script:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `13_fixed_trigger.sql` into the editor
4. Run the SQL query to apply the enhanced trigger with debugging capabilities

This enhanced fix includes:
- Creating a logging table to track trigger execution
- Adding detailed error handling at each step
- Properly capturing and storing all user metadata fields
- Providing a function to view trigger logs for debugging

## Verify Migration

After running the migration, you can verify it was successful by running:

```sql
-- Check trigger existence
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'users' AND trigger_schema = 'auth';

-- Check log table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'auth_trigger_logs'
);

-- View recent trigger logs
SELECT * FROM view_auth_logs(10);
```

## Testing the Fix

After applying the fix, test the signup process by creating a new user. The process should:
1. Create a new auth user
2. Create a new workspace with the user as the owner
3. Create a default "general" channel in the workspace
4. Handle any profile fields like bio, phone, and avatar_url correctly

If you encounter any issues, you can check the auth_trigger_logs table to see where the process failed:

```sql
SELECT * FROM auth_trigger_logs ORDER BY event_time DESC LIMIT 20;
```

## Manual User Creation (If Needed)

If for some reason the trigger doesn't work, the frontend now includes a fallback mechanism that will:
1. Detect when a user record is missing
2. Create the workspace, user record, and channel manually
3. Establish all the necessary relationships between these records 