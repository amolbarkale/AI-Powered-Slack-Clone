# AI-Powered Slack Clone - Implementation Todo List

> **Legend:**
> - [ ] Pending
> - [x] Done (strike-through)

---

## Phase 1: Backend Foundation

### 1.1. Initialize Supabase Project
- [ ] Create new Supabase project in dashboard
- [ ] Record `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SERVICE_ROLE_KEY`
- [ ] Enable extensions: `pgcrypto` (for UUID)
- [ ] Configure CORS: allow `http://localhost:3000` and any planned frontend URL

### 1.2. Define Database Schema & Tables
- [ ] Create table `workspaces` (id, name, created_by, created_at)
- [ ] Enable RLS on `workspaces` and add policies
- [ ] Create table `users` (id, auth_id, full_name, email, workspace_id, avatar_url, created_at)
- [ ] Enable RLS on `users` and add policies
- [ ] Create table `channels` (id, workspace_id, name, description, created_by, created_at, unique constraint)
- [ ] Enable RLS on `channels` and add policies
- [ ] Create table `messages` (id, workspace_id, channel_id, parent_message_id, user_id, content, created_at)
- [ ] Add indexes on `messages`
- [ ] Enable RLS on `messages` and add policies
- [ ] Create table `attachments` (id, workspace_id, channel_id, message_id, storage_path, filename, uploaded_by, uploaded_at)
- [ ] Add CHECK constraint and index on `attachments`
- [ ] Enable RLS on `attachments` and add policies
- [ ] Create table `user_channel_reads` (id, workspace_id, user_id, channel_id, last_read_at, unique)
- [ ] Enable RLS on `user_channel_reads` and add policies

### 1.3. Create Custom RPC for Unread Count
- [ ] Define function `get_unread_count(p_user_id UUID, p_channel_id UUID)`
- [ ] Verify `SECURITY DEFINER` and function returns `unread_count`
- [ ] Test with sample data

### 1.4. Configure Supabase Storage Bucket
- [ ] Create private bucket named `attachments-bucket`
- [ ] Confirm bucket ACL is private
- [ ] Set public URL expiration defaults

---

## Phase 2: Backend Connectivity & APIs

### 2.1. Integrate Supabase JS Client
- [ ] Create Node.js project (or in React repo)
- [ ] Install `@supabase/supabase-js`
- [ ] Initialize client with keys
- [ ] Write utility file `supabaseClient.js`

### 2.2. Auth Trigger or Edge Function for Sign-Up
- [ ] Decide between DB trigger vs. Edge Function (present pros/cons)
- [ ] Implement chosen approach

### 2.3. Validate RLS Policies
- [ ] Write script to sign up test users in different workspaces
- [ ] Attempt select/insert/update in all tables for each user
- [ ] Confirm cross-workspace access is denied

### 2.4. Basic CRUD Helper Functions
- [ ] Implement and export all helper functions
- [ ] Each helper returns row or error in consistent shape
- [ ] Write unit tests for helpers (if time allows)

### 2.5. Skip or Deflate Future AI Endpoints
- [ ] Do not create any AI-related endpoints (document for Phase 2: AI integration)

---

## Phase 3: Frontend Scaffold & Core UI

### 3.1. Initialize React Project
- [ ] Run `npx create-react-app slack-clone` (or Vite, if discussed)
- [ ] Install dependencies
- [ ] Initialize Tailwind CSS
- [ ] Configure Tailwind and add to `src/index.css`

### 3.2. Set Up Global Theme & CSS Variables
- [ ] Paste CSS variables from design doc into `src/index.css`
- [ ] Ensure Tailwind config uses those variables

### 3.3. Implement Basic Layout Components
- [ ] `<Sidebar />` static HTML
- [ ] `<ChannelPane />` static list
- [ ] `<MessagePane />` header, scrollable area, composer
- [ ] `<ThreadContainer />` static example
- [ ] Compose into `AppLayout`
- [ ] Test in browser for layout

### 3.4. Global State & Context
- [ ] Create `AuthContext`
- [ ] Create `WorkspaceContext` (if needed)
- [ ] Create `ChannelContext`
- [ ] Wrap `App` in contexts
- [ ] Provide hooks for children components

---

## Phase 4: Frontend – Connect to Backend & CRUD

### 4.1. Authentication Flow (Sign Up / Sign In)
- [ ] Create `SignUp.jsx` component
- [ ] Implement sign up logic and context update
- [ ] Create `SignIn.jsx` component
- [ ] Implement sign in logic and context update
- [ ] Implement route guards

### 4.2. Channel List & Selection
- [ ] Fetch and display channels from backend
- [ ] Implement channel selection logic

### 4.3. Message List & Posting
- [ ] Fetch and display messages for selected channel
- [ ] Implement message posting

### 4.4. Threads & Replies
- [ ] Fetch and display thread replies
- [ ] Implement reply posting

### 4.5. File Uploads & Attachments
- [ ] Implement file upload (PDF/TXT)
- [ ] Display attachments in messages

### 4.6. Unread Counts
- [ ] Fetch and display unread counts per channel
- [ ] Mark channel as read

---

## Phase 5: AI Features Integration (for future phases)
- [ ] Org Brain Plugin
- [ ] Auto-Reply Composer
- [ ] Tone & Impact Meter
- [ ] Meeting Notes Generator

---

## Phase 6: Testing, QA, and Polish
- [ ] Manual QA & edge case testing
- [ ] Accessibility checks
- [ ] Performance & error handling
- [ ] Documentation & final review 