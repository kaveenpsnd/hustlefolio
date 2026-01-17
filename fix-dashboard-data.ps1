# Dashboard Data Fix Script
# This script diagnoses and fixes the dashboard not showing data

Write-Host "=== DASHBOARD DATA FIX ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Diagnose
Write-Host "Step 1: Running diagnostics..." -ForegroundColor Yellow
Get-Content "diagnose-and-fix-dashboard.sql" | docker exec -i streak_local_db psql -U streak_dev -d streak_db

Write-Host ""
Write-Host "=== DIAGNOSIS COMPLETE ===" -ForegroundColor Green
Write-Host ""
Write-Host "Review the output above to understand the issue." -ForegroundColor White
Write-Host ""
Write-Host "Common issues:" -ForegroundColor Yellow
Write-Host "1. Goals have NULL user_id - They were created before migration" -ForegroundColor White
Write-Host "2. No active goals found - All goals might be completed or deleted" -ForegroundColor White
Write-Host ""
Write-Host "=== FIX OPTIONS ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Choose a fix option:" -ForegroundColor Yellow
Write-Host "A - Delete orphaned goals (goals without user_id)" -ForegroundColor White
Write-Host "B - Assign orphaned goals to first user" -ForegroundColor White
Write-Host "C - Assign orphaned goals to specific user (enter username)" -ForegroundColor White
Write-Host "N - No fix needed / Manual fix" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (A/B/C/N)"

switch ($choice.ToUpper()) {
    "A" {
        Write-Host "Deleting orphaned goals..." -ForegroundColor Yellow
        docker exec -i streak_local_db psql -U streak_dev -d streak_db -c "DELETE FROM goals WHERE user_id IS NULL;"
        Write-Host "Orphaned goals deleted!" -ForegroundColor Green
    }
    "B" {
        Write-Host "Assigning orphaned goals to first user..." -ForegroundColor Yellow
        docker exec -i streak_local_db psql -U streak_dev -d streak_db -c "UPDATE goals SET user_id = (SELECT id FROM users ORDER BY id LIMIT 1) WHERE user_id IS NULL;"
        Write-Host "Goals assigned!" -ForegroundColor Green
    }
    "C" {
        $username = Read-Host "Enter username"
        Write-Host "Assigning orphaned goals to user: $username..." -ForegroundColor Yellow
        docker exec -i streak_local_db psql -U streak_dev -d streak_db -c "UPDATE goals SET user_id = (SELECT id FROM users WHERE username = '$username') WHERE user_id IS NULL;"
        Write-Host "Goals assigned to $username!" -ForegroundColor Green
    }
    "N" {
        Write-Host "No automatic fix applied." -ForegroundColor Yellow
        Write-Host "You can manually run SQL commands from diagnose-and-fix-dashboard.sql" -ForegroundColor White
    }
    default {
        Write-Host "Invalid choice. No fix applied." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== VERIFYING FIX ===" -ForegroundColor Cyan
docker exec -i streak_local_db psql -U streak_dev -d streak_db -c "SELECT u.username, COUNT(g.id) as total_goals, COUNT(CASE WHEN g.active THEN 1 END) as active_goals FROM users u LEFT JOIN goals g ON g.user_id = u.id GROUP BY u.id, u.username ORDER BY u.username;"

Write-Host ""
Write-Host "=== FIX COMPLETE ===" -ForegroundColor Green
Write-Host "Refresh your dashboard to see the changes!" -ForegroundColor White

