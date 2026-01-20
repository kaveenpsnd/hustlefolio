-- ================================================
-- DATABASE CLEANUP SCRIPT
-- WARNING: This will DELETE ALL DATA from your database
-- ================================================

-- Disable foreign key checks temporarily (PostgreSQL)
SET session_replication_role = 'replica';

-- Delete all posts (this will cascade to related data)
DELETE FROM posts;

-- Delete all goals (this will cascade to related data)
DELETE FROM goals;

-- Delete all users (this will cascade to related data)
DELETE FROM users;

-- Optional: Reset auto-increment sequences
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS posts_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS goals_id_seq RESTART WITH 1;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Verify cleanup
SELECT 'Users remaining: ' || COUNT(*) FROM users;
SELECT 'Posts remaining: ' || COUNT(*) FROM posts;
SELECT 'Goals remaining: ' || COUNT(*) FROM goals;
