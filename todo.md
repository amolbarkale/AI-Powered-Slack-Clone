# AI-Powered Slack Clone - Implementation Todo List

> **Legend:**
> - [ ] Pending
> - [x] Done (strike-through)

---

## Phase 1: Backend Foundation

### 1.1. Initialize Supabase Project
- [x] ~~Create new Supabase project in dashboard~~
- [x] ~~Record `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SERVICE_ROLE_KEY`~~
- [x] ~~Enable extensions: `pgcrypto` (for UUID)~~
- [x] ~~Configure CORS: allow `http://localhost:3000` and any planned frontend URL~~

### 1.2. Define Database Schema & Tables
- [x] ~~Create table `workspaces` (id, name, created_by, created_at)~~
- [x] ~~Enable RLS on `workspaces` and add policies~~
- [x] ~~Create table `users` (id, auth_id, full_name, email, workspace_id, avatar_url, created_at)~~
- [x] ~~Enable RLS on `users` and add policies~~
- [x] ~~Create table `channels` (id, workspace_id, name, description, created_by, created_at, unique constraint)~~
- [x] ~~Enable RLS on `channels` and add policies~~
- [x] ~~Create table `messages` (id, workspace_id, channel_id, parent_message_id, user_id, content, created_at)~~
- [x] ~~Add indexes on `messages`~~
- [x] ~~Enable RLS on `messages` and add policies~~
- [x] ~~Create table `attachments` (id, workspace_id, channel_id, message_id, storage_path, filename, uploaded_by, uploaded_at)~~
- [x] ~~Add CHECK constraint and index on `attachments`~~
- [x] ~~Enable RLS on `attachments` and add policies~~
- [x] ~~Create table `user_channel_reads` (id, workspace_id, user_id, channel_id, last_read_at, unique)~~
- [x] ~~Enable RLS on `user_channel_reads` and add policies~~

### 1.3. Create Custom RPC for Unread Count
- [x] ~~Define function `get_unread_count(p_user_id UUID, p_channel_id UUID)`~~
- [x] ~~Verify `SECURITY DEFINER` and function returns `unread_count`~~
- [x] ~~Test with sample data~~

### 1.4. Configure Supabase Storage Bucket
- [x] ~~Create private bucket named `attachments-bucket`~~
- [x] ~~Confirm bucket ACL is private~~
- [x] ~~Set public URL expiration defaults~~

---

## Phase 2: Backend Connectivity & APIs

### 2.1. Integrate Supabase JS Client
- [x] ~~Create Node.js project (or in React repo)~~
- [x] ~~Install `@supabase/supabase-js`~~
- [x] ~~Initialize client with keys~~
- [x] ~~Write utility file `supabaseClient.js`~~

### 2.2. Auth Trigger or Edge Function for Sign-Up
- [x] ~~Decide between DB trigger vs. Edge Function (present pros/cons)~~
- [x] ~~Implement chosen approach~~

### 2.3. Validate RLS Policies
- [x] ~~Write script to sign up test users in different workspaces~~
- [x] ~~Attempt select/insert/update in all tables for each user~~
- [x] ~~Confirm cross-workspace access is denied~~

### 2.4. Basic CRUD Helper Functions
- [x] ~~Implement and export all helper functions~~
- [x] ~~Each helper returns row or error in consistent shape~~
- [x] ~~Write unit tests for helpers (if time allows)~~

### 2.5. Skip or Deflate Future AI Endpoints
- [x] ~~Do not create any AI-related endpoints (document for Phase 2: AI integration)~~

---

## Phase 3: Frontend Scaffold & Core UI

### 3.1. Initialize React Project
- [x] ~~Run `npx create-react-app slack-clone` (or Vite, if discussed)~~
- [x] ~~Install dependencies~~
- [x] ~~Initialize Tailwind CSS~~
- [x] ~~Configure Tailwind and add to `src/index.css`~~

### 3.2. Set Up Global Theme & CSS Variables
- [x] ~~Paste CSS variables from design doc into `src/index.css`~~
- [x] ~~Ensure Tailwind config uses those variables~~

### 3.3. Implement Basic Layout Components
- [x] ~~`<Sidebar />` static HTML~~
- [x] ~~`<ChannelPane />` static list~~
- [x] ~~`<MessagePane />` header, scrollable area, composer~~
- [x] ~~`<ThreadContainer />` static example~~
- [x] ~~Compose into `AppLayout`~~
- [x] ~~Test in browser for layout~~

### 3.4. Global State & Context
- [x] ~~Create `AuthContext`~~
- [x] ~~Create `WorkspaceContext` (if needed)~~
- [x] ~~Create `ChannelContext`~~
- [x] ~~Wrap `App` in contexts~~
- [x] ~~Provide hooks for children components~~

---

## Phase 4: Frontend – Connect to Backend & CRUD

### 4.1. Authentication Flow (Sign Up / Sign In)
- [x] ~~Create `SignUp.jsx` component~~
- [x] ~~Implement sign up logic and context update~~
- [x] ~~Create `SignIn.jsx` component~~
- [x] ~~Implement sign in logic and context update~~
- [x] ~~Implement route guards~~

### 4.2. Channel List & Selection
- [x] ~~Fetch and display channels from backend~~
- [x] ~~Implement channel selection logic~~

### 4.3. Message List & Posting
- [x] ~~Fetch and display messages for selected channel~~
- [x] ~~Implement message posting~~

### 4.4. Threads & Replies
- [x] ~~Fetch and display thread replies~~
- [x] ~~Implement reply posting~~

### 4.5. File Uploads & Attachments
- [x] ~~Implement file upload (PDF/TXT)~~
- [x] ~~Display attachments in messages~~

### 4.6. Unread Counts
- [x] ~~Fetch and display unread counts per channel~~
- [x] ~~Mark channel as read~~

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
- [x] ~~Documentation & final review~~ 