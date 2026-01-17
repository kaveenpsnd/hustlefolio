-- Database Migration: Add support for multiple goals per user
-- Run this script to update your database schema

-- Step 1: Add user_id column to goals table
ALTER TABLE goals ADD COLUMN IF NOT EXISTS user_id BIGINT;

-- Step 1.5: Remove old username column from goals table (if it exists)
ALTER TABLE goals DROP COLUMN IF EXISTS username;

-- Step 2: Add goal_id column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS goal_id BIGINT;

-- Step 3: Add foreign key constraint for goals -> users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_goals_user' AND table_name = 'goals'
    ) THEN
        ALTER TABLE goals ADD CONSTRAINT fk_goals_user
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 4: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_active ON goals(active);
CREATE INDEX IF NOT EXISTS idx_posts_goal_id ON posts(goal_id);

-- Display updated table structures
SELECT 'Goals table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'goals'
ORDER BY ordinal_position;

SELECT 'Posts table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'posts'
ORDER BY ordinal_position;

