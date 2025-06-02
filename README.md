# AI-Powered Slack Clone

A modern, full-stack Slack clone with a React frontend and Supabase backend, designed to be extended with AI capabilities.

## Project Overview

This project is a comprehensive Slack clone that includes:

- **Modern UI**: A responsive interface built with React, Vite, and Tailwind CSS that closely resembles Slack
- **Backend**: Supabase-powered backend with PostgreSQL database and Row Level Security
- **Real-time Communication**: Messaging, threads, and direct messages
- **File Sharing**: Upload and share files in conversations
- **Authentication**: Complete user authentication flow
- **Workspaces**: Support for multiple workspaces and channels

## Repository Structure

- `/frontend`: React-based frontend with Vite and Tailwind CSS
- `/sql`: SQL files for setting up the Supabase database schema and policies

## Getting Started

### Backend Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL files in the `/sql` directory in the Supabase SQL editor in the following order:
   - `01_workspaces.sql`
   - `02_users.sql`
   - `03_policies.sql`
   - `04_channels.sql`
   - `05_messages.sql`
   - `06_attachments.sql`
   - `07_user_channel_reads.sql`
   - `08_unread_count.sql`
   - `09_auth_trigger.sql`
3. Create a storage bucket named `attachments-bucket` with private access

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

5. Access the application at `http://localhost:8080`

## Features

- **Authentication**: Sign up, sign in, sign out
- **Workspaces**: Create and manage workspaces
- **Channels**: Create and join channels within workspaces
- **Direct Messages**: Private conversations between users
- **Threads**: Reply to messages in threads
- **File Attachments**: Upload and share files
- **Reactions**: React to messages with emojis
- **Unread Counts**: Track unread messages per channel
- **Dark/Light Mode**: Toggle between dark and light themes
- **User Profiles**: View and edit user profiles
- **Search**: Search for messages, files, and users

## Future AI Features

The project is designed to be extended with AI capabilities:
- **Org Brain Plugin**: Knowledge base for your organization
- **Auto-Reply Composer**: AI-assisted message composition
- **Tone & Impact Meter**: Analyze message tone and potential impact
- **Meeting Notes Generator**: Automatically generate meeting notes from conversations

## Technologies Used

- **Frontend**:
  - React 18
  - Vite
  - Tailwind CSS
  - shadcn/ui components
  - React Router
  - React Query
  - TypeScript/JavaScript

- **Backend**:
  - Supabase
  - PostgreSQL
  - Row Level Security (RLS)
  - Supabase Auth
  - Supabase Storage

## License

MIT

