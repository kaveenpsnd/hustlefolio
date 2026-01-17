package com.streak.gamification.controllers;


import com.streak.gamification.dtos.CreateGoalRequest;
import com.streak.gamification.entities.Goal;
import com.streak.gamification.services.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor

public class GoalController {
    private final GoalService goalService;

    @PostMapping
    public ResponseEntity<?> createGoal(@RequestBody CreateGoalRequest request) {
        try {
            // Get username from authenticated user (JWT token)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            System.out.println("Creating goal for authenticated user: " + username);
            System.out.println("Goal title: " + request.getTitle());
            System.out.println("Target days from request: " + request.getTargetDays());
            
            Goal goal = new Goal();
            goal.setTitle(request.getTitle());
            goal.setTargetDays(request.getTargetDays());
            goal.setCurrentStreak(request.getCurrentStreak() != null ? request.getCurrentStreak() : 0);
            
            System.out.println("Goal targetDays before save: " + goal.getTargetDays());
            
            Goal created = goalService.createGoal(goal, username, request.getCategoryId());
            
            System.out.println("Goal targetDays after save: " + created.getTargetDays());
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            System.err.println("Error creating goal: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/active/{username}")
    public ResponseEntity<List<Goal>> getAllUserGoals(@PathVariable String username) {
        return ResponseEntity.ok(goalService.getAllUserGoals(username));
    }
    
    @GetMapping("/public/latest")
    public ResponseEntity<List<Goal>> getAllGoalsSortedByLatest() {
        return ResponseEntity.ok(goalService.getAllGoalsSortedByLatest());
    }

    @GetMapping("/{goalId}/{username}")
    public ResponseEntity<Goal> getGoalById(@PathVariable Long goalId, @PathVariable String username) {
        return ResponseEntity.ok(goalService.getGoalById(goalId, username));
    }

    //deletegoal
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoal(@PathVariable Long id) {
        try {
            // Get username from authenticated user (JWT token)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            goalService.deleteGoal(id, username);
            return ResponseEntity.ok("Goal deleted successfully");
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Update goal
    @PutMapping("/{id}")
    public ResponseEntity<?> updateGoal(@PathVariable Long id, @RequestBody CreateGoalRequest request) {
        try {
            // Get username from authenticated user (JWT token)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            System.out.println("Updating goal " + id + " for user: " + username);
            Goal updated = goalService.updateGoal(id, request.getTitle(), request.getTargetDays(), request.getCategoryId(), username);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            System.err.println("Error updating goal: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    //dashboard call - updated to work with multiple goals
    @GetMapping("/dashboard/{username}")
    public ResponseEntity<Map<String, Object>> getUserDashboard(@PathVariable String username) {
        try {
            System.out.println("Dashboard request for username: " + username);
            List<Goal> activeGoals = goalService.getAllUserGoals(username);
            List<Goal> completedGoals = goalService.getCompletedUserGoals(username);
            System.out.println("Found " + activeGoals.size() + " active goals for " + username);
            System.out.println("Found " + completedGoals.size() + " completed goals for " + username);

            // Calculate aggregate total XP from all goals (active + completed)
            int totalXP = 0;
            int maxCurrentStreak = 0;
            int maxLongestStreak = 0;
            String highestRank = "Beginner";
            
            // Sum XP from active goals
            for (Goal goal : activeGoals) {
                totalXP += (goal.getTotalPoints() != null ? goal.getTotalPoints() : 0);
                if (goal.getCurrentStreak() != null && goal.getCurrentStreak() > maxCurrentStreak) {
                    maxCurrentStreak = goal.getCurrentStreak();
                }
                if (goal.getLongestStreak() != null && goal.getLongestStreak() > maxLongestStreak) {
                    maxLongestStreak = goal.getLongestStreak();
                }
                // Track highest rank
                if (goal.getStreakStatus() != null) {
                    highestRank = getHigherRank(highestRank, goal.getStreakStatus());
                }
            }
            
            // Sum XP from completed goals
            for (Goal goal : completedGoals) {
                totalXP += (goal.getTotalPoints() != null ? goal.getTotalPoints() : 0);
                if (goal.getLongestStreak() != null && goal.getLongestStreak() > maxLongestStreak) {
                    maxLongestStreak = goal.getLongestStreak();
                }
            }
            
            // Calculate XP to next rank based on total XP
            int xpToNextRank = goalService.getXPToNextRank(totalXP);
            
            // Determine overall rank based on total XP
            String overallRank;
            if (totalXP >= 1000) {
                overallRank = "LEGENDARY";
            } else if (totalXP >= 500) {
                overallRank = "PLATINUM";
            } else if (totalXP >= 100) {
                overallRank = "GOLD";
            } else if (totalXP >= 50) {
                overallRank = "SILVER";
            } else {
                overallRank = "BRONZE";
            }

            // Calculate aggregate stats or return all goals
            Map<String, Object> dashboard = new HashMap<>();
            dashboard.put("activeGoals", activeGoals);
            dashboard.put("completedGoals", completedGoals);
            dashboard.put("hasActiveGoal", !activeGoals.isEmpty());
            dashboard.put("goalCount", activeGoals.size());
            dashboard.put("completedGoalCount", completedGoals.size());
            
            // Add XP and rank data
            dashboard.put("totalXP", totalXP);
            dashboard.put("xpToNextRank", xpToNextRank);
            dashboard.put("rank", overallRank);
            dashboard.put("currentStreak", maxCurrentStreak);
            dashboard.put("longestStreak", maxLongestStreak);
            
            System.out.println("Total XP: " + totalXP + " | XP to next: " + xpToNextRank + " | Rank: " + overallRank);

            if (activeGoals.isEmpty() && completedGoals.isEmpty()) {
                dashboard.put("message", "Time to start a new journey!");
            }

            System.out.println("Returning dashboard with " + activeGoals.size() + " active and " + completedGoals.size() + " completed goals");
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            System.err.println("Error in getUserDashboard: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    // Helper method to determine higher rank
    private String getHigherRank(String rank1, String rank2) {
        Map<String, Integer> rankOrder = new HashMap<>();
        rankOrder.put("Beginner", 0);
        rankOrder.put("Novice", 1);
        rankOrder.put("Consistent", 2);
        rankOrder.put("Legendary", 3);
        
        int order1 = rankOrder.getOrDefault(rank1, 0);
        int order2 = rankOrder.getOrDefault(rank2, 0);
        
        return order1 >= order2 ? rank1 : rank2;
    }

}
