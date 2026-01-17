package com.streak.gamification.repositories;

import com.streak.gamification.entities.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findByUser_UsernameAndActiveTrue(String username);
    
    List<Goal> findByUser_UsernameAndActiveFalse(String username);

    boolean existsByUser_UsernameAndActiveTrue(String username);

    Optional<Goal> findByIdAndUser_Username(Long id, String username);

    List<Goal> findAllByActiveTrue();

    @Query("SELECT g FROM Goal g ORDER BY g.createdAt DESC")
    List<Goal> findAllByOrderByCreatedAtDesc();
}