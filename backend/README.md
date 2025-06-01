# AI-Powered Slack Clone - Backend Setup

This directory contains the backend setup for our Slack clone application using Supabase.

## Supabase Project Setup

### 1. Create a new Supabase project
1. Go to [Supabase Dashboard](https://app.supabase.io/)
2. Click "New Project"
3. Enter project details:
   - Name: `ai-slack-clone`
   - Database Password: (create a secure password)
   - Region: (select closest to your location)
4. Click "Create New Project"

### 2. Record API Keys
Once your project is created, go to Settings > API and copy:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SERVICE_ROLE_KEY` (for admin operations)

Store these in a `.env` file (which should be git-ignored).

### 3. Enable Extensions
In the SQL Editor, run:
```sql
-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### 4. Configure CORS
In the Supabase Dashboard:
1. Go to Settings > API
2. Under CORS, add:
   - `http://localhost:3000` (for local development)
   - Any other frontend URLs you plan to use

## Database Schema
The SQL files for creating tables and setting up RLS policies are in the `sql` directory:

- `01_workspaces.sql` - Workspaces table and policies
- `02_users.sql` - Users table and policies
- `03_channels.sql` - Channels table and policies
- `04_messages.sql` - Messages table and policies
- `05_attachments.sql` - Attachments table and policies
- `06_user_channel_reads.sql` - User channel reads table and policies
- `07_unread_count_rpc.sql` - Custom RPC for unread counts
- `08_storage_setup.sql` - Storage bucket configuration

## Running SQL Scripts
Execute these scripts in order in the Supabase SQL Editor. 