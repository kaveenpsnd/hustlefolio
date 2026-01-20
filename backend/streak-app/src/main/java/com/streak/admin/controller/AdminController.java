package com.streak.admin.controller;

import com.streak.auth.dtos.UserProfileResponse;
import com.streak.auth.service.UserService;
import com.streak.posts.service.PostService;
import com.streak.gamification.services.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final PostService postService;
    private final GoalService goalService;

    @GetMapping("/stats")
    public ResponseEntity<?> getGlobalStats() {
        System.out.println("AdminController: Stats requested");
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", userService.getUserCount());
            stats.put("totalPosts", postService.getAllPosts().size());
            stats.put("totalGoals", goalService.getGoalCount());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching stats: " + e.getMessage());
        }
    }

    // --- User Management ---

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        System.out.println("AdminController: User list requested");
        try {
            return ResponseEntity.ok(userService.getAllUsers());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching users: " + e.getMessage());
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        System.out.println("AdminController: Delete user requested for " + id);
        try {
            userService.deleteUserById(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error deleting user: " + e.getMessage());
        }
    }

    // --- Content Management ---

    // Note: Post deletion usually checks for ownership.
    // Admin needs a way to delete ANY post.
    // If PostService.deletePost checks username, we might need a separate service
    // method 'adminDeletePost'.
    // For V1, we will skip implementation or use brute force if service allows.
    // For now, let's just expose Users and Stats.
}
