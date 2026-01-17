package com.streak.gamification.services;

import com.streak.auth.User;
import com.streak.auth.repositories.UserRepository;
import com.streak.gamification.entities.Goal;
import com.streak.gamification.entities.GoalCategory;
import com.streak.gamification.entities.GoalHistory;
import com.streak.gamification.repositories.GoalHistoryRepository;
import com.streak.gamification.repositories.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final GoalHistoryRepository goalHistoryRepository;
    private final UserRepository userRepository;
    private final GoalCategoryService goalCategoryService;

    @PersistenceContext
    private EntityManager entityManager;

    public Goal createGoal(Goal goal, String username, Long categoryId){
        System.out.println("Looking up user: " + username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        System.out.println("Found user: " + user.getUsername() + " with ID: " + user.getId());

        goal.setUser(user);

        goal.setUsername(user.getUsername());

        // Set category if provided
        if (categoryId != null) {
            GoalCategory category = goalCategoryService.getCategoryById(categoryId);
            goal.setCategory(category);
        }

        Goal savedGoal = goalRepository.save(goal);
        System.out.println("Goal saved successfully with ID: " + savedGoal.getId());
        return savedGoal;
    }

    // ... rest of your existing code ...

    // Keep the old method for backward compatibility
    public Goal createGoal(Goal goal, String username){
        return createGoal(goal, username, null);
    }

    public List<Goal> getAllUserGoals(String username){
        System.out.println("GoalService.getAllUserGoals called for username: " + username);
        List<Goal> goals = goalRepository.findByUser_UsernameAndActiveTrue(username);
        System.out.println("Found " + goals.size() + " active goals for " + username);
        if (goals.isEmpty()) {
            System.out.println("WARNING: No active goals found. This could mean:");
            System.out.println("  1. User has no goals");
            System.out.println("  2. Goals have NULL user_id (orphaned from migration)");
            System.out.println("  3. All goals are inactive");
        }
        return goals;
    }

    public List<Goal> getCompletedUserGoals(String username){
        System.out.println("GoalService.getCompletedUserGoals called for username: " + username);
        List<Goal> goals = goalRepository.findByUser_UsernameAndActiveFalse(username);
        System.out.println("Found " + goals.size() + " completed goals for " + username);
        return goals;
    }

    public List<Goal> getAllGoalsSortedByLatest() {
        return goalRepository.findAllByOrderByCreatedAtDesc();
    }

    public Goal getGoalById(Long goalId,String username){
        return goalRepository.findByIdAndUser_Username(goalId,username).orElseThrow(()-> new RuntimeException("Goal not found with id: " + goalId));
    }

    @Transactional
    public void updateGoalCategory(Long goalId, Long categoryId, String username) {
        Goal goal = goalRepository.findByIdAndUser_Username(goalId, username)
                .orElseThrow(() -> new RuntimeException("Goal not found for user: " + username));

        if (categoryId != null) {
            GoalCategory category = goalCategoryService.getCategoryById(categoryId);
            goal.setCategory(category);
            goalRepository.save(goal);
            System.out.println("Updated goal " + goalId + " category to: " + category.getName());
        }
    }

    @Transactional
    public Goal updateGoal(Long goalId, String title, Integer targetDays, Long categoryId, String username) {
        Goal goal = goalRepository.findByIdAndUser_Username(goalId, username)
                .orElseThrow(() -> new RuntimeException("Goal not found or you don't have permission to edit it"));

        if (title != null && !title.trim().isEmpty()) {
            goal.setTitle(title);
        }

        if (targetDays != null && targetDays > 0) {
            goal.setTargetDays(targetDays);
        }

        if (categoryId != null) {
            GoalCategory category = goalCategoryService.getCategoryById(categoryId);
            goal.setCategory(category);
        }

        return goalRepository.save(goal);
    }

    @Transactional
    public void incrementStreak(Long goalId, String username) {
        System.out.println("=== INCREMENT STREAK CALLED ===");
        System.out.println("Goal ID: " + goalId + " | Username: " + username);

        Goal activeGoal = goalRepository.findByIdAndUser_Username(goalId, username)
                .orElseThrow(() -> new RuntimeException("Active goal not found for user: " + username));

        System.out.println("Goal found: " + activeGoal.getTitle());
        System.out.println("Current Streak BEFORE: " + activeGoal.getCurrentStreak());
        System.out.println("Target Days: " + activeGoal.getTargetDays());
        System.out.println("Total Points BEFORE: " + activeGoal.getTotalPoints());

        int baseXP = 10;
        int streakMultiplier = 5;

        LocalDate today = LocalDate.now();
        LocalDate lastUpdate = activeGoal.getLastUpdatedDate();

        System.out.println("Today: " + today);
        System.out.println("Last Update: " + lastUpdate);

        // 1. Same-Day Check
        if (lastUpdate != null && lastUpdate.equals(today)) {
            System.out.println("SAME DAY POST - No streak increment");
            return;
        }

        // 2. Check for the gap
        if (lastUpdate != null) {
            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(lastUpdate, today);

            if (daysBetween > 1) { // They missed at least one full day
                if (activeGoal.getFreezeCount() != null && activeGoal.getFreezeCount() > 0) {
                    // --- STREAK SAVED ---
                    activeGoal.setFreezeCount(activeGoal.getFreezeCount() - 1);
                    activeGoal.setCurrentStreak(activeGoal.getCurrentStreak() + 1);
                    System.out.println("Freeze used for " + username + ". Remaining: " + activeGoal.getFreezeCount());
                } else {
                    // --- STREAK RESET ---
                    activeGoal.setCurrentStreak(1);
                    System.out.println(" No freezes left. Streak reset for " + username);
                }
            } else {
                // Normal consecutive day (+1)
                activeGoal.setCurrentStreak(activeGoal.getCurrentStreak() + 1);
            }
        } else {
            // Very first post for this goal
            activeGoal.setCurrentStreak(1);
        }
        int pointsEarned = baseXP + (activeGoal.getCurrentStreak() * streakMultiplier);
        activeGoal.setTotalPoints(activeGoal.getTotalPoints() + pointsEarned);
        String newStatus;
        boolean isWeeklyMilestone = activeGoal.getCurrentStreak() % 7 == 0;
        if (activeGoal.getTotalPoints() >= 1000) {
            newStatus = "Legendary";
        } else if (activeGoal.getTotalPoints() >= 500) {
            newStatus = "Consistent";
        } else if (activeGoal.getTotalPoints() >= 100) {
            newStatus = "Novice";
        } else {
            newStatus = "Beginner";
        }
        if (isWeeklyMilestone) {
            int milestoneBonus = 100;
            activeGoal.setTotalPoints(activeGoal.getTotalPoints() + milestoneBonus);
            System.out.println("WEEKLY MILESTONE REACHED! +100 XP Bonus");
        }
        // Check if the status is actually changing
        if (!newStatus.equals(activeGoal.getStreakStatus())) {
            System.out.println(" LEVEL UP! " + username + " is now a " + newStatus + "! ");
            activeGoal.setStreakStatus(newStatus);
        }

        System.out.println("XP Earned for " + username + ": " + pointsEarned);
        System.out.println("XP Earned for " + username + ": " + pointsEarned + " | New Status: " + newStatus);


        activeGoal.setLastUpdatedDate(today);

        // 3. Completion Check - Mark as completed when target is reached
        boolean justCompleted = false;
        if (activeGoal.getCurrentStreak().equals(activeGoal.getTargetDays())) {
            activeGoal.setActive(false);
            justCompleted = true;
            GoalHistory history = new GoalHistory();
            history.setUsername(activeGoal.getUser().getUsername());
            history.setTitle(activeGoal.getTitle());
            history.setFinalStreak(activeGoal.getCurrentStreak());
            history.setTitle(activeGoal.getTitle() + " [" + newStatus + "]");
            history.setCompletedDate(today);
            goalHistoryRepository.save(history);
            System.out.println("🎉 CHAMPION! " + username + " completed their goal '" + activeGoal.getTitle() + "' as a " + newStatus);
        }
        //update longest streak
        if (activeGoal.getLongestStreak() == null || activeGoal.getCurrentStreak() > activeGoal.getLongestStreak()) {
            activeGoal.setLongestStreak(activeGoal.getCurrentStreak());
            System.out.println(" New Personal Best for " + username + ": " + activeGoal.getLongestStreak());
        }
        // Check for Monthly Milestone - 30 Days
        if (activeGoal.getCurrentStreak() % 30 == 0) {
            activeGoal.setFreezeCount(activeGoal.getFreezeCount() + 1);
            System.out.println(" MONTHLY REWARD: +1 Streak Freeze earned for " + username);
        }

        //heatmap calendar
        if (!activeGoal.getCheckinDates().contains(today)) {
            activeGoal.getCheckinDates().add(today);
        }

        System.out.println("=== SAVING GOAL ===");
        System.out.println("Current Streak AFTER: " + activeGoal.getCurrentStreak());
        System.out.println("Total Points AFTER: " + activeGoal.getTotalPoints());
        System.out.println("Streak Status: " + activeGoal.getStreakStatus());
        System.out.println("Active: " + activeGoal.isActive());

        Goal savedGoal = goalRepository.save(activeGoal);
        entityManager.flush(); // Force immediate database write
        entityManager.refresh(savedGoal); // Refresh from database to confirm

        System.out.println("=== GOAL SAVED SUCCESSFULLY ===");
        System.out.println("Saved - Current Streak: " + savedGoal.getCurrentStreak());
        System.out.println("Saved - Total Points: " + savedGoal.getTotalPoints());
        System.out.println("============================");
    }

    public void deleteGoal(Long id, String username) {
        // Check if the goal exists and belongs to the user
        Goal goal = goalRepository.findByIdAndUser_Username(id, username)
                .orElseThrow(() -> new RuntimeException("Goal not found or you don't have permission to delete it"));

        goalRepository.delete(goal);
    }
    public int getXPToNextRank(int currentPoints) {
        if (currentPoints < 100) return 100 - currentPoints;   // To Novice
        if (currentPoints < 500) return 500 - currentPoints;   // To Consistent
        if (currentPoints < 1000) return 1000 - currentPoints; // To Legendary
        return 0; // Already Legendary
    }
    public double calculateCompletionPercentage(int currentStreak, int targetDays) {
        if (targetDays <= 0) return 0.0;
        double progress = ((double) currentStreak / targetDays) * 100;
        return Math.round(progress * 100.0) / 100.0; // Rounds to 2 decimal places
    }
    public long getRecentActivityCount(Goal activeGoal) {
        LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);
        return activeGoal.getCheckinDates().stream()
                .filter(date -> !date.isBefore(sevenDaysAgo))
                .count();
    }

}