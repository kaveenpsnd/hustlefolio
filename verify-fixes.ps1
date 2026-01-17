# Quick Verification Script
Write-Host "Verifying Database Schema..." -ForegroundColor Cyan

$env:PGPASSWORD='password'
$psqlPath = 'D:\Softwares\Installed\bin\psql.exe'

# Test 1: Check goals table has required columns
Write-Host "`nTest 1: Checking goals table columns..." -ForegroundColor Yellow
$result = & $psqlPath -h localhost -p 5435 -U streak_dev -d streak_db -t -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'goals' AND column_name IN ('user_id', 'created_at', 'category_id');"
if ($result -match 'user_id' -and $result -match 'created_at') {
    Write-Host "  ✓ Goals table has user_id and created_at" -ForegroundColor Green
} else {
    Write-Host "  ✗ Goals table missing columns" -ForegroundColor Red
}

# Test 2: Check posts table has required columns
Write-Host "`nTest 2: Checking posts table columns..." -ForegroundColor Yellow
$result = & $psqlPath -h localhost -p 5435 -U streak_dev -d streak_db -t -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'posts' AND column_name IN ('goal_id', 'created_at');"
if ($result -match 'goal_id' -and $result -match 'created_at') {
    Write-Host "  ✓ Posts table has goal_id and created_at" -ForegroundColor Green
} else {
    Write-Host "  ✗ Posts table missing columns" -ForegroundColor Red
}

# Test 3: Check no username column in goals
Write-Host "`nTest 3: Checking username column removed from goals..." -ForegroundColor Yellow
$result = & $psqlPath -h localhost -p 5435 -U streak_dev -d streak_db -t -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'username';"
if ($result -eq $null -or $result.Trim() -eq '') {
    Write-Host "  ✓ Username column removed from goals table" -ForegroundColor Green
} else {
    Write-Host "  ✗ Username column still exists" -ForegroundColor Red
}

# Test 4: Check all goals have users
Write-Host "`nTest 4: Checking all goals have users..." -ForegroundColor Yellow
$result = & $psqlPath -h localhost -p 5435 -U streak_dev -d streak_db -t -c "SELECT COUNT(*) FROM goals WHERE user_id IS NULL;"
$nullCount = $result.Trim()
if ($nullCount -eq '0') {
    Write-Host "  ✓ All goals have users assigned" -ForegroundColor Green
} else {
    Write-Host "  ✗ $nullCount goals without users" -ForegroundColor Red
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "VERIFICATION COMPLETE!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now start the application:" -ForegroundColor Yellow
Write-Host "  1. Open IntelliJ IDEA" -ForegroundColor White
Write-Host "  2. Run StreakApplication.java" -ForegroundColor White
Write-Host "  3. Application should start on http://localhost:8080" -ForegroundColor White
Write-Host ""

