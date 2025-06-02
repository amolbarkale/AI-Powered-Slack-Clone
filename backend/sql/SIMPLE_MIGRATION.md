# Ultra Simple Migration Instructions

## Apply This Fix Immediately

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `15_ultra_simple_fix.sql` into the editor
4. Run the SQL query to apply the ultra simple fix

This fix:
- Disables the complex trigger that might be causing problems
- Ensures all necessary columns exist in the users table
- Creates simple functions to manually create user records
- Does not rely on complex database triggers

## Testing the Fix

1. After applying the SQL fix, restart your application
2. Try signing up a new user
3. Confirm your email
4. Log in with the new user

If you're still having issues with existing users, you can manually create their user records by running:

```sql
SELECT ensure_user_exists(
  '00000000-0000-0000-0000-000000000000', -- Replace with the user's UUID
  'user@example.com', -- Replace with the user's email
  'User Name' -- Replace with the user's name
);
``` 