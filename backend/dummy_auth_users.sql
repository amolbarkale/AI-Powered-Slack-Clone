-- SQL script to insert dummy users into auth.users table
-- Run this in the Supabase SQL Editor

-- Insert dummy users into auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES
(
  'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', -- id
  '00000000-0000-0000-0000-000000000000', -- instance_id (default)
  'john@example.com', -- email
  '$2a$10$abcdefghijklmnopqrstuvwxyz012345678901234567890123456789', -- encrypted_password (dummy hash)
  NOW(), -- email_confirmed_at
  NULL, -- recovery_sent_at
  NOW(), -- last_sign_in_at
  '{"provider": "email", "providers": ["email"]}', -- raw_app_meta_data
  '{"full_name": "John Doe"}', -- raw_user_meta_data
  NOW(), -- created_at
  NOW(), -- updated_at
  '', -- confirmation_token
  '', -- email_change
  '', -- email_change_token_new
  '' -- recovery_token
),
(
  'b2c3d4e5-f6a5-4b8c-7d9e-0f1a2b3c4d5e',
  '00000000-0000-0000-0000-000000000000',
  'jane@example.com',
  '$2a$10$abcdefghijklmnopqrstuvwxyz012345678901234567890123456789',
  NOW(),
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Jane Smith"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  'c3d4e5f6-a5b8-4c7d-9e0f-1a2b3c4d5e6f',
  '00000000-0000-0000-0000-000000000000',
  'bob@example.com',
  '$2a$10$abcdefghijklmnopqrstuvwxyz012345678901234567890123456789',
  NOW(),
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Bob Johnson"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  'd4e5f6a5-b8c7-4d9e-0f1a-2b3c4d5e6f7a',
  '00000000-0000-0000-0000-000000000000',
  'alice@example.com',
  '$2a$10$abcdefghijklmnopqrstuvwxyz012345678901234567890123456789',
  NOW(),
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Alice Williams"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  'e5f6a5b8-c7d9-4e0f-1a2b-3c4d5e6f7a8b',
  '00000000-0000-0000-0000-000000000000',
  'charlie@example.com',
  '$2a$10$abcdefghijklmnopqrstuvwxyz012345678901234567890123456789',
  NOW(),
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Charlie Brown"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Set the passwords for these users
-- The password for all users will be "password123"
UPDATE auth.users
SET encrypted_password = crypt('password123', gen_salt('bf'))
WHERE email IN ('john@example.com', 'jane@example.com', 'bob@example.com', 'alice@example.com', 'charlie@example.com');

-- Verify the users were created
SELECT id, email, email_confirmed_at FROM auth.users
WHERE email IN ('john@example.com', 'jane@example.com', 'bob@example.com', 'alice@example.com', 'charlie@example.com'); 