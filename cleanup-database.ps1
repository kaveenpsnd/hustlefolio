# Database Cleanup Script
# WARNING: This will DELETE ALL DATA

# Database connection details (UPDATE THESE!)
$DB_HOST = "your-db-host.db.ondigitalocean.com"
$DB_PORT = "25060"
$DB_NAME = "defaultdb"
$DB_USER = "doadmin"
$DB_PASSWORD = "your-password-here"

Write-Host "⚠️  WARNING: This will DELETE ALL users, posts, and goals!" -ForegroundColor Red
Write-Host "Press Ctrl+C to cancel, or any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# SQL commands
$SQL = @"
SET session_replication_role = 'replica';
DELETE FROM posts;
DELETE FROM goals;
DELETE FROM users;
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS posts_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS goals_id_seq RESTART WITH 1;
SET session_replication_role = 'origin';
SELECT 'Cleanup complete!' as status;
"@

# Execute using psql (requires PostgreSQL client installed)
$env:PGPASSWORD = $DB_PASSWORD
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $SQL

Write-Host "✅ Database cleaned!" -ForegroundColor Green
