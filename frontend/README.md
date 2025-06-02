# AI-Powered Slack Clone - Frontend

This is the frontend for the AI-Powered Slack Clone project. It's built with React, Vite, and Tailwind CSS, and connects to a Supabase backend.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the frontend directory with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Start the development server:
```bash
npm run dev
```

## Project Structure

- `src/lib/supabaseClient.js` - Supabase client configuration
- `src/lib/api.js` - API helper functions for interacting with Supabase
- `src/contexts/` - React context providers for authentication, workspaces, and channels
- `src/components/` - Reusable UI components
- `src/pages/` - Page components
- `src/scripts/` - Utility scripts, including RLS policy tests

## Testing RLS Policies

To test the Row Level Security policies, you can run the test script:

```bash
node -r dotenv/config src/scripts/testRLS.js
```

This will create test users and verify that the RLS policies are working correctly.

## Features

- Authentication (sign up, sign in, sign out)
- Workspaces management
- Channels within workspaces
- Messaging and threads
- File attachments
- Unread message counts
