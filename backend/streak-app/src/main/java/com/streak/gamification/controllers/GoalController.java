package com.streak.gamification.controllers;


import com.streak.gamification.entities.Goal;
import com.streak.gamification.services.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor

public class GoalController {
    private final GoalService goalService;

    @PostMapping
    public ResponseEntity<Goal> createGoal(@RequestBody Goal goal) {
        return ResponseEntity.ok(goalService.createGoal(goal));
    }
    @GetMapping("/active/{username}")
    public ResponseEntity<Goal> getActiveGoal(@PathVariable String username) {
        return ResponseEntity.ok(goalService.getActiveGoal(username));
    }
    //deletegoal
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.ok("Goal deleted successfully");
    }

    //Qstash
    @PostMapping("/streak-update")
    public ResponseEntity<Void> receiveStreakUpdate(@RequestBody String username) {
        System.out.println("Received streak update request for: " + username);
        goalService.incrementStreak(username);
        return ResponseEntity.ok().build();
    }

}
