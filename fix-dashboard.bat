@echo off
echo =====================================
echo DASHBOARD FIX - Quick Start
echo =====================================
echo.

echo Step 1: Checking for orphaned goals...
docker exec -i streak_local_db psql -U streak_dev -d streak_db -c "SELECT COUNT(*) as orphaned_goals FROM goals WHERE user_id IS NULL;"
echo.

echo Step 2: Showing your username(s)...
docker exec -i streak_local_db psql -U streak_dev -d streak_db -c "SELECT id, username FROM users;"
echo.

set /p username="Enter your username to assign orphaned goals to: "
echo.

echo Step 3: Assigning orphaned goals to user '%username%'...
docker exec -i streak_local_db psql -U streak_dev -d streak_db -c "UPDATE goals SET user_id = (SELECT id FROM users WHERE username = '%username%') WHERE user_id IS NULL;"
echo.

echo Step 4: Verifying fix...
docker exec -i streak_local_db psql -U streak_dev -d streak_db -c "SELECT u.username, COUNT(g.id) as total_goals, COUNT(CASE WHEN g.active THEN 1 END) as active_goals FROM users u LEFT JOIN goals g ON g.user_id = u.id GROUP BY u.username;"
echo.

echo =====================================
echo FIX COMPLETE!
echo =====================================
echo.
echo Now refresh your dashboard to see the data!
echo.
pause

