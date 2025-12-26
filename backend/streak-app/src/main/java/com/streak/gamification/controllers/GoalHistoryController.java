package com.streak.gamification.controllers;

import com.streak.gamification.entities.GoalHistory;
import com.streak.gamification.repositories.GoalHistoryRepository;
import com.streak.gamification.services.GoalHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals/history")
@RequiredArgsConstructor
public class GoalHistoryController {
    private final GoalHistoryService goalHistoryService;

    @GetMapping("/{username}")
    public List<GoalHistory> getHistory(@PathVariable String username){
        return goalHistoryService.getUserHistory(username);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistory(@PathVariable Long id) {
        goalHistoryService.deleteHistoryRecord(id);
        return ResponseEntity.noContent().build();
    }

}
