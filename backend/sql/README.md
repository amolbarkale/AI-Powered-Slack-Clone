# SQL Scripts for AI-Powered Slack Clone

This directory contains all the SQL scripts needed to set up the database schema, tables, and policies for the Slack clone application.

## Execution Order

Run these scripts in the Supabase SQL Editor in the following order:

1. `00_setup_extensions.sql` - Enable necessary PostgreSQL extensions
2. `01_workspaces.sql` - Create workspaces table and policies
3. `02_users.sql` - Create users table and policies
4. `03_channels.sql` - Create channels table and policies
5. `04_messages.sql` - Create messages table and policies
6. `05_attachments.sql` - Create attachments table and policies
7. `06_user_channel_reads.sql` - Create user_channel_reads table and policies
8. `07_unread_count_rpc.sql` - Create custom RPC for unread counts
9. `08_storage_setup.sql` - Configure storage bucket for attachments
10. `09_auth_trigger.sql` - Set up authentication trigger for user signup

## Schema Overview

- **workspaces** - Organizations/teams using the application
- **users** - User profiles linked to auth.users
- **channels** - Public channels within workspaces (max 10 per workspace)
- **messages** - Messages in channels, with support for threads
- **attachments** - PDF/TXT file attachments (max 10MB)
- **user_channel_reads** - Tracks last read timestamp per user/channel

## Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:

1. Users can only access data within their own workspace
2. Users can only modify their own data (messages, read status, etc.)
3. No cross-workspace data leakage

## Storage

The application uses a private storage bucket for file attachments with:
- 10MB file size limit
- PDF and TXT files only
- Signed URLs with 60-second expiration

## Authentication Flow

When a user signs up:
1. A new record is created in auth.users
2. The auth trigger creates:
   - A new workspace
   - A user profile linked to the workspace
   - A default "general" channel 