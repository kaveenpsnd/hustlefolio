package com.streak.posts.controller;

import com.streak.posts.entities.Post;
import com.streak.posts.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        // Get username from authenticated user (JWT token)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();

        // Override the authorUsername with the authenticated user's username for security
        post.setAuthorUsername(authenticatedUsername);

        return ResponseEntity.ok(postService.createPost(post));
    }
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts(){
        return ResponseEntity.ok(postService.getAllPosts());
    }
    
    @GetMapping("/public/latest")
    public ResponseEntity<List<Post>> getAllPostsSortedByLatest() {
        return ResponseEntity.ok(postService.getAllPostsSortedByLatest());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }
    
    @GetMapping("/user/{username}")
    public ResponseEntity<List<Post>> getPostsByUsername(@PathVariable String username) {
        System.out.println("GET /api/posts/user/" + username + " called");
        try {
            List<Post> posts = postService.getPostsByUsername(username);
            System.out.println("Found " + posts.size() + " posts for user: " + username);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            System.err.println("Error fetching posts for user " + username + ": " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/goal/{goalId}")
    public ResponseEntity<List<Post>> getPostsByGoalId(@PathVariable Long goalId) {
        System.out.println("GET /api/posts/goal/" + goalId + " called");
        try {
            List<Post> posts = postService.getPostsByGoalId(goalId);
            System.out.println("Found " + posts.size() + " posts for goal: " + goalId);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            System.err.println("Error fetching posts for goal " + goalId + ": " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Post>> getPostsByCategoryId(@PathVariable Long categoryId) {
        System.out.println("GET /api/posts/category/" + categoryId + " called");
        try {
            List<Post> posts = postService.getPostsByCategoryId(categoryId);
            System.out.println("Found " + posts.size() + " posts for category: " + categoryId);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            System.err.println("Error fetching posts for category " + categoryId + ": " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id){
        try {
            // Get username from authenticated user (JWT token)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            postService.deletePost(id, username);
            return ResponseEntity.ok("Post deleted successfully with id:"+id);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody Post postDetails){
        try {
            // Get username from authenticated user (JWT token)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            Post updated = postService.updatePost(id, postDetails, username);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}