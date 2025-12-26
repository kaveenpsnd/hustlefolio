package com.streak.gamification.repositories;

import com.streak.gamification.entities.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GoalRepository extends JpaRepository<Goal, Long> {

    Optional<Goal> findByUsernameAndActiveTrue(String username);

    boolean existsByUsernameAndActiveTrue(String username);
}