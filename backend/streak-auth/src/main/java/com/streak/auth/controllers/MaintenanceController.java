package com.streak.auth.controllers;

import com.streak.auth.repositories.UserRepository;
import com.streak.posts.repositories.PostRepository;
import com.streak.gamification.repositories.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final GoalRepository goalRepository;

    private static final String CLEANUP_SECRET = "CLEANUP_SECRET_2026";

    @DeleteMapping("/cleanup-all")
    public ResponseEntity<String> cleanupAllData(@RequestParam String secret) {
        if (!CLEANUP_SECRET.equals(secret)) {
            return ResponseEntity.status(403).body("Invalid secret key");
        }

        try {
            // Delete in order to respect foreign key constraints
            long postsDeleted = postRepository.count();
            postRepository.deleteAll();

            long goalsDeleted = goalRepository.count();
            goalRepository.deleteAll();

            long usersDeleted = userRepository.count();
            userRepository.deleteAll();

            String message = String.format(
                    "✅ Database cleaned successfully!\n" +
                            "Deleted: %d users, %d posts, %d goals",
                    usersDeleted, postsDeleted, goalsDeleted);

            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
