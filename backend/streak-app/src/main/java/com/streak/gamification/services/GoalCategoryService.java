package com.streak.gamification.services;

import com.streak.gamification.entities.GoalCategory;
import com.streak.gamification.repositories.GoalCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalCategoryService {
    
    private final GoalCategoryRepository goalCategoryRepository;

    public List<GoalCategory> getAllCategories() {
        return goalCategoryRepository.findAll();
    }

    public GoalCategory getCategoryById(Long id) {
        return goalCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal category not found with id: " + id));
    }

    public GoalCategory getCategoryByName(String name) {
        return goalCategoryRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Goal category not found: " + name));
    }

    public GoalCategory createCategory(GoalCategory category) {
        if (goalCategoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("Goal category already exists: " + category.getName());
        }
        return goalCategoryRepository.save(category);
    }
}
