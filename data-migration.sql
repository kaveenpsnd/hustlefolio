-- Data Migration: Populate user_id in goals and goal_id in posts
-- This script links existing data to the new columns

-- IMPORTANT: Run this AFTER the schema migration (migration.sql)

-- Step 1: Check current state
SELECT 'Current state:' as info;
SELECT
    (SELECT COUNT(*) FROM goals) as total_goals,
    (SELECT COUNT(*) FROM goals WHERE user_id IS NOT NULL) as goals_with_user_id,
    (SELECT COUNT(*) FROM posts) as total_posts,
    (SELECT COUNT(*) FROM posts WHERE goal_id IS NOT NULL) as posts_with_goal_id;

-- Step 2: Populate user_id in goals table
-- If goals table has a username field (which it shouldn't based on the new structure),
-- use this to populate user_id. Otherwise, you'll need to manually assign users to goals.

-- Option A: If you have existing goals that need to be linked to users
-- You'll need to determine which user owns which goal
-- Example (uncomment and modify as needed):
-- UPDATE goals g
-- SET user_id = (SELECT id FROM users WHERE username = 'your_username')
-- WHERE user_id IS NULL;

-- Step 3: Populate goal_id in posts table
-- Assign each post to its author's first/oldest active goal
-- If the user has multiple goals, you may need to choose manually

-- Option A: Assign to user's first active goal
UPDATE posts p
SET goal_id = (
    SELECT g.id
    FROM goals g
    JOIN users u ON u.id = g.user_id
    WHERE u.username = p.author_username
      AND g.active = true
    ORDER BY g.id ASC
    LIMIT 1
)
WHERE goal_id IS NULL
  AND EXISTS (
    SELECT 1
    FROM goals g
    JOIN users u ON u.id = g.user_id
    WHERE u.username = p.author_username AND g.active = true
  );

-- Step 4: Delete posts that couldn't be linked to any goal
-- (Posts whose authors have no active goals)
-- UNCOMMENT THIS ONLY AFTER VERIFYING THE UPDATE ABOVE
-- DELETE FROM posts WHERE goal_id IS NULL;

-- Step 5: Verify the migration
SELECT 'Migration results:' as info;
SELECT
    (SELECT COUNT(*) FROM goals WHERE user_id IS NULL) as goals_without_user,
    (SELECT COUNT(*) FROM posts WHERE goal_id IS NULL) as posts_without_goal;

-- Step 6: Show sample data to verify
SELECT 'Sample goals:' as info;
SELECT id, title, user_id, active FROM goals LIMIT 5;

SELECT 'Sample posts:' as info;
SELECT id, title, author_username, goal_id FROM posts LIMIT 5;

