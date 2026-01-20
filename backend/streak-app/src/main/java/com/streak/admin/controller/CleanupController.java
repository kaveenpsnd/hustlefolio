package com.streak.admin.controller;

import com.streak.posts.repositories.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cleanup")
@RequiredArgsConstructor
public class CleanupController {

    private final PostRepository postRepository;
    private static final String ADMIN_SECRET = "SUPER_ADMIN_SECRET_2026";

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<String> deletePostForce(
            @PathVariable Long id,
            @RequestParam String secret) {

        if (!ADMIN_SECRET.equals(secret)) {
            return ResponseEntity.status(403).body("Invalid Secret Key");
        }

        if (postRepository.existsById(id)) {
            postRepository.deleteById(id);
            return ResponseEntity.ok("Post " + id + " deleted successfully (Force Cleanup)");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/posts/all-by-user")
    public ResponseEntity<String> deleteAllUserPosts(
            @RequestParam String username,
            @RequestParam String secret) {

        if (!ADMIN_SECRET.equals(secret)) {
            return ResponseEntity.status(403).body("Invalid Secret Key");
        }

        // This is a direct repository call, might miss cascading deletes (goals, etc)
        // if not configured in DB, but good enough for 'unwanted posts'.
        long count = postRepository.deleteByAuthorUsername(username);
        return ResponseEntity.ok("Deleted " + count + " posts for user: " + username);
    }
}
