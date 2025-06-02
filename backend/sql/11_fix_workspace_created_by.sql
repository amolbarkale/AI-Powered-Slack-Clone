-- Fix the workspaces table to allow NULL for created_by
-- This resolves the circular dependency between workspaces and users during signup

-- First, drop any existing foreign key constraints
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'workspaces' AND column_name = 'created_by'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE workspaces DROP CONSTRAINT ' || constraint_name
      FROM information_schema.constraint_column_usage
      WHERE table_name = 'workspaces' AND column_name = 'created_by'
      LIMIT 1
    );
  END IF;
END $$;

-- Modify the column to allow NULL values
ALTER TABLE workspaces ALTER COLUMN created_by DROP NOT NULL; 