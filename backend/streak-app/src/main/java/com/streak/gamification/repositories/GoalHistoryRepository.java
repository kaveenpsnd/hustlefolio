package com.streak.gamification.repositories;

import com.streak.gamification.entities.Goal;
import com.streak.gamification.entities.GoalHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GoalHistoryRepository extends JpaRepository<GoalHistory, Long> {
    List<GoalHistory> findByUsernameOrderByCompletedDateDesc(String username);

}

