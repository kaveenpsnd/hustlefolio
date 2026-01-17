package com.streak.posts.service;

import com.streak.exception.GoalRequiredException;
import com.streak.gamification.services.GoalService;
import com.streak.posts.entities.Post;
import com.streak.posts.repositories.PostRepository;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final PostEventProducer postEventProducer;
    private final GoalService goalService;

    public Post createPost(Post post) {
        //sanitizingcontent
        String sanitizedContent = sanitizeJsonBlocks(post.getContent());
        post.setContent(sanitizedContent);

        //savingpost

        //goal check - verify the specific goal exists and is active
        if (post.getGoalId() == null) {
            throw new GoalRequiredException("Please select a goal before posting.");
        }

        // Verify the goal exists and belongs to the user
        try {
            goalService.getGoalById(post.getGoalId(), post.getAuthorUsername());
        } catch (RuntimeException e) {
            throw new GoalRequiredException("Invalid goal. Please select an active goal.");
        }

        //savepost
        Post savedPost = postRepository.save(post);
        
        System.out.println("=== POST SAVED ===");
        System.out.println("Post ID: " + savedPost.getId());
        System.out.println("Post Title: " + savedPost.getTitle());
        System.out.println("Goal ID: " + savedPost.getGoalId());
        System.out.println("Author: " + savedPost.getAuthorUsername());
        
        // Auto-assign post's category to the goal if post has a category
        if (savedPost.getCategory() != null && savedPost.getCategory().getId() != null) {
            try {
                goalService.updateGoalCategory(savedPost.getGoalId(), savedPost.getCategory().getId(), savedPost.getAuthorUsername());
            } catch (Exception e) {
                System.err.println("Failed to update goal category: " + e.getMessage());
                // Don't fail the post creation if category update fails
            }
        }
        
        // Update streak for the specific goal (synchronous)
        System.out.println("=== CALLING INCREMENT STREAK ===");
        goalService.incrementStreak(savedPost.getGoalId(), savedPost.getAuthorUsername());
        System.out.println("=== INCREMENT STREAK COMPLETED ===");

        //sending the notification
        postEventProducer.publishPostCreated(savedPost.getAuthorUsername());

        return savedPost;
    }

    public List<Post> getAllPosts(){
        return postRepository.findAll();
    }
    
    public List<Post> getAllPostsSortedByLatest() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }
    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
    }
    
    public List<Post> getPostsByUsername(String username) {
        return postRepository.findByAuthorUsernameOrderByCreatedAtDesc(username);
    }

    public List<Post> getPostsByGoalId(Long goalId) {
        return postRepository.findByGoalIdOrderByCreatedAtDesc(goalId);
    }
    
    public List<Post> getPostsByCategoryId(Long categoryId) {
        return postRepository.findByCategoryIdOrderByCreatedAtDesc(categoryId);
    }
    
    public void deletePost(Long id, String username) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));

        // Verify the post belongs to the authenticated user
        if (!post.getAuthorUsername().equals(username)) {
            throw new RuntimeException("You don't have permission to delete this post");
        }

        postRepository.delete(post);
    }

    public Post updatePost(Long id, Post postDetails, String username){
        Post post = getPostById(id);

        // Verify the post belongs to the authenticated user
        if (!post.getAuthorUsername().equals(username)) {
            throw new RuntimeException("You don't have permission to update this post");
        }

        post.setTitle(postDetails.getTitle());
        post.setContent(postDetails.getContent());
        post.setImageUrl(postDetails.getImageUrl());
        return postRepository.save(post);

    }
    public String sanitizeJsonBlocks(String dirtyJson) {
        return Jsoup.clean(dirtyJson, Safelist.relaxed());
    }
}


