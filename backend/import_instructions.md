# Instructions for Importing Dummy Data

This guide will help you import dummy data into your Supabase project so you can log in with pre-created users and see sample data.

## Step 1: Create Auth Users

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `dummy_auth_users.sql` into the editor
4. Run the SQL query to create dummy auth users with password "password123"

## Step 2: Import Tables Data

### Import Users Table

1. In the Supabase dashboard, go to "Table Editor"
2. Select the "users" table
3. Click "Import" button
4. Upload the `dummy_users.csv` file
5. Make sure to select "CSV" as the file format
6. Click "Import" to add the users

### Import Workspaces Table

1. In the Table Editor, select the "workspaces" table
2. Click "Import" button
3. Upload the `dummy_workspaces.csv` file
4. Select "CSV" as the file format
5. Click "Import" to add the workspace

### Import Channels Table

1. In the Table Editor, select the "channels" table
2. Click "Import" button
3. Upload the `dummy_channels.csv` file
4. Select "CSV" as the file format
5. Click "Import" to add the channels

### Import Messages Table

1. In the Table Editor, select the "messages" table
2. Click "Import" button
3. Upload the `dummy_messages.csv` file
4. Select "CSV" as the file format
5. Click "Import" to add the messages

## Step 3: Test Login

You can now log in with any of these users:

| Email | Password |
|-------|----------|
| john@example.com | password123 |
| jane@example.com | password123 |
| bob@example.com | password123 |
| alice@example.com | password123 |
| charlie@example.com | password123 |

## Troubleshooting

If you encounter any issues:

1. Check that the UUIDs in the CSV files match between tables
2. Ensure the auth.users table has entries with matching IDs to the users table
3. Verify that the email_confirmed_at field is set for auth users
4. Check that the workspace_id in channels matches the workspace ID 