package com.streak.posts.service;

import com.streak.exception.GoalRequiredException;
import com.streak.gamification.repositories.GoalRepository;
import com.streak.gamification.services.GoalService;
import com.streak.posts.entities.Post;
import com.streak.posts.repositories.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final PostEventProducer postEventProducer;
    private final GoalService goalService;
    private final GoalRepository goalRepository;

    public Post createPost(Post post) {

        //savingpost

        //goal check
        if (!goalRepository.existsByUsernameAndActiveTrue(post.getAuthorUsername())) {
            throw new GoalRequiredException("Please create an active goal before posting.");
        }
        //savepost
        Post savedPost = postRepository.save(post);
        //sending the notification
        postEventProducer.publishPostCreated(savedPost.getAuthorUsername());


        return savedPost;







    }
    public List<Post> getAllPosts(){
        return postRepository.findAll();
    }
    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
    }
    public void deletePost(Long id) {
        postRepository.findById(id).orElseThrow(() ->
                new RuntimeException("Post not found with id: " + id));

        postRepository.deleteById(id);
    }

    public Post updatePost(Long id, Post postDetails){
        Post post = getPostById(id);
        post.setTitle(postDetails.getTitle());
        post.setContent(postDetails.getContent());
        post.setImageUrl(postDetails.getImageUrl());
        return postRepository.save(post);

    }







}