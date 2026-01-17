package com.streak.posts.repositories;

import com.streak.posts.entities.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByAuthorUsernameOrderByCreatedAtDesc(String authorUsername);
    List<Post> findByGoalIdOrderByCreatedAtDesc(Long goalId);
    List<Post> findAllByOrderByCreatedAtDesc();
    List<Post> findByCategoryIdOrderByCreatedAtDesc(Long categoryId);
}