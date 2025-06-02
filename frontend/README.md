# AI-Powered Slack Clone - Frontend

This is the frontend for the AI-Powered Slack Clone project. It's built with React, Vite, and Tailwind CSS, and connects to a Supabase backend. The UI is based on the lovable.ai design system, providing a modern and responsive interface that closely resembles Slack.

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

- `src/lib/supabase.js` - Supabase client configuration
- `src/lib/utils.js` - Utility functions for the UI components
- `src/contexts/` - React context providers for authentication, workspaces, channels, and chat
- `src/components/` - Reusable UI components
  - `src/components/ui/` - Base UI components from shadcn/ui
  - `src/components/chat/` - Chat-specific components (Sidebar, ChatArea, ThreadPanel, etc.)
  - `src/components/auth/` - Authentication components (SignIn, SignUp, etc.)
- `src/pages/` - Page components
- `src/hooks/` - Custom React hooks

## UI Framework

This project uses:
- Tailwind CSS for styling
- shadcn/ui component library for consistent UI elements
- Responsive design that works across desktop and mobile

## Features

- Modern UI that closely resembles Slack
- Dark/light mode support
- Authentication (sign up, sign in, sign out)
- Workspaces management
- Channels within workspaces
- Direct messaging
- Messaging and threads
- File attachments
- Reactions and emoji support
- Unread message counts
- User profiles
- Search functionality

## Testing

To test the Row Level Security policies, you can run the test script:

```bash
npm run test:rls
```

This will create test users and verify that the RLS policies are working correctly.

## Future AI Features

The project is designed to be extended with AI capabilities in the future:
- Org Brain Plugin
- Auto-Reply Composer
- Tone & Impact Meter
- Meeting Notes Generator
