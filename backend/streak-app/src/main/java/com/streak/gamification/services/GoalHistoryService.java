package com.streak.gamification.services;

import com.streak.gamification.entities.GoalHistory;
import com.streak.gamification.repositories.GoalHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalHistoryService {

    private final GoalHistoryRepository goalHistoryRepository;

    // Line 1: Logic to fetch history
    public List<GoalHistory> getUserHistory(String username) {
        return goalHistoryRepository.findByUsernameOrderByCompletedDateDesc(username);
    }

    // Line 2: Logic to delete a trophy
    public void deleteHistoryRecord(Long id) {
        if (!goalHistoryRepository.existsById(id)) {
            throw new RuntimeException("Trophy not found");
        }
        goalHistoryRepository.deleteById(id);
    }
}