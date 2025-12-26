package com.streak.gamification.services;

import com.streak.gamification.entities.Goal;
import com.streak.gamification.entities.GoalHistory;
import com.streak.gamification.repositories.GoalHistoryRepository;
import com.streak.gamification.repositories.GoalRepository;
import lombok.Lombok;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;


@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final GoalHistoryRepository goalHistoryRepository;

    public Goal createGoal(Goal goal){
        goalRepository.findByUsernameAndActiveTrue(goal.getUsername()).ifPresent(existing->{
            throw new RuntimeException("You already have an active challenge! Finish it first.");

        });
        return goalRepository.save(goal);
    }
    public Goal getActiveGoal(String username){
        return goalRepository.findByUsernameAndActiveTrue(username).orElseThrow(()-> new RuntimeException("No active goal found for this user."));
    }
    @Transactional // Line 1: Ensures DB changes are committed safely
    public void incrementStreak(String username) {

        goalRepository.findByUsernameAndActiveTrue(username).ifPresent(activeGoal -> {

            LocalDate today = LocalDate.now();
            LocalDate lastUpdate = activeGoal.getLastUpdatedDate();

            // Line 3: Check if the user already incremented their streak today
            if (lastUpdate != null && lastUpdate.equals(today)) {
                System.out.println("Streak already updated today for: " + username);
                return; // Line 4: Stop here! No double-counting
            }

            // Line 5: Check if the streak is broken (gap > 1 day)
            if (lastUpdate != null && java.time.temporal.ChronoUnit.DAYS.between(lastUpdate, today) > 1) {
                System.out.println("Streak broken for: " + username + ". Resetting to 1.");
                activeGoal.setCurrentStreak(1); // Line 6: Reset to 1 because they are active today
            } else {
                // Line 7: Normal increment (Yesterday was their last post, or this is the first one)
                activeGoal.setCurrentStreak(activeGoal.getCurrentStreak() + 1);
            }

            // Line 8: Update the timestamp to today
            activeGoal.setLastUpdatedDate(today);

            // Line 9: Check if the user reached their goal target
            if (activeGoal.getCurrentStreak().equals(activeGoal.getTargetDays())) {
                activeGoal.setActive(false);
                GoalHistory history = new GoalHistory();
                history.setUsername(activeGoal.getUsername());
                history.setTitle(activeGoal.getTitle());
                history.setFinalStreak(activeGoal.getCurrentStreak());
                history.setCompletedDate(LocalDate.from(LocalDate.now().atStartOfDay()));
                goalHistoryRepository.save(history);//goalcompleted

                System.out.println("Trophy earned for: " + username);
            }

            // Line 11: Save the updated state to PostgreSQL
            goalRepository.save(activeGoal);
        });
    }
    public void deleteGoal(Long id) {
        // Check if the goal exists before trying to delete
        if (!goalRepository.existsById(id)) {
            throw new RuntimeException("Goal not found with id: " + id);
        }
        goalRepository.deleteById(id);
    }


}
