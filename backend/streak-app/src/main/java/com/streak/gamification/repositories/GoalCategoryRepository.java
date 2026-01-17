package com.streak.gamification.repositories;

import com.streak.gamification.entities.GoalCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GoalCategoryRepository extends JpaRepository<GoalCategory, Long> {
    Optional<GoalCategory> findByName(String name);
    Optional<GoalCategory> findBySlug(String slug);
    boolean existsByName(String name);
}
