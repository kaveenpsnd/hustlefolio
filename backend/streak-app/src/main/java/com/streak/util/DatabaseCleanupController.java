package com.streak.util;

import com.streak.auth.repositories.UserRepository;
import com.streak.posts.repositories.PostRepository;
import com.streak.gamification.repositories.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/database")
@RequiredArgsConstructor
public class DatabaseCleanupController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final GoalRepository goalRepository;

    private static final String CLEANUP_SECRET = "CLEANUP_SECRET_2026";

    @DeleteMapping("/cleanup-all")
    @Transactional
    public ResponseEntity<?> cleanupAllData(@RequestParam String secret) {
        if (!CLEANUP_SECRET.equals(secret)) {
            return ResponseEntity.status(403).body("Invalid secret key");
        }

        Map<String, Object> result = new HashMap<>();

        try {
            // Count before deletion
            long usersBefore = userRepository.count();
            long postsBefore = postRepository.count();
            long goalsBefore = goalRepository.count();

            // Delete all data (order matters due to foreign keys)
            postRepository.deleteAll();
            goalRepository.deleteAll();
            userRepository.deleteAll();

            // Count after deletion
            long usersAfter = userRepository.count();
            long postsAfter = postRepository.count();
            long goalsAfter = goalRepository.count();

            result.put("success", true);
            result.put("deleted", Map.of(
                    "users", usersBefore - usersAfter,
                    "posts", postsBefore - postsAfter,
                    "goals", goalsBefore - goalsAfter));
            result.put("remaining", Map.of(
                    "users", usersAfter,
                    "posts", postsAfter,
                    "goals", goalsAfter));
            result.put("message", "Database cleaned successfully!");

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }
}
